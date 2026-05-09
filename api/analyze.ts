import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ALLOWED_ORIGIN = 'https://kreditvakt.com';

const hasUpstash = !!process.env.UPSTASH_REDIS_REST_URL
                && !!process.env.UPSTASH_REDIS_REST_TOKEN;
if (!hasUpstash && process.env.NODE_ENV === 'production') {
  throw new Error(
    'Upstash credentials missing in production — refusing to start. ' +
    'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel.'
  );
}

let ratelimit: Ratelimit | null = null;
let redis: Redis | null = null;
if (hasUpstash) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'kreditvakt:rl',
  });
}

// ── Demo allowlist ───────────────────────────────────────────────
// Only these fictional orgnrs get synthetic Anthropic reports on the free tier.
// Real orgnrs (anything not in this set) receive a "create account" gate response.
const DEMO_ORGNRS = new Set([
  '5500000001', // Testbolaget Stockholm AB
  '5500000002', // Demobolag Sverige AB
  '5500000003', // Konkursfirman Avveckling AB
  '5500000004', // Fiktivt Handels AB
  '5500000005', // Exempelföretaget Norr AB
  '5500000006', // Provobolaget Sverige AB
]);

const DEMO_COMPANY_NAMES: Record<string, string> = {
  '5500000001': 'Testbolaget Stockholm AB',
  '5500000002': 'Demobolag Sverige AB',
  '5500000003': 'Konkursfirman Avveckling AB',
  '5500000004': 'Fiktivt Handels AB',
  '5500000005': 'Exempelföretaget Norr AB',
  '5500000006': 'Provobolaget Sverige AB',
};

function normalizeOrgnr(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12) return digits.slice(2);
  if (digits.length === 10) return digits;
  return null;
}

function isValidOrgnrFormat(digits: string): boolean {
  return digits.length === 10 && digits[0] !== '0';
}

// ── Error taxonomy ───────────────────────────────────────────────
const ERR = {
  RATE_LIMITED:          'RATE_LIMITED',
  ANTHROPIC_RATE_LIMIT:  'ANTHROPIC_RATE_LIMIT',
  ANTHROPIC_AUTH:        'ANTHROPIC_AUTH',
  ANTHROPIC_UNAVAILABLE: 'ANTHROPIC_UNAVAILABLE',
  BAD_INPUT:             'BAD_INPUT',
  CIRCUIT_OPEN:          'CIRCUIT_OPEN',
  INTERNAL:              'INTERNAL',
} as const;
type ErrCode = typeof ERR[keyof typeof ERR];

const ERR_RESPONSE: Record<ErrCode, { status: number; message: string }> = {
  RATE_LIMITED:          { status: 429, message: 'För många förfrågningar. Försök igen om en minut.' },
  ANTHROPIC_RATE_LIMIT:  { status: 429, message: 'Sökmotorn är belastad. Försök igen om 30 sekunder.' },
  ANTHROPIC_AUTH:        { status: 503, message: 'Sökmotorn är felkonfigurerad. Kontakta hej@norric.io.' },
  ANTHROPIC_UNAVAILABLE: { status: 503, message: 'Sökmotorn är tillfälligt otillgänglig. Försök igen om en stund.' },
  BAD_INPUT:             { status: 400, message: 'Ogiltig indata — ange ett organisationsnummer eller företagsnamn.' },
  CIRCUIT_OPEN:          { status: 503, message: 'Sökmotorn är tillfälligt begränsad. Försök igen om 2 minuter.' },
  INTERNAL:              { status: 500, message: 'Tillfälligt fel. Försök igen om en stund.' },
};

// ── Circuit breaker (Redis-backed) ───────────────────────────────
const CB_KEY = 'kreditvakt:cb:failures';
const CB_THRESHOLD = 5;
const CB_WINDOW_SECS = 120;

async function isCircuitOpen(): Promise<boolean> {
  if (!redis) return false;
  try {
    const failures = await redis.get<number>(CB_KEY) ?? 0;
    return failures >= CB_THRESHOLD;
  } catch {
    return false;
  }
}

async function recordFailure(status: number): Promise<void> {
  if (!redis) return;
  if (status !== 429 && status < 500) return;
  try {
    const current = await redis.incr(CB_KEY);
    if (current === 1) await redis.expire(CB_KEY, CB_WINDOW_SECS);
  } catch { /* ignore */ }
}

async function recordSuccess(): Promise<void> {
  if (!redis) return;
  try { await redis.del(CB_KEY); } catch { /* ignore */ }
}

// ── Rate limiter ─────────────────────────────────────────────────
async function checkRateLimit(ip: string): Promise<boolean> {
  if (!ratelimit) return true;
  try {
    const { success } = await ratelimit.limit(ip);
    return success;
  } catch {
    return true;
  }
}

// ── Anthropic ────────────────────────────────────────────────────
const MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MAX_RETRIES = 3;
const BASE_RETRY_MS = 1000;

const SYSTEM_PROMPT = `Du är Kreditvakts signalmotor — ett professionellt insolvensanalysverktyg för svenska företag. Givet ett organisationsnummer ELLER ett företagsnamn, returnera ett realistiskt och välkalibrerat insolvensanalyssvar som JSON.

INDATA-TOLKNING (gör detta först):
- Om indata innehåller enbart siffror (10 st, med eller utan bindestreck): det är ett organisationsnummer — använd det direkt.
- Om indata är text (ett företagsnamn, t.ex. "Byggfirman Svensson AB" eller "ikea"): generera ett realistiskt svenskt organisationsnummer för det bolaget och sätt company_name till det angivna namnet. Normalisera stavning och lägg till "AB" om ingen bolagsform anges.
- Om indata matchar ett välkänt stort svenskt bolag (Ikea, Volvo, Ericsson, H&M, Skanska, Swedbank, SEB, Tele2, Vattenfall, SSAB etc.): sätt display_score till 1–3 och generera konsekvent lågrisk-data.
- Om indata är varken ett giltigt namn eller orgnr (tomt, bara specialtecken, ett enstaka slumpmässigt tecken): returnera {"error": "Kunde inte tolka indata. Ange ett organisationsnummer (t.ex. 556012-3456) eller ett företagsnamn (t.ex. Byggfirman Svensson AB)."}
- Inkludera alltid fältet search_input_type: "orgnr" | "company_name" så frontend vet hur sökningen tolkades.

REGLER FÖR SVARET:
- Svara ENBART med ett JSON-objekt. Inga backticks, inga kommentarer, inget annat.
- Variera resultaten meningsfullt baserat på orgnr eller namn — varje bolag ska kännas unikt.

POÄNGDISTRIBUTION (display_score 0–20):
Distribuera realistiskt:
  35% låg risk       → score 0–4    (stabila, välskötta bolag)
  30% måttlig risk   → score 5–8    (varningstecken finns)
  20% hög risk       → score 9–12   (aktiv signal från minst en källa)
  10% kritisk risk   → score 13–16  (multipla signaler, hög konkursrisk)
   5% akut/konkurs   → score 17–20  (konkursansökan trolig eller pågående)

SIGNALKÄLLOR (fyra oberoende datakällor — alla måste representeras):

1. SKATTEVERKET — restanslängden (skatteskuld)
   skuld_sek: 0–2 500 000 (proportionellt mot score; 0 om score < 5)
   skatteverket_published: "Ja — skuld publicerad på restanslängden" | "Nej — ej registrerad"
   skuld_published_date: ÅÅÅÅ-MM-DD (3–18 månader bakåt om skuld finns, annars null)

2. KRONOFOGDEN — betalningsförelägganden
   betalning_count: 0–12 (0 om score < 4; stiger med score)
   betalning_total_sek: 0–800 000 (summa öppna krav; 0 om betalning_count är 0)
   betalning_latest_date: ÅÅÅÅ-MM-DD (senaste ärende om count > 0, annars null)
   kronofogden_escalated: true om betalning_count >= 5 ELLER betalning_total_sek > 300 000

3. BOLAGSVERKET — ärenden (ledande indikator, före registrering)
   arende_ankommet_datum: ÅÅÅÅ-MM-DD om ärende inkommit men ej registrerat (null om score < 12)
   arende_kanal: "Digital inlämning" | "Papperspost" | null
   arende_total_avgift_sek: 0–25 000 om ärende pågår (annars null)
   arende_betalt_belopp_sek: 0–arende_total_avgift_sek (skillnad = obetald avgift = friktionssignal)
   arende_obetald: true om arende_total_avgift_sek > arende_betalt_belopp_sek (annars false)

4. BOLAGSVERKET — konkursregister (bekräftande signal)
   konkurs_filed: false om score < 18; true med 40% sannolikhet om score >= 18
   konkurs_date: ÅÅÅÅ-MM-DD om konkurs_filed = true, annars null

VARNINGSTID (lead time):
   onset_days: uppskattade dagar tills likviditetsproblem eskalerar (50–450 om score > 6, annars null)
   median_days_to_konkurs: 270–300 (aldrig lägre än 270)

ÖVRIGA FÄLT:
   orgnr: format XXXXXX-XXXX — ALLTID med
   company_name: företagets namn
   search_input_type: "orgnr" | "company_name"
   industry: En av: Bygg & Entreprenad | Transport & Logistik | Handel & Detaljhandel | Tillverkning | IT & Konsult | Fastighet | Restaurang & Bespisning | Bemanning | Vård & Omsorg | Skog & Lantbruk
   f_skatt_active: true om score < 14; false om score >= 14 med 65% sannolikhet
   org_age_years: 1–40
   registered_year: innevarande år minus org_age_years
   verdict: En professionell mening på svenska som sammanfattar riskbilden
   signal_count: antal aktiva varningssignaler (0–6)
   confidence: "låg" | "medel" | "hög" (0–1 signal = låg, 2–3 = medel, 4–6 = hög)

INTERN KONSISTENS (obligatoriska regler — bryt aldrig dessa):
- Om konkurs_filed = true → score MÅSTE vara >= 18
- Om f_skatt_active = false → score MÅSTE vara >= 11
- Om betalning_count >= 5 → score MÅSTE vara >= 9
- Om skuld_sek > 500 000 → score MÅSTE vara >= 12
- Om arende_obetald = true → score MÅSTE vara >= 10
- Om arende_ankommet_datum finns (ej null) → score MÅSTE vara >= 12
- Om score <= 4 → skuld_sek = 0, betalning_count = 0, konkurs_filed = false, f_skatt_active = true, arende_ankommet_datum = null, arende_obetald = false
- signal_count MÅSTE matcha faktiskt antal aktiva signaler i svaret
- confidence MÅSTE matcha signal_count enligt regeln ovan
- median_days_to_konkurs MÅSTE vara 270–300 (aldrig lägre än 270)
- orgnr MÅSTE alltid finnas i svaret oavsett inputtyp

Returnera nu ett JSON-objekt för det bolag som anges av användaren. Svara ENBART med giltig JSON. Inga backticks. Inget annat.`;


function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function retryDelay(attempt: number, status?: number): number {
  if (status === 429) return Math.min(BASE_RETRY_MS * Math.pow(2, attempt - 1), 8000);
  return BASE_RETRY_MS;
}

function shouldRetry(err: any, attempt: number): boolean {
  if (attempt >= MAX_RETRIES) return false;
  if (!err.status) return true;  // network error
  if (err.status === 429) return true;  // Anthropic rate limit — retry with backoff
  return err.status >= 500;
}

function classifyAnthropicError(status: number): ErrCode {
  if (status === 429) return ERR.ANTHROPIC_RATE_LIMIT;
  if (status === 401 || status === 403) return ERR.ANTHROPIC_AUTH;
  return ERR.ANTHROPIC_UNAVAILABLE;
}

function extractJson(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('No JSON object found in response');
  }
  return text.slice(start, end + 1);
}

async function callClaude(query: string, extraInstruction = ''): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error('ANTHROPIC_API_KEY not configured');
    (err as any).status = 401;
    throw err;
  }

  const userMessage = extraInstruction
    ? `${query}\n\n${extraInstruction}`
    : query;

  const resp = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    const err = new Error(`Claude API ${resp.status}: ${body}`);
    (err as any).status = resp.status;
    throw err;
  }

  const data = await resp.json();
  return data.content?.[0]?.text ?? '';
}

async function analyzeWithRetry(query: string): Promise<object> {
  let lastError: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const rawText = await callClaude(query);

      let parsed: object;
      try {
        const jsonStr = extractJson(rawText);
        parsed = JSON.parse(jsonStr);
      } catch {
        if (attempt < MAX_RETRIES) {
          const retryText = await callClaude(
            query,
            'Svara ENBART med giltig JSON. Inga backticks. Inget annat.'
          );
          const jsonStr = extractJson(retryText);
          parsed = JSON.parse(jsonStr);
        } else {
          throw new Error('JSON parse failed after retry');
        }
      }

      const p = parsed as Record<string, unknown>;
      const s = p['display_score'];
      if (typeof s !== 'number' || s < 0 || s > 20) {
        throw new Error(`display_score out of range: ${s}`);
      }

      await recordSuccess();
      return parsed;
    } catch (err: any) {
      lastError = err;
      await recordFailure(err.status ?? 0);
      if (!shouldRetry(err, attempt)) break;
      await sleep(retryDelay(attempt, err.status));
    }
  }

  throw lastError;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() ??
    req.socket.remoteAddress ??
    'unknown';

  if (!(await checkRateLimit(ip))) {
    const { status, message } = ERR_RESPONSE[ERR.RATE_LIMITED];
    return res.status(status).json({ error_code: ERR.RATE_LIMITED, error: message });
  }

  if (await isCircuitOpen()) {
    console.error(JSON.stringify({ event: 'circuit_open', ip, ts: new Date().toISOString() }));
    const { status, message } = ERR_RESPONSE[ERR.CIRCUIT_OPEN];
    return res.status(status).json({ error_code: ERR.CIRCUIT_OPEN, error: message });
  }

  const { query } = req.body ?? {};
  if (!query || typeof query !== 'string' || !query.trim()) {
    const { status, message } = ERR_RESPONSE[ERR.BAD_INPUT];
    return res.status(status).json({ error_code: ERR.BAD_INPUT, error: message });
  }

  // ── Orgnr gate: only demo allowlist gets synthetic reports ────
  // Company name queries are blocked on the free tier to prevent
  // fabricating credit risk data attached to real identifiable entities.
  const normalized = normalizeOrgnr(query.trim());
  if (!normalized || !isValidOrgnrFormat(normalized)) {
    return res.status(400).json({
      error_code: ERR.BAD_INPUT,
      error: 'Ange ett giltigt organisationsnummer (10 siffror, t.ex. 556123-4567).',
    });
  }

  if (!DEMO_ORGNRS.has(normalized)) {
    // Real orgnr — return gate response without calling Anthropic
    const formatted = `${normalized.slice(0, 6)}-${normalized.slice(6)}`;
    return res.status(200).json({
      is_real_company: true,
      orgnr: formatted,
      message: 'Bolaget är registrerat. För riktig riskbedömning, skapa konto eller boka demo.',
      cta: 'onboarding',
      cta_url: `/onboarding?tier=silver&orgnr=${normalized}`,
    });
  }

  // Demo orgnr — call Anthropic for synthetic report
  const companyName = DEMO_COMPANY_NAMES[normalized];
  const demoQuery = `${normalized} (${companyName})`;

  try {
    const result = await analyzeWithRetry(demoQuery);
    return res.status(200).json({
      ...result as object,
      _demo: true,
      _demo_label: 'EXEMPELRAPPORT — fiktivt bolag, fiktiva data.',
      company_name: companyName,
    });
  } catch (err: any) {
    const status = err.status ?? 0;
    const errCode: ErrCode = status >= 400 && status < 500
      ? classifyAnthropicError(status)
      : ERR.INTERNAL;

    console.error(JSON.stringify({
      event: 'analyze_error',
      error_code: errCode,
      http_status: status,
      message: err.message,
      ts: new Date().toISOString(),
    }));

    const resp = ERR_RESPONSE[errCode];
    return res.status(resp.status).json({ error_code: errCode, error: resp.message });
  }
}

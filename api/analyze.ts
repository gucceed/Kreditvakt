import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_ORIGIN = 'https://kreditvakt.com';
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

const ipWindows = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = ipWindows.get(ip);
  if (!window || now >= window.resetAt) {
    ipWindows.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (window.count >= RATE_LIMIT_MAX) return false;
  window.count++;
  return true;
}

const MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

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

function extractJson(text: string): string {
  // Find first { and last } — strip anything outside
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
    throw new Error('ANTHROPIC_API_KEY not configured');
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

function shouldRetry(err: any, attempt: number): boolean {
  if (attempt >= MAX_RETRIES) return false;
  // Retry on network errors or 5xx
  if (!err.status) return true;  // network-level error
  return err.status >= 500;
}

async function analyzeWithRetry(query: string): Promise<object> {
  let lastError: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const rawText = await callClaude(query);

      // Fix D — JSON parse resilience
      let parsed: object;
      try {
        const jsonStr = extractJson(rawText);
        parsed = JSON.parse(jsonStr);
      } catch {
        // Parse failed — retry with an explicit JSON instruction
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

      return parsed;
    } catch (err: any) {
      lastError = err;
      if (!shouldRetry(err, attempt)) break;
      await sleep(RETRY_DELAY_MS);
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

  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'För många förfrågningar. Försök igen om en stund.' });
  }

  const { query } = req.body ?? {};
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'query is required' });
  }

  try {
    const result = await analyzeWithRetry(query.trim());
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('analyze error:', err);
    return res.status(500).json({
      error: 'Tillfälligt fel. Försök igen om en stund.',
    });
  }
}

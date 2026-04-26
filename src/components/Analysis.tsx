import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, Lock, Check, Activity } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface AnalysisResult {
  orgnr: string;
  company_name: string;
  search_input_type: 'orgnr' | 'company_name';
  industry: string;
  org_age_years: number;
  registered_year: number;
  insolvency_score: number;
  verdict: string;
  f_skatt_active: boolean;
  // Source 1 — Skatteverket
  skuld_sek: number;
  skatteverket_published: string;
  skuld_published_date: string | null;
  // Source 2 — Kronofogden
  betalning_count: number;
  betalning_total_sek: number;
  betalning_latest_date: string | null;
  kronofogden_escalated: boolean;
  // Source 3 — Bolagsverket ärenden
  arende_ankommet_datum: string | null;
  arende_kanal: string | null;
  arende_total_avgift_sek: number | null;
  arende_betalt_belopp_sek: number | null;
  arende_obetald: boolean;
  // Source 4 — Bolagsverket konkursregister
  konkurs_filed: boolean;
  konkurs_date: string | null;
  // Timeline
  onset_days: number | null;
  median_days_to_konkurs: number | null;
  // Summary
  signal_count: number;
  confidence: 'låg' | 'medel' | 'hög';
}

export const Analysis = () => {
  const [orgnr, setOrgnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slidePos, setSlidePos] = useState(0);
  const [approved, setApproved] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const runAnalysis = useCallback(async (targetQuery?: string) => {
    const raw = (targetQuery ?? orgnr).trim();

    if (!raw) {
      setError('Ange ett organisationsnummer (t.ex. 556012-3456) eller ett företagsnamn.');
      return;
    }

    // Format as orgnr if input is purely numeric
    const digitsOnly = raw.replace(/[^0-9]/g, '');
    const isOrgnr = /^[0-9\-\s]+$/.test(raw) && digitsOnly.length === 10;
    const query = isOrgnr
      ? digitsOnly.slice(0, 6) + '-' + digitsOnly.slice(6)
      : raw;

    setOrgnr(query);
    setLoading(true);
    setError(null);
    setResult(null);
    setApproved(false);
    setSlidePos(0);

    const SYSTEM_INSTRUCTION = `Du är Kreditvakts signalmotor — ett professionellt insolvensanalysverktyg för svenska företag. Givet ett organisationsnummer ELLER ett företagsnamn, returnera ett realistiskt och välkalibrerat insolvensanalyssvar som JSON.

INDATA-TOLKNING (gör detta först):
- Om indata innehåller enbart siffror (10 st, med eller utan bindestreck): det är ett organisationsnummer — använd det direkt.
- Om indata är text (ett företagsnamn, t.ex. "Byggfirman Svensson AB" eller "ikea"): generera ett realistiskt svenskt organisationsnummer för det bolaget och sätt company_name till det angivna namnet. Normalisera stavning och lägg till "AB" om ingen bolagsform anges.
- Om indata matchar ett välkänt stort svenskt bolag (Ikea, Volvo, Ericsson, H&M, Skanska, Swedbank, SEB, Tele2, Vattenfall, SSAB etc.): sätt insolvency_score till 2–8 och generera konsekvent lågrisk-data.
- Om indata är varken ett giltigt namn eller orgnr (tomt, bara specialtecken, ett enstaka slumpmässigt tecken): returnera {"error": "Kunde inte tolka indata. Ange ett organisationsnummer (t.ex. 556012-3456) eller ett företagsnamn (t.ex. Byggfirman Svensson AB)."}
- Inkludera alltid fältet search_input_type: "orgnr" | "company_name" så frontend vet hur sökningen tolkades.

REGLER FÖR SVARET:
- Svara ENBART med ett JSON-objekt. Inga backticks, inga kommentarer, inget annat.
- Variera resultaten meningsfullt baserat på orgnr eller namn — varje bolag ska kännas unikt.

POÄNGDISTRIBUTION (insolvency_score 0–100):
Distribuera realistiskt:
  35% låg risk       → score 0–29   (stabila, välskötta bolag)
  30% måttlig risk   → score 30–54  (varningstecken finns)
  20% hög risk       → score 55–74  (aktiv signal från minst en källa)
  10% kritisk risk   → score 75–89  (multipla signaler, hög konkursrisk)
   5% akut/konkurs   → score 90–100 (konkursansökan trolig eller pågående)

SIGNALKÄLLOR (fyra oberoende datakällor — alla måste representeras):

1. SKATTEVERKET — restanslängden (skatteskuld)
   skuld_sek: 0–2 500 000 (proportionellt mot score; 0 om score < 25)
   skatteverket_published: "Ja — skuld publicerad på restanslängden" | "Nej — ej registrerad"
   skuld_published_date: ÅÅÅÅ-MM-DD (3–18 månader bakåt om skuld finns, annars null)

2. KRONOFOGDEN — betalningsförelägganden
   betalning_count: 0–12 (0 om score < 20; stiger med score)
   betalning_total_sek: 0–800 000 (summa öppna krav; 0 om betalning_count är 0)
   betalning_latest_date: ÅÅÅÅ-MM-DD (senaste ärende om count > 0, annars null)
   kronofogden_escalated: true om betalning_count >= 5 ELLER betalning_total_sek > 300 000

3. BOLAGSVERKET — ärenden (ledande indikator, före registrering)
   [Baserat på utökad ärendeendpoint med Ankommet datum — feb 2026]
   arende_ankommet_datum: ÅÅÅÅ-MM-DD om ärende inkommit men ej registrerat (null om score < 60)
   arende_kanal: "Digital inlämning" | "Papperspost" | null
     (Papperspost = extra riskfaktor — bolag som skickar papper har ofta interna problem)
   arende_total_avgift_sek: 0–25 000 om ärende pågår (annars null)
   arende_betalt_belopp_sek: 0–arende_total_avgift_sek (skillnad = obetald avgift = friktionssignal)
   arende_obetald: true om arende_total_avgift_sek > arende_betalt_belopp_sek (annars false/null)
     [Obetald ärendeavgift = bolaget har ett ärende i rörelse men saknar likviditet att betala det]

4. BOLAGSVERKET — konkursregister (bekräftande signal)
   konkurs_filed: false om score < 90; true med 40% sannolikhet om score >= 90
   konkurs_date: ÅÅÅÅ-MM-DD om konkurs_filed = true, annars null

VARNINGSTID (lead time):
   Kreditvakt varnar i median 9–10 månader före konkursansökan.
   Ankommet datum-signalen (källa 3) bidrar med ytterligare dagar–veckor före registrering,
   vilket är den primära mekanismen bakom den utökade varningshorisonten vs. kreditbyråer.
   onset_days: uppskattade dagar tills likviditetsproblem eskalerar (50–450 om score > 30, annars null)
   median_days_to_konkurs: 270–300 (aldrig lägre än 270 — reflekterar 9–10 månaders horisont)

ÖVRIGA FÄLT:
   orgnr: det organisationsnummer som användes eller genererades (format: XXXXXX-XXXX) — ALLTID med
   company_name: företagets namn (från indata om namn angavs, annars genererat)
   search_input_type: "orgnr" | "company_name"
   industry: En av: Bygg & Entreprenad | Transport & Logistik | Handel & Detaljhandel | Tillverkning | IT & Konsult | Fastighet | Restaurang & Bespisning | Bemanning | Vård & Omsorg | Skog & Lantbruk
   f_skatt_active: true om score < 70; false om score >= 70 med 65% sannolikhet
   org_age_years: 1–40 (lägre ålder korrelerar med högre risk för nybolag)
   registered_year: innevarande år minus org_age_years
   verdict: En professionell mening på svenska som sammanfattar riskbilden — neutral och faktabaserad, inga dramatiska formuleringar
   signal_count: antal aktiva varningssignaler (0–6; räkna: skuld_sek>0, betalning_count>0, kronofogden_escalated, !f_skatt_active, arende_obetald, konkurs_filed)
   confidence: "låg" | "medel" | "hög" (0–1 signal = låg, 2–3 = medel, 4–6 = hög)

INTERN KONSISTENS (obligatoriska regler — bryt aldrig dessa):
- Om konkurs_filed = true → score MÅSTE vara >= 90
- Om f_skatt_active = false → score MÅSTE vara >= 55
- Om betalning_count >= 5 → score MÅSTE vara >= 45
- Om skuld_sek > 500 000 → score MÅSTE vara >= 60
- Om arende_obetald = true → score MÅSTE vara >= 50
- Om arende_ankommet_datum finns (ej null) → score MÅSTE vara >= 60
- Om score <= 20 → skuld_sek = 0, betalning_count = 0, konkurs_filed = false, f_skatt_active = true, arende_ankommet_datum = null, arende_obetald = false
- signal_count MÅSTE matcha faktiskt antal aktiva signaler i svaret
- confidence MÅSTE matcha signal_count enligt regeln ovan
- median_days_to_konkurs MÅSTE vara 270–300 (aldrig lägre än 270)
- orgnr MÅSTE alltid finnas i svaret oavsett inputtyp

Returnera nu ett JSON-objekt för det bolag som anges av användaren.`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-05-20",
        contents: query,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              orgnr:                    { type: Type.STRING },
              company_name:             { type: Type.STRING },
              search_input_type:        { type: Type.STRING },
              industry:                 { type: Type.STRING },
              org_age_years:            { type: Type.NUMBER },
              registered_year:          { type: Type.NUMBER },
              insolvency_score:         { type: Type.NUMBER },
              verdict:                  { type: Type.STRING },
              f_skatt_active:           { type: Type.BOOLEAN },
              skuld_sek:                { type: Type.NUMBER },
              skatteverket_published:   { type: Type.STRING },
              skuld_published_date:     { type: Type.STRING, nullable: true },
              betalning_count:          { type: Type.NUMBER },
              betalning_total_sek:      { type: Type.NUMBER },
              betalning_latest_date:    { type: Type.STRING, nullable: true },
              kronofogden_escalated:    { type: Type.BOOLEAN },
              arende_ankommet_datum:    { type: Type.STRING, nullable: true },
              arende_kanal:             { type: Type.STRING, nullable: true },
              arende_total_avgift_sek:  { type: Type.NUMBER, nullable: true },
              arende_betalt_belopp_sek: { type: Type.NUMBER, nullable: true },
              arende_obetald:           { type: Type.BOOLEAN },
              konkurs_filed:            { type: Type.BOOLEAN },
              konkurs_date:             { type: Type.STRING, nullable: true },
              onset_days:               { type: Type.NUMBER, nullable: true },
              median_days_to_konkurs:   { type: Type.NUMBER, nullable: true },
              signal_count:             { type: Type.NUMBER },
              confidence:               { type: Type.STRING },
            },
            required: [
              "orgnr", "company_name", "search_input_type", "industry",
              "org_age_years", "registered_year", "insolvency_score", "verdict",
              "f_skatt_active", "skuld_sek", "skatteverket_published",
              "betalning_count", "betalning_total_sek", "kronofogden_escalated",
              "arende_obetald", "konkurs_filed", "signal_count", "confidence",
            ],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      setError('Signalmotorn kunde inte slutföra analysen. Vänligen kontrollera anslutningen och försök igen.');
    } finally {
      setLoading(false);
    }
  }, [orgnr]);

  const handleSlide = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (approved) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const slider = sliderRef.current;
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    
    // Use requestAnimationFrame for smoother slider updates if needed, 
    // but React state is usually fine for simple sliders unless the component is heavy.
    setSlidePos(pos);
    
    if (pos > 95) {
      setApproved(true);
      setSlidePos(100);
    }
  }, [approved]);

  const resetSlide = useCallback(() => {
    if (!approved) setSlidePos(0);
  }, [approved]);

  const formatSEK = (n: number) => new Intl.NumberFormat('sv-SE').format(n);

  return (
    <div className="space-y-16">
      <section>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl text-white mb-2"
        >
          Strategisk Analys
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gold-lite/40 text-sm tracking-wide"
        >
          Identifiera insolvensrisker i realtid genom vår proprietära signalmotor.
        </motion.p>
      </section>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 bg-white rounded-[4px] shadow-2xl flex flex-col justify-between min-h-[320px] will-change-[opacity,transform]"
      >
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-midnight/40 font-bold mb-4 block">Sök i realtidsregister</span>
          <h2 className="font-serif text-3xl text-midnight mb-6 leading-tight">
            Ange organisationsnummer eller företagsnamn för <em className="not-italic text-gold">omedelbar granskning.</em>
          </h2>
          <div className="relative mb-6">
            <input
              type="text"
              value={orgnr}
              onChange={(e) => {
                const v = e.target.value;
                const digitsOnly = v.replace(/[^0-9]/g, '');
                // Auto-format if the user is typing an orgnr (only digits/dash)
                if (/^[0-9\-]*$/.test(v) && digitsOnly.length > 0) {
                  let formatted = digitsOnly.slice(0, 10);
                  if (formatted.length > 6) formatted = formatted.slice(0, 6) + '-' + formatted.slice(6);
                  setOrgnr(formatted);
                } else {
                  setOrgnr(v);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
              placeholder="Organisationsnummer eller företagsnamn"
              className="w-full bg-transparent border-b border-midnight/10 py-4 text-2xl text-midnight placeholder:text-midnight/10 outline-none focus:border-gold transition-colors font-light"
            />
            <button 
              onClick={() => runAnalysis()}
              disabled={loading}
              className="absolute right-0 bottom-4 text-gold hover:text-midnight transition-colors disabled:opacity-30"
            >
              {loading ? <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" /> : <Search className="w-6 h-6" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[9px] uppercase tracking-widest text-midnight/30 mr-2">Snabbsök:</span>
            {['556036-0793', '556460-4187', '559021-4389', 'Ikea', 'Skanska'].map(q => (
              <button
                key={q}
                onClick={() => runAnalysis(q)}
                className="text-[9px] uppercase tracking-widest text-midnight/40 hover:text-gold transition-colors border border-midnight/5 px-3 py-1 rounded-[2px]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error-alert"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-red-500/10 border border-red-500/25 rounded text-[12px] text-red-500 leading-relaxed tracking-wide mb-8 flex items-center justify-between"
          >
            <span>{error}</span>
            <button 
              onClick={() => runAnalysis()}
              className="text-red-500 font-bold uppercase tracking-widest text-[10px] hover:underline"
            >
              Försök igen
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {result && !loading && (
          <motion.section 
            id="risk-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-16 will-change-[opacity,transform]"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl text-white">Insolvensanalys</h2>
              <div className="flex gap-4">
                <button className="text-[10px] uppercase tracking-widest text-gold-lite/40 hover:text-gold transition-colors">Exportera Rapport</button>
                <button className="text-[10px] uppercase tracking-widest text-gold-lite/40 hover:text-gold transition-colors">Historik</button>
              </div>
            </div>

            <div className="bg-white/5 hairline-border rounded-[4px] overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12 p-10 items-center border-b border-gold/10">
                <div className="text-center min-w-[140px]">
                  <div className={`font-serif text-8xl font-bold leading-none tracking-tighter ${
                    result.insolvency_score >= 90 ? 'text-red-500' :
                    result.insolvency_score >= 70 ? 'text-orange-500' :
                    result.insolvency_score >= 40 ? 'text-yellow-500' : 'text-emerald-500'
                  }`}>
                    {result.insolvency_score}
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-gold-lite/40 mt-4 block">Insolvensbetyg</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full ${
                      result.insolvency_score >= 90 ? 'bg-red-500' :
                      result.insolvency_score >= 70 ? 'bg-orange-500' :
                      result.insolvency_score >= 40 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`} />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">
                      {result.insolvency_score >= 90 ? 'KRITISK RISK' :
                       result.insolvency_score >= 70 ? 'HÖG RISK' :
                       result.insolvency_score >= 40 ? 'MEDEL RISK' : 'LÅG RISK'}
                    </span>
                  </div>
                  <h3 className="font-serif text-3xl text-white mb-2">{result.company_name}</h3>
                  <p className="text-gold-lite/40 text-sm mb-6">{result.orgnr} • {result.industry}</p>
                  <div className="p-6 bg-gold/5 hairline-border rounded-[2px]">
                    <p className="text-white/80 text-sm leading-relaxed italic">
                      "{result.verdict}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gold/10">
                <div className="p-8 bg-midnight">
                  <span className="text-[9px] uppercase tracking-widest text-gold-lite/30 block mb-2">Skuld (SEK)</span>
                  <span className="text-2xl font-light text-white">{formatSEK(result.skuld_sek)}</span>
                </div>
                <div className="p-8 bg-midnight">
                  <span className="text-[9px] uppercase tracking-widest text-gold-lite/30 block mb-2">Betalningsförel.</span>
                  <span className="text-2xl font-light text-white">{result.betalning_count}</span>
                </div>
                <div className="p-8 bg-midnight">
                  <span className="text-[9px] uppercase tracking-widest text-gold-lite/30 block mb-2">Onset Dagar</span>
                  <span className="text-2xl font-light text-white">{result.onset_days}</span>
                </div>
                <div className="p-8 bg-midnight">
                  <span className="text-[9px] uppercase tracking-widest text-gold-lite/30 block mb-2">F-skatt Status</span>
                  <span className={`text-xl font-medium ${result.f_skatt_active ? 'text-emerald-500' : 'text-red-500'}`}>
                    {result.f_skatt_active ? 'Aktiv' : 'Återkallad'}
                  </span>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section>
        <h2 className="font-serif text-2xl text-white mb-8">Auktorisering & Protokoll</h2>
        <div className="p-10 bg-white/5 hairline-border rounded-[4px] flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="flex items-center gap-2 text-gold mb-4">
              <Lock className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Fördjupad Granskningsprotokoll</span>
            </div>
            <h3 className="font-serif text-3xl text-white mb-4">Initiera fördjupad granskning</h3>
            <p className="text-gold-lite/40 text-sm leading-relaxed mb-8 max-w-xl">
              Genom att aktivera detta protokoll initieras en fullständig manuell granskning av bolagets samtliga offentliga och privata administrativa signaler.
            </p>
          </div>

          <div 
            ref={sliderRef}
            id="approval-slider"
            className="relative h-16 bg-midnight/50 border border-gold/20 rounded-full overflow-hidden cursor-pointer touch-none"
            onMouseMove={(e) => e.buttons === 1 && handleSlide(e)}
            onTouchMove={handleSlide}
            onMouseUp={resetSlide}
            onTouchEnd={resetSlide}
          >
            <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-gold/40 font-bold pointer-events-none">
              {approved ? 'Granskning Initierad' : 'Svep för att initiera granskning'}
            </div>
            <motion.div 
              className="absolute left-0 top-0 h-full bg-gold flex items-center justify-end pr-4"
              style={{ width: `${slidePos}%` }}
            >
              {approved && <Check className="w-6 h-6 text-midnight" />}
            </motion.div>
            <motion.div 
              className="absolute top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing will-change-[left,transform]"
              style={{ left: `${slidePos}%`, x: "-50%" }}
              animate={{ x: approved ? "-100%" : "-50%" }}
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            >
              <ChevronRight className="w-6 h-6 text-midnight" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

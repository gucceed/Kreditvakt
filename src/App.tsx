import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Shield, 
  TrendingUp, 
  AlertCircle, 
  ChevronRight, 
  Search, 
  Lock, 
  Bell, 
  User,
  Briefcase,
  Globe,
  Check,
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';

// --- Types ---
interface AnalysisResult {
  orgnr: string;
  company_name: string;
  industry: string;
  insolvency_score: number;
  verdict: string;
  onset_days: number;
  skuld_sek: number;
  betalning_count: number;
  f_skatt_active: boolean;
  median_days_to_konkurs: number;
  skatteverket_published: string;
  skuld_published_date: string;
  konkurs_filed: boolean;
  konkurs_date: string | null;
}

const PENDING_ALERTS = [
  { id: 1, type: 'Kritisk Signal', entity: 'Nordic Logistics AB', signal: 'Skatteverksrestans detekterad', score: 92 },
  { id: 2, type: 'Hög Risk', entity: 'Svea Entreprenad HB', signal: 'F-skatt återkallad', score: 78 },
  { id: 3, type: 'Trendanalys', entity: 'Västkustens Handel', signal: 'Ökande betalningsförelägganden', score: 54 },
];

export default function App() {
  const [orgnr, setOrgnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slidePos, setSlidePos] = useState(0);
  const [approved, setApproved] = useState(false);

  const runAnalysis = async (targetOrgnr?: string) => {
    const input = targetOrgnr || orgnr;
    const cleaned = input.replace(/[^0-9]/g, '');
    
    if (cleaned.length < 10) {
      setError('Ange ett giltigt organisationsnummer (10 siffror, t.ex. 556012-3456)');
      return;
    }

    const formattedOrgnr = cleaned.slice(0, 6) + '-' + cleaned.slice(6);
    setOrgnr(formattedOrgnr);
    setLoading(true);
    setError(null);
    setResult(null);
    setApproved(false);
    setSlidePos(0);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analysera organisationsnummer: ${formattedOrgnr}. Returnera JSON med fälten: orgnr, company_name, industry, insolvency_score, verdict, onset_days, skuld_sek, betalning_count, f_skatt_active, median_days_to_konkurs, skatteverket_published, skuld_published_date, konkurs_filed, konkurs_date`,
        config: {
          systemInstruction: `Du är Kreditvakts signalmotor. Givet ett organisationsnummer, returnera ett realistiskt insolvensanalyssvar som JSON.

Regler:
- Generera realistisk svenska företagsdata baserat på orgnr-mönstret
- Variera resultaten meningsfullt — inte alla bolag är högrisk
- insolvency_score: 0-100 (distribuera: 40% låg 0-39, 30% medel 40-69, 20% hög 70-89, 10% kritisk 90-100)
- company_name: Realistiskt svenskt företagsnamn (AB, HB, etc.)
- industry: En av: Bygg & Entreprenad, Transport & Logistik, Handel & Detaljhandel, Tillverkning, IT & Konsult, Fastighet, Restaurang & Bespisning, Bemanning
- verdict: En mening på svenska som sammanfattar riskbilden professionellt
- onset_days: 0-400 dagar (bara relevant om score > 20)
- skuld_sek: 0-2000000 (proportionellt mot score)
- betalning_count: 0-8
- f_skatt_active: true om score < 75, false om score >= 75 med 60% sannolikhet
- median_days_to_konkurs: 180-270
- skatteverket_published: "Ja — skuld publicerad på restanslängden" eller "Nej — ej registrerad"
- skuld_published_date: Datum i format ÅÅÅÅ-MM-DD (3-14 månader bakåt om score > 20)
- konkurs_filed: false om score < 95, annars true med 30% sannolikhet
- konkurs_date: null om inte konkurs_filed`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              orgnr: { type: Type.STRING },
              company_name: { type: Type.STRING },
              industry: { type: Type.STRING },
              insolvency_score: { type: Type.NUMBER },
              verdict: { type: Type.STRING },
              onset_days: { type: Type.NUMBER },
              skuld_sek: { type: Type.NUMBER },
              betalning_count: { type: Type.NUMBER },
              f_skatt_active: { type: Type.BOOLEAN },
              median_days_to_konkurs: { type: Type.NUMBER },
              skatteverket_published: { type: Type.STRING },
              skuld_published_date: { type: Type.STRING },
              konkurs_filed: { type: Type.BOOLEAN },
              konkurs_date: { type: Type.STRING, nullable: true },
            },
            required: ["orgnr", "company_name", "industry", "insolvency_score", "verdict", "onset_days", "skuld_sek", "betalning_count", "f_skatt_active", "median_days_to_konkurs", "skatteverket_published", "skuld_published_date", "konkurs_filed", "konkurs_date"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Signalmotorn kunde inte slutföra analysen. Kontrollera nätverket eller försök igen.');
    } finally {
      setLoading(false);
    }
  };

  const handleSlide = (e: React.MouseEvent | React.TouchEvent) => {
    if (approved) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const slider = document.getElementById('approval-slider');
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSlidePos(pos);
    if (pos > 95) {
      setApproved(true);
      setSlidePos(100);
    }
  };

  const resetSlide = () => {
    if (!approved) setSlidePos(0);
  };

  const formatSEK = (n: number) => new Intl.NumberFormat('sv-SE').format(n);

  return (
    <div className="min-h-screen bg-midnight selection:bg-gold/30">
      {/* Navigation */}
      <nav className="glass-nav fixed top-0 w-full z-50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold flex items-center justify-center rounded-[2px]">
            <Shield className="w-5 h-5 text-midnight" />
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-white">Kreditvakt</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] text-gold-lite/60">
            <a href="#" className="hover:text-gold transition-colors">Övervakning</a>
            <a href="#" className="hover:text-gold transition-colors">Analys</a>
            <a href="#" className="hover:text-gold transition-colors">Arkiv</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gold-lite/60 hover:text-gold transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
              <User className="w-4 h-4 text-gold" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <section className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl text-white mb-2"
          >
            Översikt: Kreditrisk & Insolvens
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gold-lite/40 text-sm tracking-wide flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Systemstatus: Operativ • Realtidsövervakning Aktiv • {new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </motion.p>
        </section>

        {/* Search & Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Search Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 p-10 bg-white rounded-[4px] shadow-2xl flex flex-col justify-between min-h-[320px]"
          >
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-midnight/40 font-bold mb-4 block">Sök i realtidsregister</span>
              <h2 className="font-serif text-3xl text-midnight mb-6 leading-tight">
                Strategisk riskövervakning: <em className="not-italic text-gold">Identifiera insolvens i tid.</em>
              </h2>
              <div className="relative mb-6">
                <input 
                  type="text"
                  value={orgnr}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^0-9]/g, '');
                    if (v.length > 6) v = v.slice(0, 6) + '-' + v.slice(6, 10);
                    setOrgnr(v);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
                  placeholder="Organisationsnummer (t.ex. 556012-3456)"
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
                {['556036-0793', '556460-4187', '559021-4389'].map(num => (
                  <button 
                    key={num}
                    onClick={() => runAnalysis(num)}
                    className="text-[9px] uppercase tracking-widest text-midnight/40 hover:text-gold transition-colors border border-midnight/5 px-3 py-1 rounded-[2px]"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Actionable Intelligence */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-gold rounded-[4px] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] uppercase tracking-[0.2em] text-midnight/60 font-bold">Kritiska Signaler</span>
                <AlertCircle className="w-5 h-5 text-midnight" />
              </div>
              <h3 className="font-serif text-2xl text-midnight mb-4 leading-tight">
                Exponering detekterad i logistiksektorn.
              </h3>
              <p className="text-midnight/60 text-sm leading-relaxed">
                Vår motor har flaggat tre bolag för omedelbar insolvensgranskning baserat på färska restanslängder.
              </p>
            </div>
            <button 
              onClick={() => document.getElementById('risk-result')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full py-4 bg-midnight text-gold text-[11px] uppercase tracking-[0.2em] font-bold rounded-[2px] hover:bg-midnight/90 transition-colors flex items-center justify-center gap-2"
            >
              Visa Analys <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-red-500/10 border border-red-500/25 rounded text-[12px] text-red-500 leading-relaxed tracking-wide mb-8"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Result */}
        <AnimatePresence mode="wait">
          {result && !loading && (
            <motion.section 
              id="risk-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-16"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl text-white">Insolvensanalys</h2>
                <div className="flex gap-4">
                  <button className="text-[10px] uppercase tracking-widest text-gold-lite/40 hover:text-gold transition-colors">Exportera Rapport</button>
                  <button className="text-[10px] uppercase tracking-widest text-gold-lite/40 hover:text-gold transition-colors">Historik</button>
                </div>
              </div>

              <div className="bg-white/5 hairline-border rounded-[4px] overflow-hidden">
                {/* Score Hero */}
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

                {/* Signals Grid */}
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

                {/* Timeline */}
                <div className="p-10 bg-midnight">
                  <div className="text-[9px] uppercase tracking-[0.12em] text-gold-lite/30 mb-8">Riskbåge — position i insolvensförloppet</div>
                  <div className="relative my-8">
                    <div className="h-[1px] bg-gold/10 rounded-full relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(95, (result.onset_days / result.median_days_to_konkurs) * 100)}%` }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="absolute left-0 top-0 h-full bg-gold"
                      />
                      <motion.div
                        initial={{ left: 0 }}
                        animate={{ left: `${Math.min(95, (result.onset_days / result.median_days_to_konkurs) * 100)}%` }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-midnight ${
                          result.insolvency_score >= 90 ? 'bg-red-500' :
                          result.insolvency_score >= 70 ? 'bg-orange-500' :
                          result.insolvency_score >= 40 ? 'bg-yellow-500' : 'bg-gold'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-gold-lite/20 tracking-wider">
                    <span>{new Date(Date.now() - result.onset_days * 86400000).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span>{new Date(Date.now() + (result.median_days_to_konkurs - result.onset_days) * 86400000).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' })} (estimat)</span>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Pending Alerts & Authorization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Alerts List */}
          <section>
            <h2 className="font-serif text-2xl text-white mb-8">Varningslista</h2>
            <div className="space-y-4">
              {PENDING_ALERTS.map((alert) => (
                <div key={alert.id} className="p-6 bg-white/5 hairline-border rounded-[4px] flex items-center justify-between hover:bg-white/[0.07] transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-gold/10 border border-gold/20 flex items-center justify-center rounded-[2px]">
                      <Activity className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-gold block mb-1">{alert.type}</span>
                      <h4 className="text-white font-medium">{alert.entity}</h4>
                      <p className="text-[10px] text-gold-lite/30">{alert.signal}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-serif text-lg block mb-1 ${alert.score >= 90 ? 'text-red-500' : 'text-white'}`}>{alert.score}</span>
                    <span className="text-[9px] uppercase tracking-widest text-gold-lite/30">Betyg</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Slide to Audit */}
          <section>
            <h2 className="font-serif text-2xl text-white mb-8">Auktorisering & Protokoll</h2>
            <div className="p-10 bg-white/5 hairline-border rounded-[4px] flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="flex items-center gap-2 text-gold mb-4">
                  <Lock className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Fördjupad Granskningsprotokoll</span>
                </div>
                <h3 className="font-serif text-3xl text-white mb-4">Initiera fördjupad granskning</h3>
                <p className="text-gold-lite/40 text-sm leading-relaxed mb-8">
                  Genom att aktivera detta protokoll initieras en fullständig manuell granskning av bolagets samtliga offentliga och privata administrativa signaler.
                </p>
              </div>

              <div 
                id="approval-slider"
                className="relative h-16 bg-midnight/50 border border-gold/20 rounded-full overflow-hidden cursor-pointer touch-none"
                onMouseMove={(e) => e.buttons === 1 && handleSlide(e)}
                onTouchMove={handleSlide}
                onMouseUp={resetSlide}
                onTouchEnd={resetSlide}
              >
                <div 
                  className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-gold/40 font-bold pointer-events-none"
                >
                  {approved ? 'Granskning Initierad' : 'Svep för att initiera granskning'}
                </div>
                <motion.div 
                  className="absolute left-0 top-0 h-full bg-gold flex items-center justify-end pr-4"
                  style={{ width: `${slidePos}%` }}
                >
                  {approved && <Check className="w-6 h-6 text-midnight" />}
                </motion.div>
                <motion.div 
                  className="absolute top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing"
                  style={{ left: `calc(${slidePos}% - 7px)` }}
                  animate={{ x: approved ? -40 : 0 }}
                >
                  <ChevronRight className="w-6 h-6 text-midnight" />
                </motion.div>
              </div>
            </div>
          </section>
        </div>

        {/* Stats Footer */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-px mt-24 pt-12 border-t border-gold/10">
          <div className="pr-4 py-4 sm:py-0 border-b sm:border-b-0 sm:border-r border-gold/10">
            <div className="font-serif text-[26px] font-bold text-white tracking-tight leading-none mb-1">9 mån</div>
            <div className="text-[10px] text-gold-lite/40 tracking-wider leading-relaxed uppercase">
              Medianvarning före konkursansökan
            </div>
          </div>
          <div className="px-0 sm:px-4 py-4 sm:py-0 border-b sm:border-b-0 sm:border-r border-gold/10">
            <div className="font-serif text-[26px] font-bold text-white tracking-tight leading-none mb-1">80%</div>
            <div className="text-[10px] text-gold-lite/40 tracking-wider leading-relaxed uppercase">
              Detekterbara konkurser i förväg
            </div>
          </div>
          <div className="pl-0 sm:pl-4 py-4 sm:py-0">
            <div className="font-serif text-[26px] font-bold text-white tracking-tight leading-none mb-1">6×</div>
            <div className="text-[10px] text-gold-lite/40 tracking-wider leading-relaxed uppercase">
              Bättre träffsäkerhet än kreditbyråer
            </div>
          </div>
        </section>

        <footer className="mt-12 text-[10px] text-gold-lite/20 tracking-wider leading-relaxed text-center">
          Kreditvakt analyserar offentliga administrativa data. Ingen personuppgiftsbehandling.
          GDPR-kompatibelt. Alla signaler är offentliga enligt svensk lag.
        </footer>
      </main>

      {/* Bottom Bar Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-nav px-8 py-4 rounded-full flex items-center gap-12 z-50">
        <button className="text-gold hover:text-white transition-colors"><Activity className="w-5 h-5" /></button>
        <button className="text-gold-lite/40 hover:text-gold transition-colors"><TrendingUp className="w-5 h-5" /></button>
        <button className="text-gold-lite/40 hover:text-gold transition-colors"><Globe className="w-5 h-5" /></button>
        <button className="text-gold-lite/40 hover:text-gold transition-colors"><Lock className="w-5 h-5" /></button>
      </div>
    </div>
  );
}

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, Lock, Check, Activity } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

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

export const Analysis = () => {
  const [orgnr, setOrgnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slidePos, setSlidePos] = useState(0);
  const [approved, setApproved] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const runAnalysis = useCallback(async (targetOrgnr?: string) => {
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
          systemInstruction: `Du är Kreditvakts signalmotor. Givet ett organisationsnummer, returnera ett realistiskt insolvensanalyssvar som JSON.`,
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
            Ange organisationsnummer för <em className="not-italic text-gold">omedelbar granskning.</em>
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

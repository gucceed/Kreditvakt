import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Globe, Lock, ArrowRight, Calculator, CheckCircle2, Database, TrendingUp } from 'lucide-react';

export const Pricing = () => {
  const monitoringTiers = React.useMemo(() => [
    { size: 'Upp till 200 MSEK portfölj', price: '60 000 kr/år' },
    { size: 'Upp till 500 MSEK portfölj', price: '100 000 kr/år' },
    { size: 'Upp till 1 BSEK portfölj', price: '150 000 kr/år' },
  ], []);

  return (
    <div className="py-12 space-y-24">
      {/* ROI Anchor Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-12 bg-white/5 hairline-border rounded-[4px] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Calculator className="w-32 h-32 text-gold" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gold/10 flex items-center justify-center rounded-[2px]">
              <TrendingUp className="w-6 h-6 text-gold" />
            </div>
            <h2 className="font-serif text-2xl text-white">Strategisk ROI-kalkyl</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <p className="text-gold-lite/60 text-sm font-medium uppercase tracking-widest">Räkneexempel: Factoringbolag</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm border-b border-gold/10 pb-2">
                  <span className="text-gold-lite/40">Portföljstorlek</span>
                  <span className="text-white">500 MSEK</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gold/10 pb-2">
                  <span className="text-gold-lite/40">Kreditförluster (0,8% rate)</span>
                  <span className="text-white">4 MSEK/år</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gold/10 pb-2">
                  <span className="text-gold-lite/40">Kreditvakt täckningsgrad</span>
                  <span className="text-white">65%</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gold/5 rounded-[2px] border border-gold/20">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold/60 block mb-2">Skyddat värde vid tidig varning</span>
                <div className="text-4xl font-serif font-bold text-gold mb-4">~1,8 MSEK/år</div>
                <div className="h-px bg-gold/20 w-12 mx-auto mb-4" />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gold-lite/40">Investering</span>
                  <span className="text-white">100 000 kr/år</span>
                </div>
                <div className="mt-6 text-2xl font-serif text-white">
                  ROI: <span className="text-gold">18×</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* PER UPPSLAG */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-10 bg-white/5 border border-gold/10 rounded-[4px] flex flex-col justify-between hover:border-gold/30 transition-all will-change-[opacity,transform]"
        >
          <div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="bg-gold/10 text-gold text-[8px] uppercase tracking-widest px-2 py-1 rounded-full font-bold mb-3 block w-fit">
                  Kom igång direkt
                </span>
                <h3 className="font-serif text-2xl text-white mb-2">Per Uppslag</h3>
              </div>
            </div>
            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-serif font-bold text-white">5 kr</span>
                <span className="text-xs text-gold-lite/40">per organisationsnummer</span>
              </div>
              <p className="text-[10px] text-gold-lite/30 mt-2 italic">Ingen månadsavgift, ingen bindningstid</p>
            </div>
            <p className="text-xs text-white/70 leading-relaxed mb-8">
              För inköpsteam, HR och juridik som behöver utföra enstaka, strategiska kontroller vid behov. Faktureras månadsvis baserat på faktisk användning.
            </p>
          </div>
          <button className="w-full py-4 bg-gold text-midnight text-[11px] uppercase tracking-[0.2em] font-bold rounded-[2px] hover:bg-gold-lite transition-all">
            Starta nu
          </button>
        </motion.div>

        {/* ÖVERVAKNING */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-10 bg-gold border border-gold rounded-[4px] flex flex-col justify-between shadow-[0_0_50px_rgba(197,160,89,0.15)] relative z-10 will-change-[opacity,transform]"
        >
          <div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="bg-midnight text-gold text-[8px] uppercase tracking-widest px-2 py-1 rounded-full font-bold mb-3 block w-fit">
                  Mest valda
                </span>
                <h3 className="font-serif text-2xl text-midnight mb-2">Övervakning</h3>
              </div>
            </div>
            
            <div className="space-y-px bg-midnight/10 rounded-[2px] overflow-hidden mb-8">
              {monitoringTiers.map((tier, i) => (
                <div key={i} className="flex justify-between p-4 bg-midnight/5 text-[11px]">
                  <span className="text-midnight/60">{tier.size}</span>
                  <span className="text-midnight font-bold">{tier.price}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-midnight/80 leading-relaxed mb-8">
              För kreditavdelningar och riskhanterare. Inkluderar realtidsalerter via webhook, obegränsad portföljövervakning, daglig rapport, CSV-export och full API-åtkomst. Årsvis fakturering.
            </p>
          </div>
          <button className="w-full py-4 bg-midnight text-gold text-[11px] uppercase tracking-[0.2em] font-bold rounded-[2px] hover:bg-midnight/90 transition-all">
            Boka demo
          </button>
        </motion.div>

        {/* ENTERPRISE DATAFEED */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-10 bg-white/5 border border-gold/10 rounded-[4px] flex flex-col justify-between hover:border-gold/30 transition-all will-change-[opacity,transform]"
        >
          <div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="w-8 h-8 bg-gold/10 flex items-center justify-center rounded-[2px] mb-4">
                  <Database className="w-4 h-4 text-gold" />
                </div>
                <h3 className="font-serif text-2xl text-white mb-2">Enterprise Datafeed</h3>
              </div>
            </div>
            <div className="mb-8">
              <span className="text-2xl font-serif font-bold text-white">Från 300 000 kr/år</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed mb-8">
              För kreditförsäkringsbolag, banker och internationella investerare som kräver full databaslicens, anpassade leveransformat och dedikerat SLA-stöd.
            </p>
          </div>
          <button className="w-full py-4 border border-gold/40 text-gold text-[11px] uppercase tracking-[0.2em] font-bold rounded-[2px] hover:bg-gold/10 transition-all">
            Begär offert
          </button>
        </motion.div>

      </div>

      {/* Trust Signals Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-16 border-t border-gold/10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gold">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[11px] uppercase tracking-widest font-bold">Validerad Precision</span>
          </div>
          <p className="text-gold-lite/20 text-[10px] leading-relaxed">
            Vår modell är validerad mot samtliga svenska konkursdata mellan 2003–2023 för maximal träffsäkerhet.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gold">
            <Shield className="w-5 h-5" />
            <span className="text-[11px] uppercase tracking-widest font-bold">Bankstandard</span>
          </div>
          <p className="text-gold-lite/20 text-[10px] leading-relaxed">
            Median 9 månaders förvarning före insolvens. End-to-end kryptering och full GDPR-efterlevnad.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gold">
            <Lock className="w-5 h-5" />
            <span className="text-[11px] uppercase tracking-widest font-bold">Säkra Avtal</span>
          </div>
          <p className="text-gold-lite/20 text-[10px] leading-relaxed">
            Vi arbetar uteslutande med årsavtal för att säkerställa kontinuitet i er riskövervakning. Inga månadsuppsägningar.
          </p>
        </div>
      </div>
    </div>
  );
};

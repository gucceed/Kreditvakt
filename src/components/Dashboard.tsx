import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Activity, ChevronRight } from 'lucide-react';

const PENDING_ALERTS = [
  { id: 1, type: 'Kritisk Signal', entity: 'Nordic Logistics AB', signal: 'Skatteverksrestans detekterad', score: 92 },
  { id: 2, type: 'Hög Risk', entity: 'Svea Entreprenad HB', signal: 'F-skatt återkallad', score: 78 },
  { id: 3, type: 'Trendanalys', entity: 'Västkustens Handel', signal: 'Ökande betalningsförelägganden', score: 54 },
];

export const Dashboard = ({ onShowAnalysis }: { onShowAnalysis: () => void }) => {
  const alerts = React.useMemo(() => PENDING_ALERTS, []);

  return (
    <div className="space-y-16">
      {/* Header Section */}
      <section>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actionable Intelligence */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 p-10 bg-gold rounded-[4px] flex flex-col justify-between min-h-[320px] will-change-[opacity,transform]"
        >
          <div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] uppercase tracking-[0.2em] text-midnight/60 font-bold">Kritiska Signaler</span>
              <AlertCircle className="w-5 h-5 text-midnight" />
            </div>
            <h3 className="font-serif text-3xl text-midnight mb-4 leading-tight">
              Exponering detekterad i logistiksektorn.
            </h3>
            <p className="text-midnight/60 text-sm leading-relaxed max-w-xl">
              Vår motor har flaggat tre bolag för omedelbar insolvensgranskning baserat på färska restanslängder. 
              Detta indikerar en systemisk risk i sektorn.
            </p>
          </div>
          <button 
            onClick={onShowAnalysis}
            className="w-fit px-8 py-4 bg-midnight text-gold text-[11px] uppercase tracking-[0.2em] font-bold rounded-[2px] hover:bg-midnight/90 transition-colors flex items-center justify-center gap-2 mt-8"
          >
            Visa Analys <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="p-8 bg-white/5 hairline-border rounded-[4px]">
            <span className="text-[9px] uppercase tracking-widest text-gold-lite/30 block mb-2">Aktiva Bevakningar</span>
            <span className="text-3xl font-light text-white">1,248</span>
          </div>
          <div className="p-8 bg-white/5 hairline-border rounded-[4px]">
            <span className="text-[9px] uppercase tracking-widest text-gold-lite/30 block mb-2">Signaler (24h)</span>
            <span className="text-3xl font-light text-white">14</span>
          </div>
          <div className="p-8 bg-white/5 hairline-border rounded-[4px]">
            <span className="text-[9px] uppercase tracking-widest text-gold-lite/30 block mb-2">Riskindex</span>
            <span className="text-3xl font-light text-emerald-500">Stabil</span>
          </div>
        </div>
      </div>

      {/* Pending Alerts */}
      <section>
        <h2 className="font-serif text-2xl text-white mb-8">Varningslista</h2>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-6 bg-white/5 hairline-border rounded-[4px] flex items-center justify-between hover:bg-white/[0.07] transition-colors group will-change-[background-color]">
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
    </div>
  );
};

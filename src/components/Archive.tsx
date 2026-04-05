import React from 'react';
import { motion } from 'motion/react';
import { FileText, Search, ChevronRight } from 'lucide-react';

const ARCHIVE_DATA = [
  { id: 1, name: 'Nordic Logistics AB', date: '2026-03-15', score: 92, status: 'Kritisk' },
  { id: 2, name: 'Svea Entreprenad HB', date: '2026-03-12', score: 78, status: 'Hög Risk' },
  { id: 3, name: 'Västkustens Handel', date: '2026-03-10', score: 54, status: 'Medel' },
  { id: 4, name: 'Stockholm Tech Solutions', date: '2026-03-05', score: 12, status: 'Låg' },
  { id: 5, name: 'Malmö Fastigheter', date: '2026-03-01', score: 45, status: 'Medel' },
];

export const Archive = () => {
  const archiveData = React.useMemo(() => ARCHIVE_DATA, []);

  return (
    <div className="space-y-16">
      <section>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl text-white mb-2"
        >
          Arkiv & Historik
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gold-lite/40 text-sm tracking-wide"
        >
          Fullständig historik över samtliga analyserade entiteter och deras riskutveckling.
        </motion.p>
      </section>

      <div className="bg-white/5 hairline-border rounded-[4px] overflow-hidden">
        <div className="p-6 border-b border-gold/10 flex items-center justify-between bg-white/[0.02]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-lite/20" />
            <input 
              type="text" 
              placeholder="Sök i arkivet..." 
              className="w-full bg-midnight/50 border border-gold/10 rounded-[2px] py-2 pl-12 pr-4 text-xs text-white placeholder:text-gold-lite/20 outline-none focus:border-gold/40 transition-all"
            />
          </div>
          <div className="flex gap-4">
            <button className="text-[10px] uppercase tracking-widest text-gold-lite/40 hover:text-gold transition-colors">Filtrera</button>
            <button className="text-[10px] uppercase tracking-widest text-gold-lite/40 hover:text-gold transition-colors">Exportera alla</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gold-lite/40 font-bold">Entitet</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gold-lite/40 font-bold">Datum</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gold-lite/40 font-bold">Betyg</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gold-lite/40 font-bold">Status</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody>
              {archiveData.map((item) => (
                <tr key={item.id} className="border-b border-gold/5 hover:bg-white/[0.02] transition-colors group will-change-[background-color]">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gold/5 border border-gold/10 flex items-center justify-center rounded-[2px]">
                        <FileText className="w-4 h-4 text-gold/40" />
                      </div>
                      <span className="text-sm text-white font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-6 text-xs text-gold-lite/40">{item.date}</td>
                  <td className="p-6">
                    <span className={`font-serif text-lg ${item.score >= 90 ? 'text-red-500' : 'text-white'}`}>
                      {item.score}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded-full border ${
                      item.score >= 90 ? 'border-red-500/20 text-red-500 bg-red-500/5' :
                      item.score >= 70 ? 'border-orange-500/20 text-orange-500 bg-orange-500/5' :
                      item.score >= 40 ? 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5' :
                      'border-emerald-500/20 text-emerald-500 bg-emerald-500/5'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-2 text-gold-lite/20 hover:text-gold transition-colors opacity-0 group-hover:opacity-100">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

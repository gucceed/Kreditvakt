import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  TrendingUp, 
  Bell, 
  User,
  Briefcase,
  Globe,
  Activity,
  Lock,
  CreditCard
} from 'lucide-react';

// Components
import { Dashboard } from './components/Dashboard';
import { Analysis } from './components/Analysis';
import { Archive } from './components/Archive';
import { Pricing } from './components/Pricing';

type View = 'dashboard' | 'analysis' | 'archive' | 'pricing';

export default function App() {
  const [view, setView] = useState<View>('dashboard');

  const renderView = useMemo(() => {
    switch (view) {
      case 'dashboard':
        return <Dashboard onShowAnalysis={() => setView('analysis')} />;
      case 'analysis':
        return <Analysis />;
      case 'archive':
        return <Archive />;
      case 'pricing':
        return <Pricing />;
      default:
        return <Dashboard onShowAnalysis={() => setView('analysis')} />;
    }
  }, [view]);

  return (
    <div className="min-h-screen bg-midnight selection:bg-gold/30">
      {/* Navigation */}
      <nav className="glass-nav fixed top-0 w-full z-50 px-8 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setView('dashboard')}
        >
          <div className="w-8 h-8 bg-gold flex items-center justify-center rounded-[2px] group-hover:scale-110 transition-transform">
            <Shield className="w-5 h-5 text-midnight" />
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-white">Kreditvakt</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-[0.2em]">
            <button 
              onClick={() => setView('dashboard')}
              className={`transition-colors ${view === 'dashboard' ? 'text-gold' : 'text-gold-lite/60 hover:text-gold'}`}
            >
              Övervakning
            </button>
            <button 
              onClick={() => setView('analysis')}
              className={`transition-colors ${view === 'analysis' ? 'text-gold' : 'text-gold-lite/60 hover:text-gold'}`}
            >
              Analys
            </button>
            <button 
              onClick={() => setView('archive')}
              className={`transition-colors ${view === 'archive' ? 'text-gold' : 'text-gold-lite/60 hover:text-gold'}`}
            >
              Arkiv
            </button>
            <button 
              onClick={() => setView('pricing')}
              className={`transition-colors ${view === 'pricing' ? 'text-gold' : 'text-gold-lite/60 hover:text-gold'}`}
            >
              Priser
            </button>
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
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="will-change-[opacity,transform]"
          >
            {renderView}
          </motion.div>
        </AnimatePresence>

        {/* Stats Footer - Only show on dashboard/analysis */}
        {(view === 'dashboard' || view === 'analysis') && (
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
        )}

        <footer className="mt-12 text-[10px] text-gold-lite/20 tracking-wider leading-relaxed text-center">
          Kreditvakt analyserar offentliga administrativa data. Ingen personuppgiftsbehandling.
          GDPR-kompatibelt. Alla signaler är offentliga enligt svensk lag.
        </footer>
      </main>

      {/* Bottom Bar Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-nav px-8 py-4 rounded-full flex items-center gap-12 z-50">
        <button 
          onClick={() => setView('dashboard')}
          className={`transition-colors ${view === 'dashboard' ? 'text-gold' : 'text-gold-lite/40 hover:text-gold'}`}
        >
          <Activity className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setView('analysis')}
          className={`transition-colors ${view === 'analysis' ? 'text-gold' : 'text-gold-lite/40 hover:text-gold'}`}
        >
          <TrendingUp className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setView('pricing')}
          className={`transition-colors ${view === 'pricing' ? 'text-gold' : 'text-gold-lite/40 hover:text-gold'}`}
        >
          <CreditCard className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setView('archive')}
          className={`transition-colors ${view === 'archive' ? 'text-gold' : 'text-gold-lite/40 hover:text-gold'}`}
        >
          <Lock className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

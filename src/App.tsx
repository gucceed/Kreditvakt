import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Database,
  ArrowRight,
} from 'lucide-react';
import { Pricing } from './components/Pricing';

/* ── Static data ───────────────────────────────────────────── */

const SCORE_BANDS = [
  { range: '0 – 4',   label: 'Stabil',       color: '#10B981', pct: '< 1%',   desc: 'Inga signifikanta skuldindikationer' },
  { range: '5 – 8',   label: 'Bevaka',        color: '#EAB308', pct: '2–5%',   desc: 'Måttliga skuldsignaler — bevaka aktivt' },
  { range: '9 – 12',  label: 'Förhöjd risk',  color: '#F97316', pct: '8–15%',  desc: 'Tydliga skuldmönster — agera proaktivt' },
  { range: '13 – 16', label: 'Hög risk',      color: '#EA580C', pct: '20–35%', desc: 'Allvarliga betalningsproblem registrerade' },
  { range: '17 – 20', label: 'Kritisk',       color: '#EF4444', pct: '> 50%',  desc: 'Imminent konkursrisk — omedelbar åtgärd' },
];

const DEMO_COMPANIES = [
  { name: 'Exemplet Bygg AB',   org_nr: '5566778899', score: 3,  label: 'Stabil',       color: '#10B981' },
  { name: 'Nordisk Handel AB',  org_nr: '5567889900', score: 10, label: 'Förhöjd risk', color: '#F97316' },
  { name: 'Fastighets AB Alfa', org_nr: '5568990011', score: 16, label: 'Hög risk',     color: '#EA580C' },
];

const PAIN_POINTS = [
  {
    Icon: TrendingUp,
    title: 'Leverantörsrisker',
    body: 'Leverantörskonkurser skapar produktionsstopp och nödanskaffning. Kreditvakt ger 9 månaders förvarning — tid att säkra alternativ.',
  },
  {
    Icon: AlertTriangle,
    title: 'Kundkrediter',
    body: 'Kreditbeslut på ofullständig information leder till kundförluster. Vår kreditvärdering är kalibrerad mot 20 år av konkursdata.',
  },
  {
    Icon: Database,
    title: 'Portföljövervakning',
    body: 'Manuell uppföljning av hundratals motparter är omöjlig. Kreditvakt skannar din portfölj kontinuerligt och eskalerar automatiskt.',
  },
];

/* ── Sub-components ────────────────────────────────────────── */

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="h-[3px] w-full rounded-full" style={{ background: 'var(--border)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${(score / 20) * 100}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.25 }}
      />
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */

export default function App() {
  const [light, setLight] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoIdx, setDemoIdx] = useState(0);

  const demo = DEMO_COMPANIES[demoIdx];

  return (
    <div
      className={light ? 'light' : ''}
      style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)', transition: 'background 0.3s ease' }}
    >

      {/* ═══ NAV ══════════════════════════════════════════════ */}
      <nav className="nav-glass fixed top-0 w-full z-50 px-6 md:px-10 py-[18px] flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-[2px]" style={{ background: 'var(--gold)' }}>
            <Shield className="w-4 h-4" style={{ color: 'var(--bg)' }} />
          </div>
          <span className="font-serif text-[17px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Kreditvakt
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-second)' }}>
          <a href="#produkt" className="transition-colors hover:opacity-100" style={{ opacity: 0.8 }}>Produkt</a>
          <a href="#priser"  className="transition-colors hover:opacity-100" style={{ opacity: 0.8 }}>Priser</a>
          <a href="https://norric.io/developer-docs.html" className="transition-colors hover:opacity-100" style={{ opacity: 0.8 }}>API</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLight(l => !l)}
            aria-label="Byt tema"
            className="p-2 rounded-[2px] transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-second)' }}
          >
            {light ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <a
            href="#priser"
            className="hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] font-bold px-5 py-2.5 rounded-[2px] transition-opacity hover:opacity-80"
            style={{ background: 'var(--gold)', color: 'var(--bg)' }}
          >
            Kom igång
          </a>
          <button
            className="md:hidden p-2"
            style={{ color: 'var(--text-second)' }}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Meny"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="nav-glass fixed top-[61px] inset-x-0 z-40 px-8 py-6 flex flex-col gap-5"
          >
            {[
              { href: '#produkt', label: 'Produkt' },
              { href: '#priser',  label: 'Priser'  },
              { href: 'https://norric.io/developer-docs.html', label: 'API' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{ color: 'var(--text-second)' }}
              >
                {label}
              </a>
            ))}
            <a
              href="#priser"
              onClick={() => setMenuOpen(false)}
              className="text-[10px] uppercase tracking-[0.25em] font-bold px-5 py-3 rounded-[2px] text-center mt-2"
              style={{ background: 'var(--gold)', color: 'var(--bg)' }}
            >
              Kom igång
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pb-32 md:pb-0">

        {/* ═══ HERO ═════════════════════════════════════════════ */}
        <section className="pt-40 pb-24 md:pt-52 md:pb-32 px-6 md:px-10 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
            <div
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-10"
              style={{ border: '0.5px solid var(--gold)', color: 'var(--gold)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--gold)' }} />
              Kreditriskbevakning · Bankstandard
            </div>

            <h1
              className="font-serif font-bold leading-[1.04] tracking-tight mb-8"
              style={{ fontSize: 'clamp(2.6rem, 6vw, 5rem)', color: 'var(--text-primary)' }}
            >
              Se insolvensen<br />
              <span style={{ color: 'var(--gold)' }}>9 månader</span> innan<br />
              konkursansökan
            </h1>

            <p
              className="leading-relaxed max-w-2xl mx-auto mb-12"
              style={{ fontSize: '13px', color: 'var(--text-second)', fontFamily: 'var(--font-mono)' }}
            >
              Kreditvakt analyserar skuldregisterdata i realtid och genererar ett insolvensbetyg 0–20
              för varje bolag i din portfölj. Validerat mot svenska konkursdata 2003–2023.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://norric-mcp-production.up.railway.app/signup/free"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[2px] text-[11px] uppercase tracking-[0.25em] font-bold transition-opacity hover:opacity-80"
                style={{ background: 'var(--gold)', color: 'var(--bg)' }}
              >
                Prova gratis <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="mailto:hej@norric.io?subject=Demo%20request"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[2px] text-[11px] uppercase tracking-[0.25em] font-bold transition-opacity hover:opacity-80"
                style={{ border: '0.5px solid var(--gold)', color: 'var(--gold)' }}
              >
                Boka demo
              </a>
            </div>
          </motion.div>
        </section>

        {/* ═══ TRUST BAR ════════════════════════════════════════ */}
        <section className="px-6 md:px-10 max-w-5xl mx-auto" style={{ borderTop: '0.5px solid var(--border)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {[
              { stat: '9 mån', label: 'Medianvarning före konkursansökan' },
              { stat: '80%',   label: 'Detekterbara konkurser i förväg'   },
              { stat: '6×',    label: 'Bättre träffsäkerhet än kreditbyråer' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className="py-10"
                style={{
                  paddingLeft:   i > 0 ? '2rem'  : 0,
                  paddingRight:  i < 2 ? '2rem'  : 0,
                  borderRight:   i < 2 ? '0.5px solid var(--border)' : 'none',
                }}
              >
                <div className="font-serif text-[2rem] font-bold leading-none mb-2" style={{ color: 'var(--text-primary)' }}>{item.stat}</div>
                <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ DEMO SCORE CARD ══════════════════════════════════ */}
        <section id="produkt" className="py-28 px-6 md:px-10 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left copy */}
            <div className="lg:pt-4">
              <p className="text-[10px] uppercase tracking-[0.3em] mb-5" style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
                Live-demo
              </p>
              <h2
                className="font-serif font-bold leading-tight mb-6"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text-primary)' }}
              >
                Insolvensbetyg<br />i realtid
              </h2>
              <p className="leading-relaxed mb-8" style={{ fontSize: '12px', color: 'var(--text-second)', fontFamily: 'var(--font-mono)' }}>
                Varje bolag i din portfölj tilldelas ett betyg 0–20 baserat på
                Kronofogdens skuldregister. Skalan är kalibrerad mot 20 år av
                svenska konkursutfall.
              </p>
              <div className="flex flex-wrap gap-3">
                {DEMO_COMPANIES.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setDemoIdx(i)}
                    className="text-[10px] uppercase tracking-[0.15em] px-4 py-2.5 rounded-[2px] transition-all"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      border:  `0.5px solid ${i === demoIdx ? 'var(--gold)' : 'var(--border)'}`,
                      color:   i === demoIdx ? 'var(--gold)' : 'var(--text-second)',
                      background: i === demoIdx ? 'var(--gold-dim)' : 'transparent',
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Right — score card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={demoIdx}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
                className="card p-8"
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="font-serif text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{demo.name}</div>
                    <div className="text-[10px] tracking-[0.2em]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      org.nr {demo.org_nr}
                    </div>
                  </div>
                  <span
                    className="risk-badge"
                    style={{
                      background: `${demo.color}18`,
                      color: demo.color,
                      border: `0.5px solid ${demo.color}55`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: demo.color }} />
                    {demo.label}
                  </span>
                </div>

                {/* Score display */}
                <div
                  className="text-center py-8 mb-6"
                  style={{ borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)' }}
                >
                  <motion.div
                    key={`score-${demoIdx}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="font-serif font-bold leading-none mb-2"
                    style={{ fontSize: '80px', color: demo.color }}
                  >
                    {demo.score}
                  </motion.div>
                  <div
                    className="text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    av 20 · Insolvensbetyg
                  </div>
                </div>

                <ScoreBar score={demo.score} color={demo.color} />

                <div className="mt-6 grid grid-cols-2 gap-4 text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
                  <div>
                    <div className="mb-1 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Skuldpoäng</div>
                    <div style={{ color: 'var(--text-primary)' }}>{demo.score * 47 + 12} tkr registrerat</div>
                  </div>
                  <div>
                    <div className="mb-1 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Datakälla</div>
                    <div style={{ color: 'var(--text-primary)' }}>Kronofogden · idag</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ═══ WHAT IT SOLVES ═══════════════════════════════════ */}
        <section className="py-20 px-6 md:px-10 max-w-5xl mx-auto" style={{ borderTop: '0.5px solid var(--border)' }}>
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.3em] mb-5" style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
              Varför Kreditvakt
            </p>
            <h2
              className="font-serif font-bold"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text-primary)' }}
            >
              Riskerna du inte ser<br />är de farligaste
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PAIN_POINTS.map(({ Icon, title, body }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-8"
              >
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-[2px] mb-6"
                  style={{ background: 'var(--gold-dim)', border: '0.5px solid var(--border)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="leading-relaxed" style={{ fontSize: '12px', color: 'var(--text-second)', fontFamily: 'var(--font-mono)' }}>
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ SCORING TABLE ════════════════════════════════════ */}
        <section className="py-20 px-6 md:px-10 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.3em] mb-5" style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
              Betygsskala
            </p>
            <h2
              className="font-serif font-bold"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }}
            >
              Vad betyder betyget?
            </h2>
          </div>
          <div className="card overflow-hidden">
            {SCORE_BANDS.map((band, i) => (
              <div
                key={i}
                className="grid items-center py-5 px-6 transition-colors"
                style={{
                  gridTemplateColumns: '90px 120px 1fr 70px',
                  gap: '1rem',
                  borderBottom: i < SCORE_BANDS.length - 1 ? '0.5px solid var(--border)' : 'none',
                }}
              >
                <div
                  className="text-sm font-bold tabular-nums"
                  style={{ color: band.color, fontFamily: 'var(--font-mono)' }}
                >
                  {band.range}
                </div>
                <span
                  className="risk-badge"
                  style={{ background: `${band.color}18`, color: band.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: band.color }} />
                  {band.label}
                </span>
                <p style={{ fontSize: '11px', color: 'var(--text-second)', fontFamily: 'var(--font-mono)' }}>
                  {band.desc}
                </p>
                <div
                  className="text-right font-bold"
                  style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {band.pct}
                </div>
              </div>
            ))}
          </div>
          <p
            className="text-center mt-4"
            style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            * 12-månaders konkursfrekvens per band · validerat mot data 2003–2023
          </p>
        </section>

        {/* ═══ PRICING ══════════════════════════════════════════ */}
        <section id="priser" className="py-20 px-6 md:px-10 max-w-7xl mx-auto" style={{ borderTop: '0.5px solid var(--border)' }}>
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.3em] mb-5" style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
              Prissättning
            </p>
            <h2
              className="font-serif font-bold"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--text-primary)' }}
            >
              Välj din plan
            </h2>
          </div>
          <Pricing />
        </section>

        {/* ═══ FOOTER ═══════════════════════════════════════════ */}
        <footer
          className="px-6 md:px-10 py-16 max-w-5xl mx-auto"
          style={{ borderTop: '0.5px solid var(--border)' }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 flex items-center justify-center rounded-[2px]" style={{ background: 'var(--gold)' }}>
                <Shield className="w-4 h-4" style={{ color: 'var(--bg)' }} />
              </div>
              <span className="font-serif text-base font-bold" style={{ color: 'var(--text-primary)' }}>Kreditvakt</span>
            </div>
            <nav
              className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.2em]"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              <a href="https://norric.io/developer-docs.html" className="transition-opacity hover:opacity-100" style={{ opacity: 0.7 }}>API-dokumentation</a>
              <a href="mailto:hej@norric.io"                 className="transition-opacity hover:opacity-100" style={{ opacity: 0.7 }}>Kontakt</a>
              <a href="https://norric.io"                    className="transition-opacity hover:opacity-100" style={{ opacity: 0.7 }}>Norric AB</a>
            </nav>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              © 2025 Norric AB · Malmö, Sverige
            </p>
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.8 }}>
            Kreditvakt analyserar offentliga administrativa data. Ingen personuppgiftsbehandling.
            GDPR-kompatibelt. Alla signaler är offentliga enligt svensk lag.
          </p>
        </footer>
      </main>

      {/* ═══ MOBILE PORTFOLIO BANNER ══════════════════════════ */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: 'var(--nav-bg)',
          borderTop: '0.5px solid var(--border)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
      >
        <div>
          <div
            className="text-[9px] uppercase tracking-[0.2em] mb-0.5"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            Prova gratis
          </div>
          <div className="font-serif text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>
            10 uppslag · Ingen kreditkort
          </div>
        </div>
        <a
          href="https://norric-mcp-production.up.railway.app/signup/free"
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold px-5 py-3 rounded-[2px] transition-opacity hover:opacity-80"
          style={{ background: 'var(--gold)', color: 'var(--bg)', fontFamily: 'var(--font-mono)' }}
        >
          Starta <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

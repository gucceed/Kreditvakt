import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pricing } from './components/Pricing';
import { SignupModal } from './components/SignupModal';

/* ── Inline mark — no icon library ────────────────────────── */
const ShieldMark = ({ size = 16, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 16 20" fill="none" aria-hidden="true" style={style}>
    <path d="M8 0L0 3.636V9.09c0 5.319 3.413 10.288 8 11.546C12.587 19.378 16 14.41 16 9.09V3.636L8 0z" fill="currentColor" />
  </svg>
);

/* ── Static data ───────────────────────────────────────────── */
const SCORE_BANDS = [
  { range: '0 – 4',   label: 'Stabil',       color: '#10B981', pct: '< 1%',   desc: 'Inga signifikanta skuldindikationer' },
  { range: '5 – 8',   label: 'Bevaka',        color: '#EAB308', pct: '2–5%',   desc: 'Måttliga skuldsignaler — bevaka aktivt' },
  { range: '9 – 12',  label: 'Förhöjd risk',  color: '#F97316', pct: '8–15%',  desc: 'Tydliga skuldmönster — agera proaktivt' },
  { range: '13 – 16', label: 'Hög risk',      color: '#EA580C', pct: '20–35%', desc: 'Allvarliga betalningsproblem registrerade' },
  { range: '17 – 20', label: 'Kritisk',       color: '#EF4444', pct: '> 50%',  desc: 'Imminent konkursrisk — omedelbar åtgärd' },
];

const DEMO_COMPANIES = [
  { name: 'Exemplet Bygg AB',   org_nr: '556 677-8899', score: 3,  label: 'Stabil',       color: '#10B981' },
  { name: 'Nordisk Handel AB',  org_nr: '556 788-9900', score: 10, label: 'Förhöjd risk', color: '#F97316' },
  { name: 'Fastighets AB Alfa', org_nr: '556 899-0011', score: 16, label: 'Hög risk',     color: '#EA580C' },
];

const PAIN_POINTS = [
  {
    num: '01',
    title: 'Leverantörsrisker',
    body: 'Leverantörskonkurser skapar produktionsstopp. Kreditvakt ger 9 månaders förvarning — tid att säkra alternativ.',
  },
  {
    num: '02',
    title: 'Kundkrediter',
    body: 'Kreditbeslut på ofullständig information leder till kundförluster. Modellen är kalibrerad mot 20 år av konkursdata.',
  },
  {
    num: '03',
    title: 'Portföljövervakning',
    body: 'Manuell uppföljning av hundratals motparter är inte skalbart. Kreditvakt skannar din portfölj och eskalerar automatiskt.',
  },
];

/* ── Score bar ─────────────────────────────────────────────── */
function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="h-px w-full" style={{ background: 'var(--border)' }}>
      <motion.div
        className="h-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${(score / 20) * 100}%` }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────── */
export default function App() {
  const [light, setLight]     = useState(false);
  const [menuOpen, setMenu]   = useState(false);
  const [demoIdx, setDemo]    = useState(0);
  const [showSignup, setSignup] = useState(false);

  const demo = DEMO_COMPANIES[demoIdx];

  return (
    <div
      className={light ? 'light' : ''}
      style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)', transition: 'background 0.3s ease' }}
    >
      {showSignup && <SignupModal onClose={() => setSignup(false)} />}

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="nav-glass fixed top-0 w-full z-50 px-6 md:px-12 py-5 flex items-center justify-between">

        <a href="#" className="flex items-center gap-3">
          {/* gold 1 / 6 */}
          <div className="w-7 h-7 flex items-center justify-center" style={{ background: 'var(--gold)', borderRadius: '2px' }}>
            <ShieldMark size={13} style={{ color: 'var(--bg)' }} />
          </div>
          <span className="font-serif text-[17px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Kreditvakt
          </span>
        </a>

        <div
          className="hidden md:flex items-center gap-10 text-[10px] uppercase tracking-[0.22em]"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          <a href="#produkt" className="transition-opacity hover:opacity-100" style={{ opacity: 0.7 }}>Produkt</a>
          <a href="#priser"  className="transition-opacity hover:opacity-100" style={{ opacity: 0.7 }}>Priser</a>
          <a href="https://norric.io/developer-docs.html" className="transition-opacity hover:opacity-100" style={{ opacity: 0.7 }}>API</a>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLight(l => !l)}
            aria-label="Byt tema"
            className="transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1 }}
          >
            {light ? '◑' : '◐'}
          </button>
          {/* gold 2 / 6 */}
          <a
            href="#priser"
            className="hidden md:block text-[10px] uppercase tracking-[0.25em] font-bold px-5 py-2.5 transition-opacity hover:opacity-80"
            style={{ background: 'var(--gold)', color: 'var(--bg)', borderRadius: '2px', fontFamily: 'var(--font-mono)' }}
          >
            Kom igång
          </a>
          {/* hamburger — CSS only */}
          <button
            className="md:hidden"
            onClick={() => setMenu(o => !o)}
            aria-label="Meny"
            style={{ color: 'var(--text-muted)' }}
          >
            {menuOpen ? (
              <span style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>×</span>
            ) : (
              <div className="flex flex-col gap-[5px]">
                <div className="w-5 h-px" style={{ background: 'var(--text-muted)' }} />
                <div className="w-5 h-px" style={{ background: 'var(--text-muted)' }} />
                <div className="w-3.5 h-px" style={{ background: 'var(--text-muted)' }} />
              </div>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="nav-glass fixed top-[64px] inset-x-0 z-40 px-8 py-8 flex flex-col gap-6"
          >
            {[
              { href: '#produkt', label: 'Produkt' },
              { href: '#priser',  label: 'Priser'  },
              { href: 'https://norric.io/developer-docs.html', label: 'API' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenu(false)}
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{ color: 'var(--text-second)', fontFamily: 'var(--font-mono)' }}
              >
                {label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pb-28 md:pb-0">

        {/* ── Hero ────────────────────────────────────────────── */}
        <section className="pt-44 pb-32 md:pt-56 md:pb-40 px-6 md:px-12 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.35em] mb-12"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              Kreditriskbevakning · Bankstandard
            </p>

            <h1
              className="font-serif font-bold leading-[1.02] mb-10"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
            >
              Se insolvensen<br />
              {/* gold 3 / 6 */}
              <span style={{ color: 'var(--gold)' }}>9 månader</span> innan<br />
              konkursansökan
            </h1>

            <p
              className="max-w-lg mx-auto mb-14"
              style={{ fontSize: '13px', color: 'var(--text-second)', fontFamily: 'var(--font-mono)', lineHeight: '1.9' }}
            >
              Skuldregisterdata i realtid. Insolvensbetyg 0–20 per bolag.
              Validerat mot svenska konkursdata 2003–2023.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* gold 4 / 6 */}
              <button
                onClick={() => setSignup(true)}
                className="inline-flex items-center justify-center px-8 py-4 text-[11px] uppercase tracking-[0.25em] font-bold transition-opacity hover:opacity-80"
                style={{ background: 'var(--gold)', color: 'var(--bg)', borderRadius: '2px', fontFamily: 'var(--font-mono)' }}
              >
                Prova gratis — 10 uppslag
              </button>
              <a
                href="mailto:hej@norric.io?subject=Demo%20request"
                className="inline-flex items-center justify-center px-8 py-4 text-[11px] uppercase tracking-[0.25em] font-bold transition-opacity hover:opacity-70"
                style={{ border: '0.5px solid var(--border-h)', color: 'var(--text-second)', borderRadius: '2px', fontFamily: 'var(--font-mono)' }}
              >
                Boka demo
              </a>
            </div>
          </motion.div>
        </section>

        {/* ── Trust bar ───────────────────────────────────────── */}
        <section className="px-6 md:px-12 max-w-5xl mx-auto" style={{ borderTop: '0.5px solid var(--border)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {[
              { stat: '9 mån', label: 'Medianvarning — konkursansökan'      },
              { stat: '80%',   label: 'Detekterbara konkurser i förväg'      },
              { stat: '6×',    label: 'Träffsäkerhet vs. kreditbyråer'       },
            ].map((item, i) => (
              <div
                key={i}
                className="py-12"
                style={{
                  paddingLeft:  i > 0 ? '2.5rem' : 0,
                  paddingRight: i < 2 ? '2.5rem' : 0,
                  borderRight:  i < 2 ? '0.5px solid var(--border)' : 'none',
                }}
              >
                <div
                  className="font-serif font-bold leading-none mb-2"
                  style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}
                >
                  {item.stat}
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Demo score card ─────────────────────────────────── */}
        <section id="produkt" className="py-32 px-6 md:px-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-20 items-start">

            <div>
              <p
                className="text-[10px] uppercase tracking-[0.35em] mb-8"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                Demonstrationsvy
              </p>
              <h2
                className="font-serif font-bold leading-tight mb-8"
                style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: 'var(--text-primary)' }}
              >
                Insolvensbetyg<br />i realtid
              </h2>
              <p
                className="leading-relaxed mb-10"
                style={{ fontSize: '12px', color: 'var(--text-second)', fontFamily: 'var(--font-mono)', lineHeight: '1.9' }}
              >
                Varje bolag tilldelas ett betyg 0–20 baserat på Kronofogdens
                skuldregister. Kalibrerat mot 20 år av konkursutfall.
              </p>
              {/* Company tabs — no gold active state */}
              <div className="flex flex-wrap gap-2">
                {DEMO_COMPANIES.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setDemo(i)}
                    className="text-[10px] uppercase tracking-[0.12em] px-4 py-2.5 transition-all"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      border: '0.5px solid var(--border)',
                      borderRadius: '2px',
                      color:       i === demoIdx ? 'var(--text-primary)' : 'var(--text-muted)',
                      borderColor: i === demoIdx ? 'var(--border-h)' : 'var(--border)',
                      opacity:     i === demoIdx ? 1 : 0.55,
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={demoIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: 'var(--bg-card)',
                  border: '0.5px solid var(--border)',
                  borderRadius: '2px',
                  padding: '2.5rem',
                }}
              >
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <div className="font-serif text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {demo.name}
                    </div>
                    <div
                      className="text-[10px] tracking-[0.15em]"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      org.nr {demo.org_nr}
                    </div>
                  </div>
                  <div
                    className="text-[9px] uppercase tracking-[0.2em] px-3 py-1.5"
                    style={{
                      borderRadius: '2px',
                      border: `0.5px solid ${demo.color}55`,
                      color: demo.color,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {demo.label}
                  </div>
                </div>

                {/* Score — financial terminal: no animation, just data */}
                <div
                  className="text-center py-10 mb-8"
                  style={{ borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)' }}
                >
                  <div
                    className="font-serif font-bold leading-none mb-3"
                    style={{ fontSize: '88px', color: demo.color, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {demo.score}
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    av 20 · Insolvensbetyg
                  </div>
                </div>

                <ScoreBar score={demo.score} color={demo.color} />

                <div className="mt-8 grid grid-cols-2 gap-6" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  <div>
                    <div className="uppercase tracking-[0.15em] mb-1.5" style={{ color: 'var(--text-muted)' }}>Skulder registrerade</div>
                    <div style={{ color: 'var(--text-primary)' }}>{(demo.score * 47 + 12).toLocaleString('sv-SE')} tkr</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-[0.15em] mb-1.5" style={{ color: 'var(--text-muted)' }}>Datakälla</div>
                    <div style={{ color: 'var(--text-primary)' }}>Kronofogden · idag</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ── What it solves ──────────────────────────────────── */}
        <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto" style={{ borderTop: '0.5px solid var(--border)' }}>
          <div className="mb-16">
            <p
              className="text-[10px] uppercase tracking-[0.35em] mb-8"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              Riskscenarier
            </p>
            <h2
              className="font-serif font-bold max-w-lg"
              style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', color: 'var(--text-primary)' }}
            >
              Riskerna du inte ser<br />är de farligaste
            </h2>
          </div>

          {/* Columns — no cards, no icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10" style={{ borderTop: '0.5px solid var(--border)' }}>
            {PAIN_POINTS.map(({ num, title, body }) => (
              <div key={num} className="pt-8">
                <div
                  className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {num}
                </div>
                <h3
                  className="font-serif text-xl font-bold mb-4"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-second)', fontFamily: 'var(--font-mono)', lineHeight: '1.9' }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Scoring table ───────────────────────────────────── */}
        <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
          <div className="mb-12">
            <p
              className="text-[10px] uppercase tracking-[0.35em] mb-8"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              Betygsskala 0–20
            </p>
            <h2
              className="font-serif font-bold"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }}
            >
              Vad betyder betyget?
            </h2>
          </div>

          <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            {SCORE_BANDS.map((band, i) => (
              <div
                key={i}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: i < SCORE_BANDS.length - 1 ? '0.5px solid var(--border)' : 'none',
                }}
              >
                {/* Top row: range | label | pct */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <span
                      style={{ fontSize: '12px', fontWeight: 700, color: band.color, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {band.range}
                    </span>
                    <span
                      style={{ fontSize: '10px', color: band.color, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', borderLeft: `2px solid ${band.color}`, paddingLeft: '10px' }}
                    >
                      {band.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {band.pct}
                  </span>
                </div>
                {/* Description — full width, below */}
                <p style={{ fontSize: '11px', color: 'var(--text-second)', fontFamily: 'var(--font-mono)' }}>
                  {band.desc}
                </p>
              </div>
            ))}
          </div>
          <p
            className="mt-4"
            style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            Konkursfrekvens per band · Validerat 2003–2023
          </p>
        </section>

        {/* ── Pricing ─────────────────────────────────────────── */}
        <section id="priser" className="py-24 px-6 md:px-12 max-w-7xl mx-auto" style={{ borderTop: '0.5px solid var(--border)' }}>
          <div className="mb-16">
            <p
              className="text-[10px] uppercase tracking-[0.35em] mb-8"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              Prissättning
            </p>
            <h2
              className="font-serif font-bold"
              style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: 'var(--text-primary)' }}
            >
              Välj din plan
            </h2>
          </div>
          <Pricing onSignup={() => setSignup(true)} />
        </section>

        {/* ── Footer ──────────────────────────────────────────── */}
        <footer
          className="px-6 md:px-12 py-16 max-w-5xl mx-auto"
          style={{ borderTop: '0.5px solid var(--border)' }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-3">
              {/* gold 5 / 6 */}
              <div
                className="w-7 h-7 flex items-center justify-center"
                style={{ background: 'var(--gold)', borderRadius: '2px' }}
              >
                <ShieldMark size={13} style={{ color: 'var(--bg)' }} />
              </div>
              <span className="font-serif text-base font-bold" style={{ color: 'var(--text-primary)' }}>Kreditvakt</span>
            </div>
            <nav
              className="flex flex-wrap gap-8 text-[10px] uppercase tracking-[0.2em]"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              <a href="https://norric.io/developer-docs.html" style={{ opacity: 0.6 }} className="transition-opacity hover:opacity-100">API</a>
              <a href="mailto:hej@norric.io"                 style={{ opacity: 0.6 }} className="transition-opacity hover:opacity-100">hej@norric.io</a>
              <a href="https://norric.io"                    style={{ opacity: 0.6 }} className="transition-opacity hover:opacity-100">Norric AB</a>
            </nav>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              © 2025 Norric AB · Malmö
            </p>
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: '1.9' }}>
            Analyserar offentliga administrativa data. Ingen personuppgiftsbehandling.
            GDPR-kompatibelt. Alla signaler är offentliga enligt svensk lag.
          </p>
        </footer>
      </main>

      {/* ── Mobile sticky banner ────────────────────────────── */}
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
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Prova gratis
          </div>
          <div className="font-serif font-bold" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
            10 uppslag · Ingen kreditkort
          </div>
        </div>
        {/* gold 6 / 6 */}
        <button
          onClick={() => setSignup(true)}
          className="text-[10px] uppercase tracking-[0.2em] font-bold px-5 py-3 transition-opacity hover:opacity-80"
          style={{ background: 'var(--gold)', color: 'var(--bg)', borderRadius: '2px', fontFamily: 'var(--font-mono)' }}
        >
          Starta →
        </button>
      </div>
    </div>
  );
}

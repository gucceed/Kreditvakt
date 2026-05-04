import React from 'react';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };
const serif: React.CSSProperties = { fontFamily: 'var(--font-serif)' };

const DEBTS = [
  { creditor: 'Skatteverket',         amount: '312 400 kr', type: 'Skatteskuld',          date: '2024-08-14' },
  { creditor: 'Kronofogden',          amount: '187 200 kr', type: 'Utsökning',             date: '2024-09-01' },
  { creditor: 'Swedbank Factoring',   amount: '98 750 kr',  type: 'Fordringsöverlåtelse',  date: '2024-07-22' },
  { creditor: 'Transportstyrelsen',   amount: '44 600 kr',  type: 'Fordonsskuld',          date: '2024-10-03' },
  { creditor: 'Arbetsgivaravgifter',  amount: '38 900 kr',  type: 'Sociala avgifter',       date: '2024-06-30' },
];

const EVENTS = [
  { date: '2024-10-03', event: 'Ny skuld registrerad — Transportstyrelsen 44 600 kr' },
  { date: '2024-09-01', event: 'Utsökningsmål öppnat — Kronofogden' },
  { date: '2024-08-14', event: 'Skatteskuld eskalerad till Kronofogden' },
  { date: '2024-07-22', event: 'Factoring-fordran överlåten — Swedbank' },
  { date: '2024-03-15', event: 'Första skuldindikatorn registrerad' },
];

export default function SamplePage() {
  const score = 16;
  const scoreColor = '#EA580C';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>

      {/* Nav */}
      <nav style={{ padding: '1.25rem 3rem', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          ← Kreditvakt
        </a>
        <span style={{ ...mono, fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
          Exempelrapport · Ej verklig data
        </span>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.35em', marginBottom: '1rem' }}>
            Kreditvakt · Insolvensanalys
          </p>
          <h1 style={{ ...serif, fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '0.5rem' }}>
            Nordström Logistik AB
          </h1>
          <div style={{ ...mono, fontSize: '11px', color: 'var(--text-muted)' }}>
            Org.nr 556 712-4433 · Analyserad {new Date().toLocaleDateString('sv-SE')}
          </div>
        </div>

        {/* Score */}
        <div style={{ border: '0.5px solid var(--border)', borderTop: `2px solid ${scoreColor}`, borderRadius: '2px', padding: '2.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ ...mono, fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '0.75rem' }}>Insolvensbetyg</div>
            <div style={{ ...serif, fontSize: '5rem', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{score}</div>
            <div style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', marginTop: '0.5rem' }}>av 20</div>
          </div>
          <div>
            <div style={{ ...mono, fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '0.75rem' }}>Risknivå</div>
            <div style={{ ...serif, fontSize: '1.5rem', fontWeight: 700, color: scoreColor }}>Hög risk</div>
            <div style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Konkursfrekvens 20–35%</div>
          </div>
          <div>
            <div style={{ ...mono, fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '0.75rem' }}>Total skuldbörda</div>
            <div style={{ ...serif, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>681 850 kr</div>
            <div style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', marginTop: '0.5rem' }}>5 fordringsägare</div>
          </div>
        </div>

        {/* Score bar */}
        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '3rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(score / 20) * 100}%`, background: scoreColor }} />
        </div>

        {/* Debt table */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1.5rem' }}>
            Skuldinventering · Kronofogden
          </p>
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '0.75rem 1.25rem', background: 'var(--bg-card)', borderBottom: '0.5px solid var(--border)' }}>
              {['Fordringsägare', 'Belopp', 'Typ', 'Datum'].map(h => (
                <span key={h} style={{ ...mono, fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{h}</span>
              ))}
            </div>
            {DEBTS.map((d, i) => (
              <div
                key={i}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '1rem 1.25rem', borderBottom: i < DEBTS.length - 1 ? '0.5px solid var(--border)' : 'none' }}
              >
                <span style={{ ...mono, fontSize: '11px', color: 'var(--text-primary)' }}>{d.creditor}</span>
                <span style={{ ...mono, fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>{d.amount}</span>
                <span style={{ ...mono, fontSize: '11px', color: 'var(--text-second)' }}>{d.type}</span>
                <span style={{ ...mono, fontSize: '11px', color: 'var(--text-muted)' }}>{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1.5rem' }}>
            Händelsehistorik
          </p>
          {EVENTS.map((ev, i) => (
            <div key={i} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.25rem', borderBottom: i < EVENTS.length - 1 ? '0.5px solid var(--border)' : 'none', marginBottom: i < EVENTS.length - 1 ? '1.25rem' : 0 }}>
              <span style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0, paddingTop: '1px' }}>{ev.date}</span>
              <span style={{ ...mono, fontSize: '11px', color: 'var(--text-second)', lineHeight: 1.6 }}>{ev.event}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="/signup"
            style={{
              ...mono, display: 'inline-block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700,
              padding: '0.875rem 2rem', background: 'var(--gold)', color: 'var(--bg)', borderRadius: '2px', textDecoration: 'none',
            }}
          >
            Skaffa API-nyckel gratis →
          </a>
          <a
            href="/docs"
            style={{
              ...mono, display: 'inline-block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700,
              padding: '0.875rem 2rem', border: '0.5px solid var(--border-h)', color: 'var(--text-second)', borderRadius: '2px', textDecoration: 'none',
            }}
          >
            Dokumentation →
          </a>
        </div>

        <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', marginTop: '2rem', lineHeight: 1.8 }}>
          Detta är ett exempeldokument med fiktiv data. Verkliga rapporter genereras i realtid från Kronofogdens skuldregister.
          All data är offentlig och GDPR-kompatibel.
        </p>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type Step = 0 | 1 | 2 | 3;

const TIER_DATA: Record<string, { label: string; price: string; features: string[]; badge: string }> = {
  silver: {
    label: 'Silver', badge: 'Grundläggande', price: '499 kr/månad',
    features: ['500 uppslag per månad', 'Kreditriskvärdering', 'Automatiska riskvarningar', 'Upp till 10 konton per företag'],
  },
  guld: {
    label: 'Guld', badge: 'Mest valda', price: '1 499 kr/månad',
    features: ['Obegränsade uppslag', 'Komplett skuldanalys', 'Fordringsägardetaljer', 'CSV-export', 'Prioritetssupport'],
  },
  premium: {
    label: 'Premium', badge: 'Avancerat', price: '4 999 kr/månad',
    features: ['Obegränsade uppslag', 'Allt i Guld', 'Dedikerad kontaktperson', 'SLA-garanti', 'Full API-åtkomst', 'Anpassade webhooks'],
  },
};

const MOCK_REPORT = {
  name: 'Exempelföretaget AB',
  orgnr: '556000-3744',
  score: 72,
  risk_label: 'Stable',
  risk_level: 1,
  summary: 'Inga aktiva betalningsanmärkningar. Stabil skuldsättningsgrad de senaste 12 månaderna. Bolaget visar god likviditet.',
  creditors: [
    { name: 'Kronofogdemyndigheten', amount: '0 kr', status: 'Inga ärenden' },
    { name: 'Skatteverket', amount: '—', status: 'Aktiv' },
  ],
};

const RISK_COLOR: Record<number, string> = { 1: '#10B981', 2: '#EAB308', 3: '#F97316', 4: '#EA580C', 5: '#EF4444' };

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };
const serif: React.CSSProperties = { fontFamily: 'var(--font-serif)' };

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '2.5rem' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '2px', flex: 1,
            background: i <= current ? 'var(--gold)' : 'var(--border)',
            transition: 'background 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

function Step0Tier({ tier, onNext }: { tier: string; onNext: () => void }) {
  const data = TIER_DATA[tier] ?? TIER_DATA.silver;
  return (
    <div>
      <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1.5rem' }}>
        {data.badge}
      </p>
      <h1 style={{ ...serif, fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        {data.label}-abonnemang
      </h1>
      <p style={{ ...mono, fontSize: '1.1rem', color: 'var(--gold)', marginBottom: '2rem' }}>
        {data.price}
      </p>
      <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', marginBottom: '2rem' }}>
        {data.features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < data.features.length - 1 ? '0.875rem' : 0 }}>
            <span style={{ color: 'var(--gold)', fontSize: '12px' }}>✓</span>
            <span style={{ ...mono, fontSize: '12px', color: 'var(--text-second)' }}>{f}</span>
          </div>
        ))}
      </div>
      <button onClick={onNext} style={primaryBtn}>
        Se ett exempel →
      </button>
    </div>
  );
}

function Step1Demo({ onNext }: { onNext: () => void }) {
  const r = MOCK_REPORT;
  const color = RISK_COLOR[r.risk_level];
  return (
    <div>
      <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1.5rem' }}>
        Exempelrapport
      </p>
      <h1 style={{ ...serif, fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Så här ser en kreditrapport ut.
      </h1>
      <p style={{ ...mono, fontSize: '12px', color: 'var(--text-second)', lineHeight: 1.8, marginBottom: '2rem' }}>
        Varje sökning returnerar ett riskindex, sammanfattning och skuldinformation i realtid.
      </p>

      {/* Mock report card */}
      <div style={{ border: '0.5px solid var(--border-h)', borderRadius: '2px', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ ...mono, fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '4px' }}>
              Bolag
            </p>
            <p style={{ ...serif, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{r.name}</p>
            <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)' }}>{r.orgnr}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ ...mono, fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>
              Riskindex
            </p>
            <p style={{ ...mono, fontSize: '2rem', fontWeight: 700, color }}>{r.score}</p>
            <span style={{
              ...mono, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em',
              color, border: `0.5px solid ${color}`, borderRadius: '2px', padding: '2px 8px',
            }}>
              {r.risk_label}
            </span>
          </div>
        </div>
        <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '1rem', marginBottom: '1rem' }}>
          <p style={{ ...mono, fontSize: '11px', color: 'var(--text-second)', lineHeight: 1.8 }}>
            {r.summary}
          </p>
        </div>
        <div>
          {r.creditors.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: i === 0 ? '0.5px solid var(--border)' : undefined }}>
              <span style={{ ...mono, fontSize: '11px', color: 'var(--text-second)' }}>{c.name}</span>
              <span style={{ ...mono, fontSize: '11px', color: 'var(--text-primary)' }}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onNext} style={primaryBtn}>
        Skapa konto →
      </button>
    </div>
  );
}

function Step2Form({ tier, orgnr: defaultOrgnr, onNext }: { tier: string; orgnr: string; onNext: (email: string) => void }) {
  const [email, setEmail]     = useState('');
  const [company, setCompany] = useState('');
  const [orgnr, setOrgnr]     = useState(defaultOrgnr ? formatOrgnr(defaultOrgnr) : '');
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const res = await fetch('/api/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, tier, orgnr: orgnr.replace(/\D/g, '') }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Något gick fel, försök igen.');
      }
      onNext(email);
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : 'Något gick fel, försök igen.');
      setBusy(false);
    }
  }

  return (
    <div>
      <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1.5rem' }}>
        Skapa konto
      </p>
      <h1 style={{ ...serif, fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2rem' }}>
        Ange dina uppgifter.
      </h1>
      <form onSubmit={submit}>
        <FormField label="E-postadress">
          <input
            type="email" required value={email} placeholder="din@organisation.se"
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'var(--border-h)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </FormField>
        <FormField label="Företagsnamn">
          <input
            type="text" required value={company} placeholder="Acme AB"
            onChange={e => setCompany(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'var(--border-h)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </FormField>
        <FormField label="Organisationsnummer">
          <input
            type="text" required value={orgnr} placeholder="556123-4567"
            onChange={e => setOrgnr(e.target.value)}
            onBlur={e => { if (e.target.value) setOrgnr(formatOrgnr(e.target.value)); }}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'var(--border-h)')}
          />
        </FormField>

        {err && (
          <p style={{ ...mono, fontSize: '11px', color: '#8a1c1c', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            {err}
          </p>
        )}

        <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.5 : 1, cursor: busy ? 'not-allowed' : 'pointer' }}>
          {busy ? 'Skickar…' : 'Skicka aktiveringslänk →'}
        </button>
        <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
          Inget kreditkort. Aktiveringslänk skickas direkt.
        </p>
      </form>
    </div>
  );
}

function Step3Check({ email }: { email: string }) {
  return (
    <div>
      <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1.5rem' }}>
        Klart
      </p>
      <h1 style={{ ...serif, fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        Kolla din inkorg.
      </h1>
      <p style={{ ...mono, fontSize: '12px', color: 'var(--text-second)', lineHeight: 1.9, marginBottom: '2rem' }}>
        Vi har skickat en aktiveringslänk till{' '}
        <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
        Klicka på länken för att aktivera ditt konto — den är giltig i 15 minuter.
      </p>
      <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.25rem', marginBottom: '2rem' }}>
        <p style={{ ...mono, fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
          Hittar du inte mejlet? Kontrollera skräpposten eller mejla{' '}
          <a href="mailto:hej@norric.io" style={{ color: 'var(--text-primary)' }}>hej@norric.io</a>.
        </p>
      </div>
      <a href="/" style={{ ...mono, display: 'block', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, padding: '0.875rem', border: '0.5px solid var(--border-h)', color: 'var(--text-second)', borderRadius: '2px', textDecoration: 'none' }}>
        Tillbaka till startsidan
      </a>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', ...mono, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function formatOrgnr(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  return digits;
}

const primaryBtn: React.CSSProperties = {
  ...mono, width: '100%', background: 'var(--gold)', color: 'var(--bg)',
  border: 'none', borderRadius: '2px', padding: '0.9rem',
  fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700,
  cursor: 'pointer', display: 'block', textAlign: 'center',
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'transparent',
  border: '0.5px solid var(--border)', borderRadius: '2px',
  padding: '0.75rem 1rem', color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)', fontSize: '12px',
  outline: 'none', boxSizing: 'border-box',
};

export default function OnboardingPage() {
  const [searchParams] = useSearchParams();
  const tier  = searchParams.get('tier') ?? 'silver';
  const orgnr = searchParams.get('orgnr') ?? '';

  const [step, setStep]   = useState<Step>(0);
  const [email, setEmail] = useState('');

  const data = TIER_DATA[tier] ?? TIER_DATA.silver;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '480px', marginBottom: '2rem' }}>
        <a href="/pricing" style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          ← Tillbaka
        </a>
      </div>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <StepIndicator current={step} total={4} />
        {step === 0 && <Step0Tier tier={tier} onNext={() => setStep(1)} />}
        {step === 1 && <Step1Demo onNext={() => setStep(2)} />}
        {step === 2 && (
          <Step2Form
            tier={tier} orgnr={orgnr}
            onNext={em => { setEmail(em); setStep(3); }}
          />
        )}
        {step === 3 && <Step3Check email={email} />}
      </div>
      {step < 3 && (
        <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', marginTop: '2rem' }}>
          Steg {step + 1} av 4 — {data.label}
        </p>
      )}
    </div>
  );
}

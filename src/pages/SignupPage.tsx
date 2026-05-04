import React, { useState } from 'react';

const API = 'https://norric-mcp-production.up.railway.app';

type State = 'idle' | 'submitting' | 'success' | 'error';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

export default function SignupPage() {
  const [email, setEmail]       = useState('');
  const [company, setCompany]   = useState('');
  const [useCase, setUseCase]   = useState('');
  const [state, setState]       = useState<State>('idle');
  const [errMsg, setErrMsg]     = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('submitting');
    setErrMsg('');
    try {
      const res = await fetch(`${API}/signup/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, use_case: useCase || undefined }),
      });
      if (res.ok) {
        setState('success');
      } else if (res.status === 409) {
        setErrMsg('Det finns redan en nyckel för den här e-postadressen. Mejla hej@norric.io om du behöver hjälp.');
        setState('error');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrMsg(data.detail || data.message || 'Något gick fel. Försök igen om en stund eller mejla hej@norric.io.');
        setState('error');
      }
    } catch {
      setErrMsg('Något gick fel. Försök igen om en stund eller mejla hej@norric.io.');
      setState('error');
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

      {/* Back link */}
      <div style={{ width: '100%', maxWidth: '480px', marginBottom: '2rem' }}>
        <a
          href="/"
          style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.2em' }}
        >
          ← Kreditvakt
        </a>
      </div>

      <div style={{ width: '100%', maxWidth: '480px' }}>
        {state === 'success' ? (
          <div>
            <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1.5rem' }}>
              Klart
            </p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Nyckeln är på väg.
            </h1>
            <p style={{ ...mono, fontSize: '12px', color: 'var(--text-second)', lineHeight: 1.9, marginBottom: '2rem' }}>
              Din API-nyckel skickas till <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Kolla din inkorg om 60 sekunder.{' '}
              Hittar du den inte? Mejla{' '}
              <a href="mailto:hej@norric.io" style={{ color: 'var(--text-primary)' }}>hej@norric.io</a>.
            </p>
            <a
              href="/docs"
              style={{
                ...mono,
                display: 'block',
                textAlign: 'center',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                fontWeight: 700,
                padding: '0.875rem',
                border: '0.5px solid var(--border-h)',
                borderRadius: '2px',
                color: 'var(--text-second)',
                textDecoration: 'none',
              }}
            >
              Läs dokumentationen →
            </a>
          </div>
        ) : (
          <>
            <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1.5rem' }}>
              Gratis · 100 uppslag/månad
            </p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Skaffa din API-nyckel
            </h1>
            <p style={{ ...mono, fontSize: '12px', color: 'var(--text-second)', lineHeight: 1.9, marginBottom: '2.5rem' }}>
              100 gratis uppslag/månad. Inga kreditkortsuppgifter. Nyckeln skickas via mejl inom 60 sekunder.
            </p>

            <form onSubmit={submit}>
              <Field label="E-postadress">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="din@organisation.se"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--border-h)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </Field>

              <Field label="Företag">
                <input
                  type="text"
                  required
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Acme AB"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--border-h)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </Field>

              <Field label="Användningsfall (valfritt)">
                <textarea
                  value={useCase}
                  onChange={e => setUseCase(e.target.value.slice(0, 200))}
                  placeholder="T.ex. kreditbedömning av leverantörer, portföljövervakning..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--border-h)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <div style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                  {useCase.length}/200
                </div>
              </Field>

              {state === 'error' && (
                <p style={{ ...mono, fontSize: '11px', color: '#8a1c1c', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                  {errMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={state === 'submitting'}
                style={{
                  ...mono,
                  width: '100%',
                  background: 'var(--gold)',
                  color: 'var(--bg)',
                  border: 'none',
                  borderRadius: '2px',
                  padding: '0.9rem',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.25em',
                  fontWeight: 700,
                  cursor: state === 'submitting' ? 'not-allowed' : 'pointer',
                  opacity: state === 'submitting' ? 0.5 : 1,
                  marginBottom: '1rem',
                }}
              >
                {state === 'submitting' ? 'Skickar…' : 'Skaffa API-nyckel'}
              </button>

              <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Genom att registrera dig godkänner du våra villkor.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: '0.5px solid var(--border)',
  borderRadius: '2px',
  padding: '0.75rem 1rem',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  outline: 'none',
  boxSizing: 'border-box',
};

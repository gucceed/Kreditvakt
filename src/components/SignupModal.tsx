import React, { useState } from 'react';

const API = 'https://norric-mcp-production.up.railway.app';

type State = 'idle' | 'submitting' | 'success' | 'error';

interface Props {
  onClose: () => void;
}

export function SignupModal({ onClose }: Props) {
  const [email, setEmail]     = useState('');
  const [orgNr, setOrgNr]     = useState('');
  const [state, setState]     = useState<State>('idle');
  const [apiKey, setApiKey]   = useState('');
  const [errMsg, setErrMsg]   = useState('');
  const [copied, setCopied]   = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('submitting');
    setErrMsg('');
    try {
      const res = await fetch(`${API}/signup/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, org_nr: orgNr.replace(/\D/g, '') }),
      });
      const data = await res.json();
      if (res.ok && data.api_key) {
        setApiKey(data.api_key);
        setState('success');
      } else if (res.status === 409) {
        setErrMsg('Det finns redan en nyckel för detta organisationsnummer. Kontakta hej@norric.io.');
        setState('error');
      } else {
        setErrMsg(data.detail || data.message || 'Något gick fel. Försök igen.');
        setState('error');
      }
    } catch {
      setErrMsg('Nätverksfel — kontrollera din anslutning och försök igen.');
      setState('error');
    }
  }

  function copy() {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--bg)',
          border: '0.5px solid var(--border-h)',
          borderRadius: '2px',
          padding: '2.5rem',
          maxWidth: '28rem',
          width: '100%',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--text-muted)' }}>
              Gratis · 10 uppslag/månad
            </p>
            <h2 className="font-serif text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Skaffa API-nyckel
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-muted)', fontSize: '20px', lineHeight: 1, fontFamily: 'var(--font-mono)' }}
            className="transition-opacity hover:opacity-60"
          >
            ×
          </button>
        </div>

        {state === 'success' ? (
          <div>
            <p className="text-[11px] mb-4 leading-relaxed" style={{ color: 'var(--text-second)' }}>
              Din nyckel är klar. Spara den nu — den visas aldrig igen.
            </p>
            <div
              className="flex items-center gap-3 mb-6"
              style={{ border: '0.5px solid var(--border-h)', borderRadius: '2px', padding: '0.875rem 1rem' }}
            >
              <code className="flex-1 text-[11px] break-all" style={{ color: 'var(--text-primary)' }}>
                {apiKey}
              </code>
              <button
                onClick={copy}
                className="text-[9px] uppercase tracking-[0.2em] transition-opacity hover:opacity-60 shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {copied ? 'Kopierad' : 'Kopiera'}
              </button>
            </div>
            <p className="text-[10px] mb-6" style={{ color: 'var(--text-muted)' }}>
              En kopia har skickats till {email}.
            </p>
            <p className="text-[10px] mb-8" style={{ color: 'var(--text-muted)' }}>
              MCP-endpoint:{' '}
              <code style={{ color: 'var(--text-second)' }}>
                https://norric-mcp-production.up.railway.app/mcp
              </code>
            </p>
            <a
              href="/docs"
              className="block text-center text-[10px] uppercase tracking-[0.2em] font-bold py-3 transition-opacity hover:opacity-70"
              style={{ border: '0.5px solid var(--border-h)', color: 'var(--text-second)', borderRadius: '2px' }}
            >
              Kom igång — dokumentation →
            </a>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="mb-5">
              <label className="block text-[9px] uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-muted)' }}>
                E-postadress
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="din@organisation.se"
                style={{
                  width: '100%', background: 'transparent',
                  border: '0.5px solid var(--border)', borderRadius: '2px',
                  padding: '0.75rem 1rem', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)', fontSize: '12px',
                  outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-h)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div className="mb-7">
              <label className="block text-[9px] uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-muted)' }}>
                Organisationsnummer
              </label>
              <input
                type="text"
                required
                value={orgNr}
                onChange={e => setOrgNr(e.target.value)}
                placeholder="556123-4567"
                pattern="[\d\-]{10,11}"
                title="Ange ett giltigt organisationsnummer (10 siffror)"
                style={{
                  width: '100%', background: 'transparent',
                  border: '0.5px solid var(--border)', borderRadius: '2px',
                  padding: '0.75rem 1rem', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)', fontSize: '12px',
                  outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-h)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {state === 'error' && (
              <p className="text-[11px] mb-5" style={{ color: '#EF4444' }}>{errMsg}</p>
            )}

            <button
              type="submit"
              disabled={state === 'submitting'}
              className="w-full text-[10px] uppercase tracking-[0.25em] font-bold py-3.5 transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: 'var(--gold)', color: 'var(--bg)', borderRadius: '2px', fontFamily: 'var(--font-mono)' }}
            >
              {state === 'submitting' ? 'Registrerar…' : 'Skaffa nyckel gratis'}
            </button>

            <p className="text-[10px] text-center mt-4" style={{ color: 'var(--text-muted)' }}>
              Inget kreditkort. En nyckel per organisation.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

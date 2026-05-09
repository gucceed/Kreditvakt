import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const API = 'https://norric-mcp-production.up.railway.app';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };
const serif: React.CSSProperties = { fontFamily: 'var(--font-serif)' };

type LookupState = 'idle' | 'loading' | 'success' | 'error';

interface ScoreResult {
  orgnr: string;
  company_name: string;
  display_score: number;
  band: number;
  band_label: string;
  band_action: string;
  distress_probability: number;
  signals: Array<{ key: string; label: string; value: unknown; direction: string }>;
  signals_fired: number;
  signals_total: number;
  scored_at: string;
  searches_remaining?: number;
  searches_limit?: number;
}

const BAND_COLORS: Record<number, string> = {
  1: '#2F6B3B',
  2: '#B8861B',
  3: '#B85019',
  4: '#933419',
  5: '#931E1E',
};

function normalizeOrgnrDigits(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12) return digits.slice(2);
  if (digits.length === 10) return digits;
  return null;
}

function formatOrgnr(raw: string): string {
  const ten = normalizeOrgnrDigits(raw);
  if (ten) return `${ten.slice(0, 6)}-${ten.slice(6)}`;
  return raw.replace(/\D/g, '');
}

function isValidOrgnr(raw: string): boolean {
  const ten = normalizeOrgnrDigits(raw);
  if (!ten) return false;
  return ten[0] !== '0';
}

function lastFour(key: string): string {
  return key.slice(-4);
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'transparent',
  border: '0.5px solid var(--border)', borderRadius: '2px',
  padding: '0.75rem 1rem', color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)', fontSize: '11px',
  outline: 'none', boxSizing: 'border-box',
  letterSpacing: '0.05em',
};

export default function LookupPage() {
  const [searchParams] = useSearchParams();

  const [apiKey, setApiKey]               = useState('');
  const [keyLocked, setKeyLocked]         = useState(false);
  const [showKeyField, setShowKeyField]   = useState(false);
  const [clipboardAvailable, setClipboard] = useState(
    typeof navigator !== 'undefined' && !!navigator?.clipboard?.readText,
  );

  const [orgnr, setOrgnr]     = useState('');
  const [state, setState]     = useState<LookupState>('idle');
  const [result, setResult]   = useState<ScoreResult | null>(null);
  const [errMsg, setErrMsg]   = useState('');
  const [errCode, setErrCode] = useState<number | null>(null);

  // Magic link: prefill key as read-only from ?key=
  useEffect(() => {
    const paramKey = searchParams.get('key');
    if (paramKey?.trim()) {
      setApiKey(paramKey.trim());
      setKeyLocked(true);
      setShowKeyField(true);
    }
  }, []);

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      if (trimmed) {
        setApiKey(trimmed);
        setKeyLocked(true);
      }
    } catch {
      setClipboard(false);
    }
  }

  function unlockKey() {
    setApiKey('');
    setKeyLocked(false);
    setShowKeyField(false);
    setResult(null);
    setErrMsg('');
    setErrCode(null);
    setState('idle');
  }

  const orgnrValid = isValidOrgnr(orgnr);
  const canSearch  = orgnrValid && state !== 'loading';

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!canSearch) return;

    // Lock key on first manual submission so full key is never shown again
    if (!keyLocked) setKeyLocked(true);

    setState('loading');
    setResult(null);
    setErrMsg('');
    setErrCode(null);

    const cleanOrgnr = normalizeOrgnrDigits(orgnr) ?? orgnr.replace(/\D/g, '');

    try {
      const headers: Record<string, string> = {};
      if (apiKey.trim()) headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      const res = await fetch(`${API}/api/score/${cleanOrgnr}`, { headers });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setState('success');
        return;
      }

      setErrCode(res.status);

      // Server returns { error_code, message } or { detail: { error_code, message } }
      const detail = data.detail ?? data;
      const serverMsg: string | undefined =
        typeof detail === 'object' ? detail.message : (typeof detail === 'string' ? detail : undefined);

      if (res.status === 401) {
        setErrMsg(serverMsg ?? 'Ogiltig API-nyckel. Kontrollera att du kopierat hela nyckeln.');
      } else if (res.status === 402) {
        setErrMsg(serverMsg ?? 'Du har använt dina sökningar. Uppgradera till Silver.');
      } else if (res.status === 400) {
        setErrMsg(serverMsg ?? 'Ogiltigt organisationsnummer — ange 10 siffror (t.ex. 556123-4567).');
      } else if (res.status === 503) {
        setErrMsg(serverMsg ?? 'Sökmotorn är tillfälligt degraderad. Försök igen om 30 sekunder.');
      } else if (res.status === 429) {
        setErrMsg(serverMsg ?? 'För många förfrågningar. Vänta en minut och försök igen.');
      } else {
        setErrMsg(serverMsg ?? 'Något gick fel. Försök igen om en stund eller mejla hej@norric.io.');
      }
      setState('error');
    } catch {
      setErrMsg('Nätverksfel — kontrollera din anslutning och försök igen.');
      setState('error');
    }
  }

  const scoreColor = result ? (BAND_COLORS[result.band] ?? '#888') : '#888';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>

      {/* Nav */}
      <nav style={{ padding: '1.25rem 2rem', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          ← Kreditvakt
        </a>
        <a href="/signup" style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.7 }}>
          Skaffa nyckel →
        </a>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.35em', marginBottom: '0.75rem' }}>
            Kreditvakt · Sökning
          </p>
          <h1 style={{ ...serif, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Sök insolvensbetyg
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={search} style={{ marginBottom: '2rem' }}>

          {/* API key field — hidden for free-tier users */}
          {showKeyField ? (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ ...mono, display: 'block', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                API-nyckel
              </label>

              {keyLocked ? (
                <div>
                  <div style={{
                    ...mono,
                    padding: '0.75rem 1rem',
                    border: '0.5px solid var(--border)',
                    borderRadius: '2px',
                    fontSize: '11px',
                    color: 'var(--text-second)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <span style={{ color: '#2F6B3B' }}>✓</span>
                    Nyckel laddad (slutar på {lastFour(apiKey)})
                  </div>
                  <button
                    type="button"
                    onClick={unlockKey}
                    style={{
                      ...mono,
                      background: 'none', border: 'none', padding: '0.35rem 0',
                      fontSize: '10px', color: 'var(--text-muted)', cursor: 'pointer',
                      textDecoration: 'underline', textUnderlineOffset: '2px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Byt nyckel
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="nrk_..."
                    spellCheck={false}
                    autoComplete="off"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'var(--border-h)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                  {clipboardAvailable && (
                    <button
                      type="button"
                      onClick={pasteFromClipboard}
                      style={{
                        ...mono,
                        background: 'none', border: 'none', padding: '0.35rem 0',
                        fontSize: '10px', color: 'var(--text-muted)', cursor: 'pointer',
                        textDecoration: 'underline', textUnderlineOffset: '2px',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Klistra in från urklipp
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ ...mono, fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Sökning sker anonymt på fri nivå.{' '}
                <button
                  type="button"
                  onClick={() => setShowKeyField(true)}
                  style={{
                    ...mono, background: 'none', border: 'none', padding: 0,
                    fontSize: '11px', color: 'var(--text-second)', cursor: 'pointer',
                    textDecoration: 'underline', textUnderlineOffset: '2px',
                  }}
                >
                  Jag har en API-nyckel
                </button>
              </p>
            </div>
          )}

          {/* Orgnr */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ ...mono, display: 'block', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Organisationsnummer
            </label>
            <input
              type="text"
              value={orgnr}
              onChange={e => setOrgnr(e.target.value)}
              onBlur={e => {
                if (e.target.value) setOrgnr(formatOrgnr(e.target.value));
              }}
              placeholder="556123-4567"
              autoFocus={keyLocked}
              style={{
                ...mono,
                width: '100%', background: 'transparent',
                border: '0.5px solid var(--border)', borderRadius: '2px',
                padding: '0.75rem 1rem', color: 'var(--text-primary)',
                fontSize: '12px', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--border-h)')}
            />
          </div>

          <button
            type="submit"
            disabled={!canSearch}
            style={{
              ...mono,
              width: '100%', background: canSearch ? 'var(--gold)' : 'var(--border)',
              color: canSearch ? 'var(--bg)' : 'var(--text-muted)',
              border: 'none', borderRadius: '2px',
              padding: '0.875rem', fontSize: '10px',
              textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700,
              cursor: canSearch ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            {state === 'loading' ? 'Söker…' : 'Sök'}
          </button>
        </form>

        {/* Error */}
        {state === 'error' && (
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ ...mono, fontSize: '11px', color: '#8a1c1c', lineHeight: 1.7, marginBottom: errCode === 402 ? '1rem' : 0 }}>
              {errMsg}
            </p>
            {errCode === 402 && (
              <a
                href={`/onboarding?tier=silver${orgnr ? `&orgnr=${orgnr.replace(/\D/g, '')}` : ''}`}
                style={{ ...mono, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, color: 'var(--text-second)', textDecoration: 'none', borderBottom: '0.5px solid var(--border-h)', paddingBottom: '1px' }}
              >
                Uppgradera till Silver →
              </a>
            )}
          </div>
        )}

        {/* Result */}
        {state === 'success' && result && (
          <div>
            {/* Searches remaining */}
            {result.searches_remaining !== undefined && (
              <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'right' }}>
                Du har {result.searches_remaining} sökningar kvar.
              </p>
            )}

            {/* Score card */}
            <div style={{
              border: '0.5px solid var(--border)',
              borderTop: `2px solid ${scoreColor}`,
              borderRadius: '2px', padding: '2rem', marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ ...serif, fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {result.company_name || result.orgnr}
                  </div>
                  <div style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)' }}>
                    org.nr {formatOrgnr(result.orgnr)}
                  </div>
                </div>
                <div style={{
                  ...mono, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em',
                  padding: '0.4rem 0.75rem', borderRadius: '2px',
                  border: `0.5px solid ${scoreColor}55`, color: scoreColor,
                }}>
                  {result.band_label}
                </div>
              </div>

              {/* Score display */}
              <div style={{ textAlign: 'center', padding: '1.5rem 0', borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)', marginBottom: '1.5rem' }}>
                <div style={{ ...serif, fontSize: '5rem', fontWeight: 700, color: scoreColor, lineHeight: 1, marginBottom: '0.5rem' }}>
                  {result.display_score}
                </div>
                <div style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
                  Risk: {result.display_score}/20 · {result.band_label}
                </div>
              </div>

              {/* Score bar */}
              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(result.display_score / 20) * 100}%`, background: scoreColor }} />
              </div>

              {/* Band action */}
              <p style={{ ...mono, fontSize: '11px', color: 'var(--text-second)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {result.band_action}
              </p>

              {/* Signals */}
              {result.signals && result.signals.length > 0 && (
                <div>
                  <div style={{ ...mono, fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
                    Signaler ({result.signals_fired}/{result.signals_total})
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {result.signals.map((s, i) => (
                      <li key={i} style={{ ...mono, fontSize: '11px', color: 'var(--text-second)', display: 'flex', gap: '0.75rem', alignItems: 'baseline', paddingBottom: '0.5rem' }}>
                        <span style={{ color: s.direction === 'risk' ? '#EF4444' : s.direction === 'health' ? '#10B981' : 'var(--text-muted)', flexShrink: 0 }}>—</span>
                        {s.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Analyserad {new Date(result.scored_at).toLocaleDateString('sv-SE')} · Källa: Kronofogden, Skatteverket, Bolagsverket
            </p>
          </div>
        )}

        {/* Lost key */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '0.5px solid var(--border)' }}>
          <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            Har du tappat bort din nyckel? Mejla{' '}
            <a href="mailto:hej@norric.io?subject=Förlorad%20API-nyckel" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
              hej@norric.io
            </a>
            {' '}så hjälper vi dig.
          </p>
          <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.8, marginTop: '0.5rem' }}>
            Har du inget konto?{' '}
            <a href="/signup" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
              Skaffa gratis API-nyckel →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

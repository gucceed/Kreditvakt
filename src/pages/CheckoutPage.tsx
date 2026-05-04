import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const API = 'https://norric-mcp-production.up.railway.app';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

type PageState = 'redirecting' | 'success' | 'error';

const TIER_LABELS: Record<string, string> = {
  standard: 'Silver',
  compliance: 'Guld / Premium',
};

const BILLING_LABELS: Record<string, string> = {
  monthly: 'månadsvis',
  annual: 'årsvis',
};

export default function CheckoutPage() {
  const [params] = useSearchParams();
  const tier = params.get('tier') || '';
  const billing = params.get('billing') || '';
  const sessionId = params.get('session_id');

  const [pageState, setPageState] = useState<PageState>(sessionId ? 'success' : 'redirecting');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (sessionId) return; // already on success page

    const validTiers = ['standard', 'compliance'];
    const validBillings = ['monthly', 'annual'];

    if (!validTiers.includes(tier) || !validBillings.includes(billing)) {
      setErrMsg('Ogiltig plan. Gå tillbaka och välj ett abonnemang.');
      setPageState('error');
      return;
    }

    // Navigate to backend checkout — backend does 303 → Stripe
    const url = `${API}/checkout?tier=${encodeURIComponent(tier)}&billing=${encodeURIComponent(billing)}`;
    window.location.href = url;
  }, [tier, billing, sessionId]);

  if (pageState === 'success') {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1.5rem' }}>
            Betalning genomförd
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Välkommen till Kreditvakt.
          </h1>
          <p style={{ ...mono, fontSize: '12px', color: 'var(--text-second)', lineHeight: 1.9, marginBottom: '2.5rem' }}>
            Din API-nyckel skickas till din e-post inom 60 sekunder. Kolla skräpposten om du inte hittar den.
            Frågor? Mejla{' '}
            <a href="mailto:hej@norric.io" style={{ color: 'var(--text-primary)' }}>hej@norric.io</a>.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href="/docs"
              style={{
                ...mono, display: 'inline-block', fontSize: '10px', textTransform: 'uppercase',
                letterSpacing: '0.2em', fontWeight: 700, padding: '0.875rem 1.5rem',
                background: 'var(--gold)', color: 'var(--bg)', borderRadius: '2px', textDecoration: 'none',
              }}
            >
              Dokumentation →
            </a>
            <a
              href="/"
              style={{
                ...mono, display: 'inline-block', fontSize: '10px', textTransform: 'uppercase',
                letterSpacing: '0.2em', fontWeight: 700, padding: '0.875rem 1.5rem',
                border: '0.5px solid var(--border-h)', color: 'var(--text-second)', borderRadius: '2px', textDecoration: 'none',
              }}
            >
              Startsida
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Något gick fel.
          </h1>
          <p style={{ ...mono, fontSize: '12px', color: '#8a1c1c', lineHeight: 1.9, marginBottom: '2rem' }}>
            {errMsg || 'Försök igen eller mejla hej@norric.io.'}
          </p>
          <a
            href="/#priser"
            style={{
              ...mono, display: 'inline-block', fontSize: '10px', textTransform: 'uppercase',
              letterSpacing: '0.2em', fontWeight: 700, padding: '0.875rem 1.5rem',
              border: '0.5px solid var(--border-h)', color: 'var(--text-second)', borderRadius: '2px', textDecoration: 'none',
            }}
          >
            ← Tillbaka till priser
          </a>
        </div>
      </div>
    );
  }

  // Redirecting state
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
        <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1.5rem' }}>
          Förbereder betalning
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          {TIER_LABELS[tier] ?? tier} · {BILLING_LABELS[billing] ?? billing}
        </h1>
        <p style={{ ...mono, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.9 }}>
          Omdirigeras till Stripe…
        </p>
      </div>
    </div>
  );
}

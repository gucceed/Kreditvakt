import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type VerifyState = 'loading' | 'ok' | 'expired';

interface UserData {
  email: string;
  company: string;
  tier: string;
  orgnr: string;
}

const TIER_LABEL: Record<string, string> = { silver: 'Silver', guld: 'Guld', premium: 'Premium' };

const STRIPE_CHECKOUT = 'https://norric-mcp-production.up.railway.app/checkout';
const TIER_TO_STRIPE: Record<string, { tier: string; billing: string }> = {
  silver:  { tier: 'standard',   billing: 'monthly' },
  guld:    { tier: 'standard',   billing: 'annual'  },
  premium: { tier: 'compliance', billing: 'monthly' },
};

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };
const serif: React.CSSProperties = { fontFamily: 'var(--font-serif)' };

export default function WelcomePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [verifyState, setVerifyState] = useState<VerifyState>('loading');
  const [userData, setUserData]       = useState<UserData | null>(null);

  useEffect(() => {
    if (!token) { setVerifyState('expired'); return; }
    fetch(`/api/verify-magic-link?token=${encodeURIComponent(token)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((d: UserData) => { setUserData(d); setVerifyState('ok'); })
      .catch(() => setVerifyState('expired'));
  }, [token]);

  if (verifyState === 'loading') {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ ...mono, fontSize: '11px', color: 'var(--text-muted)' }}>Verifierar länk…</p>
      </div>
    );
  }

  if (verifyState === 'expired' || !userData) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <p style={{ ...mono, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1.5rem' }}>
            Länken är ogiltig
          </p>
          <h1 style={{ ...serif, fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Den här länken har gått ut.
          </h1>
          <p style={{ ...mono, fontSize: '12px', color: 'var(--text-second)', lineHeight: 1.9, marginBottom: '2rem' }}>
            Aktiveringslänkar är engångslänkar som är giltiga i 15 minuter.
            Gå tillbaka och registrera dig igen.
          </p>
          <a
            href="/pricing"
            style={{ ...mono, display: 'block', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, padding: '0.875rem', background: 'var(--gold)', color: 'var(--bg)', borderRadius: '2px', textDecoration: 'none' }}
          >
            Tillbaka till priser →
          </a>
        </div>
      </div>
    );
  }

  const tierKey = userData.tier ?? 'silver';
  const tierLabel = TIER_LABEL[tierKey] ?? tierKey;
  const stripeParams = TIER_TO_STRIPE[tierKey];
  const checkoutUrl = stripeParams
    ? `${STRIPE_CHECKOUT}?tier=${stripeParams.tier}&billing=${stripeParams.billing}${userData.orgnr ? `&org_nr=${userData.orgnr}` : ''}`
    : null;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <p style={{ ...mono, fontSize: '10px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1.5rem' }}>
          Konto aktiverat
        </p>
        <h1 style={{ ...serif, fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Välkommen till Kreditvakt.
        </h1>
        <p style={{ ...mono, fontSize: '12px', color: 'var(--text-second)', lineHeight: 1.9, marginBottom: '2.5rem' }}>
          Du är inloggad som <strong style={{ color: 'var(--text-primary)' }}>{userData.email}</strong>.
          {userData.company && (
            <> Konto registrerat för <strong style={{ color: 'var(--text-primary)' }}>{userData.company}</strong>.</>
          )}
        </p>

        {/* Next steps */}
        <div style={{ border: '0.5px solid var(--border)', borderRadius: '2px', padding: '1.5rem', marginBottom: '2rem' }}>
          <p style={{ ...mono, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Nästa steg
          </p>
          {[
            { n: '1', text: `Aktivera ditt ${tierLabel}-abonnemang nedan` },
            { n: '2', text: 'Du får en API-nyckel via e-post inom 60 sekunder' },
            { n: '3', text: 'Gå till /lookup för att söka företag direkt' },
          ].map(({ n, text }) => (
            <div key={n} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
              <span style={{ ...mono, fontSize: '10px', color: 'var(--gold)', minWidth: '16px' }}>{n}.</span>
              <span style={{ ...mono, fontSize: '11px', color: 'var(--text-second)', lineHeight: 1.6 }}>{text}</span>
            </div>
          ))}
        </div>

        {checkoutUrl ? (
          <a
            href={checkoutUrl}
            style={{ ...mono, display: 'block', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700, padding: '0.9rem', background: 'var(--gold)', color: 'var(--bg)', borderRadius: '2px', textDecoration: 'none', marginBottom: '1rem' }}
          >
            Aktivera {tierLabel}-abonnemang →
          </a>
        ) : (
          <a
            href={`mailto:hej@norric.io?subject=${encodeURIComponent(`${tierLabel}-abonnemang Kreditvakt`)}`}
            style={{ ...mono, display: 'block', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700, padding: '0.9rem', background: 'var(--gold)', color: 'var(--bg)', borderRadius: '2px', textDecoration: 'none', marginBottom: '1rem' }}
          >
            Kontakta oss för att aktivera →
          </a>
        )}

        <a
          href="/lookup"
          style={{ ...mono, display: 'block', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, padding: '0.875rem', border: '0.5px solid var(--border-h)', color: 'var(--text-second)', borderRadius: '2px', textDecoration: 'none' }}
        >
          Sök ett företag →
        </a>
      </div>
    </div>
  );
}

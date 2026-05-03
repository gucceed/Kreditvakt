import React from 'react';

const TIERS = [
  {
    badge: 'Gratis',
    name: 'Free',
    price: '0 kr',
    period: '/månad',
    note: 'Ingen kreditkort krävs',
    description: 'Bolagsstatuskontroller utan kostnad.',
    features: ['10 uppslag/månad', 'Bolagsstatus', '1 orgnr · delad kvot'],
    cta: 'Skapa konto →',
    href: 'https://norric-mcp-production.up.railway.app/signup/free',
    highlighted: false,
  },
  {
    badge: 'Grundläggande',
    name: 'Silver',
    price: '499 kr',
    period: '/månad',
    note: 'Faktureras månadsvis',
    description: 'Kreditriskvärdering och automatiska varningar.',
    features: ['500 uppslag/månad', 'Kreditriskvärdering', 'Riskvarningar'],
    cta: 'Välj Silver →',
    href: 'https://norric-mcp-production.up.railway.app/checkout?tier=standard&billing=monthly',
    highlighted: false,
  },
  {
    badge: 'Mest valda',
    name: 'Guld',
    price: '1 499 kr',
    period: '/månad',
    note: 'Faktureras månadsvis',
    description: 'Komplett skuldöversikt med fordringsägardetaljer.',
    features: ['Obegränsade uppslag', 'Komplett skuldanalys', 'Fordringsägardetaljer', 'CSV-export'],
    cta: 'Välj Guld →',
    href: 'https://norric-mcp-production.up.railway.app/checkout?tier=standard&billing=annual',
    highlighted: true,
  },
  {
    badge: 'Avancerat',
    name: 'Premium',
    price: '4 999 kr',
    period: '/månad',
    note: 'Faktureras månadsvis',
    description: 'Guld plus dedikerad support, SLA och full API-åtkomst.',
    features: ['Obegränsade uppslag', 'Allt i Guld', 'Dedikerad support', 'SLA-garanti', 'Full API-åtkomst'],
    cta: 'Välj Premium →',
    href: 'https://norric-mcp-production.up.railway.app/checkout?tier=compliance&billing=annual',
    highlighted: false,
  },
  {
    badge: 'Enterprise',
    name: 'Enterprise',
    price: 'Kontakta oss',
    period: '',
    note: 'Skräddarsydd prissättning',
    description: 'Databaslicens, anpassade format och dedikerat SLA för banker.',
    features: ['Obegränsade uppslag', 'Fullständig databaslicens', 'Anpassade integrationer', 'Dedikerat SLA'],
    cta: 'Begär offert →',
    href: 'mailto:hej@norric.io',
    highlighted: false,
  },
];

const ROI_ROWS: Array<{ label: string; value: string; strong?: boolean }> = [
  { label: 'Portföljstorlek',             value: '500 MSEK'      },
  { label: 'Kreditförluster (0,8% rate)', value: '4 MSEK / år'   },
  { label: 'Kreditvakt täckningsgrad',    value: '65%'           },
  { label: 'Skyddat värde vid tidig varning', value: '~1,8 MSEK / år', strong: true },
  { label: 'Investering',                 value: '4 999 kr / mån' },
  { label: 'ROI',                         value: '18×',          strong: true },
];

const TRUST = [
  {
    heading: 'Validerad precision',
    body: 'Validerat mot samtliga svenska konkursdata 2003–2023.',
  },
  {
    heading: 'Bankstandard',
    body: 'Median 9 månaders förvarning. End-to-end kryptering. Full GDPR-efterlevnad.',
  },
  {
    heading: 'Årsavtal',
    body: 'Uteslutande årsavtal för kontinuitet i er riskövervakning.',
  },
];

export const Pricing = () => (
  <div style={{ fontFamily: 'var(--font-mono)' }} className="space-y-20">

    {/* ROI — clean table, no decoration */}
    <div
      style={{
        border: '0.5px solid var(--border)',
        borderRadius: '2px',
        padding: '2.5rem',
        maxWidth: '42rem',
      }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.35em] mb-6"
        style={{ color: 'var(--text-muted)' }}
      >
        Räkneexempel · Factoringbolag
      </p>
      <h3
        className="font-serif text-2xl font-bold mb-8"
        style={{ color: 'var(--text-primary)' }}
      >
        Strategisk ROI-kalkyl
      </h3>

      {ROI_ROWS.map(({ label, value, strong }) => (
        <div
          key={label}
          className="flex justify-between items-baseline py-3"
          style={{ borderBottom: '0.5px solid var(--border)' }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-second)' }}>{label}</span>
          <span
            style={{
              fontFamily:  strong ? 'var(--font-serif)' : 'var(--font-mono)',
              fontSize:    strong ? '1.2rem' : '12px',
              fontWeight:  strong ? 700 : 400,
              color:       'var(--text-primary)',
            }}
          >
            {value}
          </span>
        </div>
      ))}
    </div>

    {/* Rate card — uniform treatment, no gold fill */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 items-stretch">
      {TIERS.map(tier => (
        <div
          key={tier.name}
          style={{
            background: 'var(--bg-card)',
            border: '0.5px solid var(--border)',
            borderTop: tier.highlighted ? '2px solid var(--text-primary)' : '0.5px solid var(--border)',
            borderRadius: '2px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Badge — no background fill, no rounded-full */}
            <div
              className="text-[9px] uppercase tracking-[0.25em] mb-5"
              style={{
                color:      tier.highlighted ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: tier.highlighted ? 600 : 400,
              }}
            >
              {tier.badge}
            </div>

            <div className="font-serif text-[1.5rem] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {tier.name}
            </div>

            <div className="mb-1 flex items-baseline gap-1">
              <span
                className="font-serif font-bold"
                style={{ fontSize: tier.price === 'Kontakta oss' ? '1rem' : '1.65rem', color: 'var(--text-primary)' }}
              >
                {tier.price}
              </span>
              {tier.period && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tier.period}</span>
              )}
            </div>

            <p className="text-[10px] italic mb-5" style={{ color: 'var(--text-muted)' }}>
              {tier.note}
            </p>

            <p className="text-[11px] mb-6 leading-relaxed" style={{ color: 'var(--text-second)' }}>
              {tier.description}
            </p>

            <ul className="space-y-2.5 mb-8">
              {tier.features.map(f => (
                <li key={f} className="text-[11px] flex items-start gap-2.5" style={{ color: 'var(--text-second)' }}>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '1px' }}>—</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <a
            href={tier.href}
            className="text-[10px] uppercase tracking-[0.2em] font-bold py-3 text-center block transition-opacity hover:opacity-70"
            style={{
              border: '0.5px solid var(--border-h)',
              color: 'var(--text-second)',
              borderRadius: '2px',
            }}
          >
            {tier.cta}
          </a>
        </div>
      ))}
    </div>

    {/* Trust signals — typographic, no icons */}
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12"
      style={{ borderTop: '0.5px solid var(--border)' }}
    >
      {TRUST.map(({ heading, body }) => (
        <div key={heading}>
          <div
            className="text-[10px] uppercase tracking-[0.25em] font-bold mb-3"
            style={{ color: 'var(--text-second)' }}
          >
            {heading}
          </div>
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            {body}
          </p>
        </div>
      ))}
    </div>
  </div>
);

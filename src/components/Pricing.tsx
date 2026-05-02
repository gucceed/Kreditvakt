import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, CheckCircle2, Database, TrendingUp, Calculator, Mail } from 'lucide-react';

const TIERS = [
  {
    badge: 'Kom igång gratis',
    name: 'Free',
    price: '0 kr',
    period: '/månad',
    note: 'Ingen kreditkort krävs',
    description: 'För dig som vill prova Kreditvakt. Bolagsstatuskontroller utan kostnad.',
    features: ['50 uppslag/månad', 'Bolagsstatus'],
    cta: 'Skapa konto',
    href: 'https://norric-mcp-production.up.railway.app/signup/free',
    highlighted: false,
  },
  {
    badge: 'Grundläggande',
    name: 'Silver',
    price: '499 kr',
    period: '/månad',
    note: 'Faktureras månadsvis',
    description: 'Kreditriskvärdering och automatiska varningar för din leverantörsbas.',
    features: ['500 uppslag/månad', 'Kreditriskvärdering', 'Riskvarningar'],
    cta: 'Välj Silver',
    href: 'https://norric-mcp-production.up.railway.app/billing/checkout?tier=silver',
    highlighted: false,
  },
  {
    badge: 'Mest valda',
    name: 'Guld',
    price: '1 499 kr',
    period: '/månad',
    note: 'Faktureras månadsvis',
    description: 'Fullständig skuldöversikt med fordringsägardetaljer för kreditavdelningar.',
    features: ['Obegränsade uppslag', 'Komplett skuldanalys', 'Fordringsägardetaljer', 'CSV-export'],
    cta: 'Välj Guld',
    href: 'https://norric-mcp-production.up.railway.app/billing/checkout?tier=guld',
    highlighted: true,
  },
  {
    badge: 'Avancerat',
    name: 'Premium',
    price: '4 999 kr',
    period: '/månad',
    note: 'Faktureras månadsvis',
    description: 'Allt i Guld plus dedikerad support, SLA-garanti och full API-åtkomst.',
    features: ['Obegränsade uppslag', 'Allt i Guld', 'Dedikerad support', 'SLA-garanti', 'Full API-åtkomst'],
    cta: 'Välj Premium',
    href: 'https://norric-mcp-production.up.railway.app/billing/checkout?tier=premium',
    highlighted: false,
  },
  {
    badge: 'Enterprise',
    name: 'Enterprise',
    price: 'Kontakta oss',
    period: '',
    note: 'Skräddarsydd prissättning',
    description: 'Databaslicens, anpassade leveransformat och dedikerat SLA för banker och kreditförsäkringsbolag.',
    features: ['Obegränsade uppslag', 'Fullständig databaslicens', 'Anpassade integrationer', 'Dedikerat SLA'],
    cta: 'Begär offert',
    href: 'mailto:hej@norric.io',
    highlighted: false,
  },
];

export const Pricing = () => {
  return (
    <div className="py-12 space-y-24">
      {/* ROI Anchor Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-12 bg-white/5 hairline-border rounded-[4px] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Calculator className="w-32 h-32 text-gold" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gold/10 flex items-center justify-center rounded-[2px]">
              <TrendingUp className="w-6 h-6 text-gold" />
            </div>
            <h2 className="font-serif text-2xl text-white">Strategisk ROI-kalkyl</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <p className="text-gold-lite/60 text-sm font-medium uppercase tracking-widest">Räkneexempel: Factoringbolag</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm border-b border-gold/10 pb-2">
                  <span className="text-gold-lite/40">Portföljstorlek</span>
                  <span className="text-white">500 MSEK</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gold/10 pb-2">
                  <span className="text-gold-lite/40">Kreditförluster (0,8% rate)</span>
                  <span className="text-white">4 MSEK/år</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gold/10 pb-2">
                  <span className="text-gold-lite/40">Kreditvakt täckningsgrad</span>
                  <span className="text-white">65%</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gold/5 rounded-[2px] border border-gold/20">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold/60 block mb-2">Skyddat värde vid tidig varning</span>
                <div className="text-4xl font-serif font-bold text-gold mb-4">~1,8 MSEK/år</div>
                <div className="h-px bg-gold/20 w-12 mx-auto mb-4" />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gold-lite/40">Investering</span>
                  <span className="text-white">4 999 kr/mån</span>
                </div>
                <div className="mt-6 text-2xl font-serif text-white">
                  ROI: <span className="text-gold">18×</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 items-stretch">
        {TIERS.map((tier, i) => (
          tier.highlighted ? (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-8 bg-gold border border-gold rounded-[4px] flex flex-col justify-between shadow-[0_0_50px_rgba(197,160,89,0.15)] relative z-10 will-change-[opacity,transform]"
            >
              <div>
                <span className="bg-midnight text-gold text-[8px] uppercase tracking-widest px-2 py-1 rounded-full font-bold mb-3 block w-fit">
                  {tier.badge}
                </span>
                <h3 className="font-serif text-2xl text-midnight mb-4">{tier.name}</h3>
                <div className="mb-1">
                  <span className="text-3xl font-serif font-bold text-midnight">{tier.price}</span>
                  {tier.period && <span className="text-xs text-midnight/60 ml-1">{tier.period}</span>}
                </div>
                <p className="text-[10px] text-midnight/50 italic mb-6">{tier.note}</p>
                <p className="text-xs text-midnight/80 leading-relaxed mb-6">{tier.description}</p>
                <ul className="space-y-2 mb-8">
                  {tier.features.map(f => (
                    <li key={f} className="text-[11px] text-midnight/70 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-midnight/40 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={tier.href}
                className="w-full py-4 bg-midnight text-gold text-[11px] uppercase tracking-[0.2em] font-bold rounded-[2px] hover:bg-midnight/90 transition-all text-center block"
              >
                {tier.cta}
              </a>
            </motion.div>
          ) : (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-8 bg-white/5 border border-gold/10 rounded-[4px] flex flex-col justify-between hover:border-gold/30 transition-all will-change-[opacity,transform]"
            >
              <div>
                <span className="bg-gold/10 text-gold text-[8px] uppercase tracking-widest px-2 py-1 rounded-full font-bold mb-3 block w-fit">
                  {tier.badge}
                </span>
                <h3 className="font-serif text-2xl text-white mb-4">{tier.name}</h3>
                <div className="mb-1">
                  <span className="text-3xl font-serif font-bold text-white">{tier.price}</span>
                  {tier.period && <span className="text-xs text-gold-lite/40 ml-1">{tier.period}</span>}
                </div>
                <p className="text-[10px] text-gold-lite/30 italic mb-6">{tier.note}</p>
                <p className="text-xs text-white/70 leading-relaxed mb-6">{tier.description}</p>
                <ul className="space-y-2 mb-8">
                  {tier.features.map(f => (
                    <li key={f} className="text-[11px] text-gold-lite/50 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gold/40 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={tier.href}
                className="w-full py-4 border border-gold/40 text-gold text-[11px] uppercase tracking-[0.2em] font-bold rounded-[2px] hover:bg-gold/10 transition-all text-center block"
              >
                {tier.cta}
              </a>
            </motion.div>
          )
        ))}
      </div>

      {/* Trust Signals Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-16 border-t border-gold/10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gold">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[11px] uppercase tracking-widest font-bold">Validerad Precision</span>
          </div>
          <p className="text-gold-lite/20 text-[10px] leading-relaxed">
            Vår modell är validerad mot samtliga svenska konkursdata mellan 2003–2023 för maximal träffsäkerhet.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gold">
            <Shield className="w-5 h-5" />
            <span className="text-[11px] uppercase tracking-widest font-bold">Bankstandard</span>
          </div>
          <p className="text-gold-lite/20 text-[10px] leading-relaxed">
            Median 9 månaders förvarning före insolvens. End-to-end kryptering och full GDPR-efterlevnad.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gold">
            <Lock className="w-5 h-5" />
            <span className="text-[11px] uppercase tracking-widest font-bold">Säkra Avtal</span>
          </div>
          <p className="text-gold-lite/20 text-[10px] leading-relaxed">
            Vi arbetar uteslutande med årsavtal för att säkerställa kontinuitet i er riskövervakning. Inga månadsuppsägningar.
          </p>
        </div>
      </div>
    </div>
  );
};

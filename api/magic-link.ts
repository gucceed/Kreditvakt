import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const ALLOWED_ORIGIN = 'https://kreditvakt.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, company, tier, orgnr } = (req.body ?? {}) as Record<string, string>;
  if (!email || !tier) return res.status(400).json({ error: 'email and tier are required' });

  const hasUpstash = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!hasUpstash) return res.status(503).json({ error: 'Service temporarily unavailable' });

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const token = crypto.randomBytes(32).toString('hex');
  await redis.set(`ml:${token}`, JSON.stringify({ email, company: company ?? '', tier, orgnr: orgnr ?? '' }), { ex: 900 });

  const magicUrl = `https://kreditvakt.com/welcome?token=${token}`;
  const tierLabel = ({ silver: 'Silver', guld: 'Guld', premium: 'Premium' } as Record<string, string>)[tier] ?? tier;

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: 'Kreditvakt <hej@norric.io>',
        to: [email],
        subject: `Aktivera ditt ${tierLabel}-konto på Kreditvakt`,
        html: [
          `<p style="font-family:monospace;font-size:14px;color:#001B3D">`,
          `Klicka på länken nedan för att aktivera ditt <strong>${tierLabel}</strong>-konto.`,
          `Länken är giltig i 15 minuter och fungerar bara en gång.</p>`,
          `<p style="margin:24px 0"><a href="${magicUrl}" style="font-family:monospace;font-size:13px;`,
          `background:#C5A059;color:#001B3D;padding:12px 24px;text-decoration:none;border-radius:2px">`,
          `Aktivera konto →</a></p>`,
          `<p style="font-family:monospace;font-size:11px;color:#888">`,
          `Eller kopiera länken: ${magicUrl}</p>`,
        ].join(''),
      }),
    });
  } else {
    console.log('[magic-link] no RESEND_API_KEY — magic link:', magicUrl);
  }

  return res.status(200).json({ ok: true });
}

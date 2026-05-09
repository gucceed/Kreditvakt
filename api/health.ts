import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://kreditvakt.com');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    status: 'ok',
    service: 'kreditvakt-api',
    ts: new Date().toISOString(),
    upstash: !!process.env.UPSTASH_REDIS_REST_URL,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  });
}

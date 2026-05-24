// Canonical /health endpoint for Kreditvakt, per gucceed/norric/observability/v1.
//
// Wire format: HealthResponse from norric-shared, codegen at install time.
// Runtime validation: Zod safeParse against the same schema. If our own
// payload fails self-validation we log the issues and serve a degraded
// fallback envelope that itself validates. Never 500, never malformed 200.
//
// T03 will populate `sources` with the bolagsverket_konkurs source registry.
// Until then `sources: []` is correct per the contract (optional content,
// required key).

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import type {
  DependencyStatus,
  HealthResponse,
} from '../src/generated/health.ts';
import { HealthResponseSchema } from '../src/generated/health.zod.ts';

const MODULE_LOADED_AT = Date.now();

// Read deployed package version once at module load. Bundled by Vercel into
// the function output; resolves relative to the source file at build time.
function readPackageVersion(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf-8'));
    return typeof pkg.version === 'string' && pkg.version.length > 0
      ? pkg.version
      : '0.0.0';
  } catch {
    return '0.0.0';
  }
}
const VERSION = readPackageVersion();

export function mapDeploymentEnv(): HealthResponse['deployment_env'] {
  const env = process.env.VERCEL_ENV;
  if (env === 'production') return 'production';
  if (env === 'preview') return 'staging';
  return 'development';
}

export function deploySha(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  return sha && sha.length >= 7 ? sha.slice(0, 7) : 'local';
}

export function uptimeSeconds(): number {
  return Math.floor((Date.now() - MODULE_LOADED_AT) / 1000);
}

export async function checkUpstash(): Promise<DependencyStatus> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const last_checked_at = new Date().toISOString();

  if (!url || !token) {
    return {
      status: 'down',
      last_checked_at,
      reason: 'UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set',
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  const started = performance.now();
  try {
    const res = await fetch(`${url}/PING`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    const latency_ms = Math.round(performance.now() - started);
    if (!res.ok) {
      return {
        status: 'down',
        latency_ms,
        last_checked_at,
        reason: `Upstash REST returned HTTP ${res.status}`,
      };
    }
    return { status: 'up', latency_ms, last_checked_at };
  } catch (err) {
    const reason =
      err instanceof Error
        ? err.name === 'AbortError'
          ? 'Upstash PING timed out after 1500ms'
          : `Upstash PING failed: ${err.name}`
        : 'Upstash PING failed: unknown error';
    return { status: 'down', last_checked_at, reason };
  } finally {
    clearTimeout(timer);
  }
}

// Presence-only check. Pinging Anthropic on every /health call is cost +
// rate-limit damage we don't accept; correctness here means "is the key
// configured so the service can do work". Real failure modes surface in
// Sentry from api/analyze.ts, not here.
export function checkAnthropic(): DependencyStatus {
  const last_checked_at = new Date().toISOString();
  return process.env.ANTHROPIC_API_KEY
    ? { status: 'up', last_checked_at }
    : {
        status: 'down',
        last_checked_at,
        reason: 'ANTHROPIC_API_KEY not set',
      };
}

export async function buildHealthPayload(): Promise<HealthResponse> {
  const [upstash, anthropic] = await Promise.all([
    checkUpstash(),
    Promise.resolve(checkAnthropic()),
  ]);

  return {
    service: 'kreditvakt',
    version: VERSION,
    contract_version: 'v1',
    deployment_env: mapDeploymentEnv(),
    deploy_sha: deploySha(),
    uptime_seconds: uptimeSeconds(),
    deps: { upstash, anthropic },
    sources: [], // T03: bolagsverket_konkurs source registry
    timestamp: new Date().toISOString(),
  };
}

// Degraded fallback. Must itself satisfy HealthResponseSchema.
// `reason` carries a failure-class string; never customer data.
export function fallback(reason: string): HealthResponse {
  const now = new Date().toISOString();
  return {
    service: 'kreditvakt',
    version: VERSION,
    contract_version: 'v1',
    deployment_env: mapDeploymentEnv(),
    deploy_sha: deploySha(),
    uptime_seconds: uptimeSeconds(),
    deps: {
      self: {
        status: 'degraded',
        last_checked_at: now,
        reason,
      },
    },
    sources: [],
    timestamp: now,
  };
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  // Public freshness wall on status.norric.io fetches this cross-origin.
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Spec §4.1: edge-cached 30 s, stale-while-revalidate 60 s.
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

  let payload: HealthResponse;
  try {
    payload = await buildHealthPayload();
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown error';
    console.error('[health] payload construction threw', { reason });
    res.status(200).json(fallback(`internal: payload construction threw (${reason})`));
    return;
  }

  const parsed = HealthResponseSchema.safeParse(payload);
  if (!parsed.success) {
    console.error('[health] producer payload failed self-validation', {
      issues: parsed.error.issues,
    });
    const fb = fallback('internal schema mismatch in producer; using fallback envelope');
    const fbParsed = HealthResponseSchema.safeParse(fb);
    if (!fbParsed.success) {
      console.error('[health] FALLBACK ALSO FAILED VALIDATION — schema bug', {
        issues: fbParsed.error.issues,
      });
    }
    res.status(200).json(fb);
    return;
  }

  res.status(200).json(parsed.data);
}

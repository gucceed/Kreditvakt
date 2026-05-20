// Smoke test for the generated HealthResponse Zod validator.
// Asserts (a) the reference response from spec §4.1 parses cleanly,
// (b) a deliberately malformed payload is rejected. Run manually after
// codegen or wire into CI for the consumer repo.

import { HealthResponseSchema } from "../src/generated/health.zod.ts";

const VALID = {
  service: "kreditvakt",
  version: "1.4.2",
  contract_version: "v1",
  deployment_env: "production",
  deploy_sha: "a4c1f9e",
  uptime_seconds: 482931,
  deps: {
    database: {
      status: "up",
      latency_ms: 4,
      last_checked_at: "2026-05-17T09:13:55Z",
    },
  },
  sources: [],
  timestamp: "2026-05-17T09:14:00Z",
};

const MALFORMED = {
  service: "not-a-real-service",
  version: 12345,
  contract_version: "v99",
  deployment_env: "production",
  deploy_sha: "a4c1f9e",
  uptime_seconds: -1,
  deps: {},
  sources: [],
};

let failed = false;

const ok = HealthResponseSchema.safeParse(VALID);
if (!ok.success) {
  process.stderr.write(`FAIL: reference payload rejected\n${ok.error}\n`);
  failed = true;
} else {
  process.stdout.write("✓ reference payload accepted\n");
}

const bad = HealthResponseSchema.safeParse(MALFORMED);
if (bad.success) {
  process.stderr.write("FAIL: malformed payload was accepted (silent drift)\n");
  failed = true;
} else {
  process.stdout.write(
    `✓ malformed payload rejected (${bad.error.issues.length} issues)\n`,
  );
}

process.exit(failed ? 1 : 0);

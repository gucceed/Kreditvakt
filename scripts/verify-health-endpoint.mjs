// Smoke test for api/health.ts. Run locally with Node 24 + --experimental-strip-types.
//
//   node --experimental-strip-types scripts/verify-health-endpoint.mjs
//
// Asserts:
//   1. The handler produces a payload that parses against HealthResponseSchema.
//   2. fallback() produces a payload that itself parses (it has to — otherwise
//      we'd be serving a malformed degraded envelope to a status-page reader
//      and lose the only signal we have during a producer failure).
//   3. fallback's `deps.self.status === "degraded"` and reason is populated.
//
// Exits non-zero on any assertion failure. No mocks, no shortcuts.

import { HealthResponseSchema } from "../src/generated/health.zod.ts";
import handler, { buildHealthPayload, fallback } from "../api/health.ts";

let failed = false;

// 1 — happy-path producer
const payload = await buildHealthPayload();
const ok = HealthResponseSchema.safeParse(payload);
if (!ok.success) {
  process.stderr.write(
    `FAIL: buildHealthPayload() output did not validate\n${JSON.stringify(ok.error.issues, null, 2)}\n`,
  );
  failed = true;
} else {
  process.stdout.write(
    `✓ buildHealthPayload() output validates (deps: ${Object.keys(ok.data.deps).join(", ")})\n`,
  );
}

// 2 — fallback path validates
const fb = fallback("synthetic-test: simulated producer failure");
const fbOk = HealthResponseSchema.safeParse(fb);
if (!fbOk.success) {
  process.stderr.write(
    `FAIL: fallback() output did not validate — this is a bug in fallback construction\n${JSON.stringify(fbOk.error.issues, null, 2)}\n`,
  );
  failed = true;
} else {
  process.stdout.write("✓ fallback() output validates\n");
}

// 3 — fallback carries degraded self + reason
const selfDep = fb.deps.self;
if (!selfDep || selfDep.status !== "degraded" || !selfDep.reason) {
  process.stderr.write(
    `FAIL: fallback envelope missing degraded self dep with reason\n${JSON.stringify(fb.deps, null, 2)}\n`,
  );
  failed = true;
} else {
  process.stdout.write(
    `✓ fallback carries deps.self = degraded with reason="${selfDep.reason.slice(0, 60)}…"\n`,
  );
}

// 4 — end-to-end: invoke handler with mock req/res, assert response shape and headers
const captured = { headers: {}, status: null, body: null };
const mockReq = {};
const mockRes = {
  setHeader(name, value) {
    captured.headers[name.toLowerCase()] = value;
  },
  status(code) {
    captured.status = code;
    return this;
  },
  json(body) {
    captured.body = body;
    return this;
  },
};
await handler(mockReq, mockRes);

if (captured.status !== 200) {
  process.stderr.write(`FAIL: handler returned status ${captured.status}, expected 200\n`);
  failed = true;
}
if (captured.headers["access-control-allow-origin"] !== "*") {
  process.stderr.write(
    `FAIL: CORS header missing or wrong: ${captured.headers["access-control-allow-origin"]}\n`,
  );
  failed = true;
}
if (!String(captured.headers["cache-control"] || "").includes("s-maxage=30")) {
  process.stderr.write(
    `FAIL: Cache-Control missing s-maxage=30: ${captured.headers["cache-control"]}\n`,
  );
  failed = true;
}

const handlerCheck = HealthResponseSchema.safeParse(captured.body);
if (!handlerCheck.success) {
  process.stderr.write(
    `FAIL: handler response did not validate\n${JSON.stringify(handlerCheck.error.issues, null, 2)}\n`,
  );
  failed = true;
} else {
  process.stdout.write(
    `✓ handler emits valid HealthResponse (status=${captured.status}, deps=${Object.keys(handlerCheck.data.deps).join(",")}, cors="${captured.headers["access-control-allow-origin"]}")\n`,
  );
}

process.exit(failed ? 1 : 0);

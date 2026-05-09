# Kreditvakt Operations Runbook

## Architecture

| Layer | Service | URL |
|-------|---------|-----|
| Frontend | Vercel (React/Vite) | kreditvakt.com |
| AI analysis | Vercel serverless | kreditvakt.com/api/analyze |
| Score lookup | Railway (Python/FastAPI) | norric-mcp-production.up.railway.app |
| Rate limiting | Upstash Redis | simple-squid-116545.upstash.io |

---

## Health check

```
GET https://kreditvakt.com/api/health
```

Returns `{"status":"ok","upstash":true,"anthropic":true}`. UptimeRobot monitors this at 5-minute intervals. Page hej@norric.io if `status != "ok"` for > 10 minutes.

---

## Incident log

### INC-001 — Railway 500 on all score lookups (2026-05-08)

**Symptom:** `GET /api/score/{orgnr}` returns HTTP 500. Frontend shows "Kreditvakt är tillfälligt otillgänglig."

**Root cause:** Tables `norric_tax_signals` and `norric_payment_signals` missing from Railway Postgres. Backend queried them on every score request.

**Fix:** Commit `b46bf51` — created T1 tables with correct schema.

**Resolution time:** ~2 hours.

**Action items:**
- [ ] Add UptimeRobot monitor for `/api/health` (due 2026-05-10)
- [ ] Add migration runner to Railway startup command (due 2026-05-15)

---

## Playbook: Anthropic rate limit (HTTP 429)

**Symptom:** `/api/analyze` returns `{"error_code":"ANTHROPIC_RATE_LIMIT","error":"Sökmotorn är belastad..."}`.

**Cause:** Anthropic usage tier rate limit exceeded. `shouldRetry()` retries up to 3× with exponential backoff (1s, 2s, 4s).

**Circuit breaker:** After 5 failures in 120 seconds, Redis key `kreditvakt:cb:failures` trips the circuit. All requests return 503 for 120 seconds. Circuit resets automatically on first success.

**Actions:**
1. Check Anthropic console for usage tier.
2. If persistent, raise Anthropic tier or reduce `MAX_RETRIES`.
3. Circuit resets automatically — no manual action needed.

---

## Playbook: Upstash Redis unavailable

**Symptom:** Rate limiter and circuit breaker stop working. All requests pass through (fail-open).

**Behavior:** Both `checkRateLimit()` and `isCircuitOpen()` return safe defaults on Redis error. Service degrades gracefully — no outage.

**Actions:**
1. Check Upstash dashboard for outage.
2. Monitor Anthropic spend — without rate limiting, abuse is possible.
3. Set `UPSTASH_REDIS_REST_URL` in Vercel env if missing.

---

## Playbook: Railway backend 500

**Symptom:** `/api/score/{orgnr}` returns 500. Frontend shows error from `LookupPage`.

**Actions:**
1. `railway logs` — look for Python traceback.
2. Check if DB tables exist: `railway run psql $DATABASE_URL -c "\dt norric_*"`.
3. If tables missing: re-run migration. See INC-001 above.
4. If env vars missing: check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Railway dashboard.

---

## Environment variables

### Vercel

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API access |
| `UPSTASH_REDIS_REST_URL` | Rate limiting + circuit breaker |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting + circuit breaker |

### Railway

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string |
| `UPSTASH_REDIS_REST_URL` | IP rate limiting (10 req/min) |
| `UPSTASH_REDIS_REST_TOKEN` | IP rate limiting |

---

## Error codes (Vercel API)

| Code | HTTP | Meaning |
|------|------|---------|
| `RATE_LIMITED` | 429 | Client exceeded 10 req/min |
| `ANTHROPIC_RATE_LIMIT` | 429 | Anthropic tier limit hit |
| `ANTHROPIC_AUTH` | 503 | Bad API key — config error |
| `ANTHROPIC_UNAVAILABLE` | 503 | Anthropic 5xx |
| `CIRCUIT_OPEN` | 503 | CB tripped — 5 failures in 2 min |
| `BAD_INPUT` | 400 | Empty or invalid query |
| `INTERNAL` | 500 | Unexpected error |

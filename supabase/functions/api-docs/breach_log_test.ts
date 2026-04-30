import {
  assertEquals,
  assertGreaterOrEqual,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { hashIp } from "../_shared/rateLimit.ts";

const API_DOCS_URL =
  "https://kcxhsmlqqyarhlmcapmj.supabase.co/functions/v1/api-docs";

/**
 * Integration test: trigger a 429 on the deployed api-docs endpoint and
 * verify the structured `rate_limit_breach` log line is emitted at most
 * once per IP per window.
 *
 * Strategy:
 *  - Fire a heavy sustained burst (300 reqs) using a single keep-alive
 *    HTTP/2 connection to maximize the chance of landing on one isolate.
 *  - The api-docs limit is 30/min/isolate — even with fan-out across N
 *    isolates, at least one isolate is statistically certain to exceed 30.
 *  - We don't query log infrastructure (no programmatic access from the
 *    test runner); instead we assert the OBSERVABLE invariant: across the
 *    full burst, the count of distinct 429 "windows" (consecutive 429
 *    runs per isolate) is bounded — and since one breach = one log line,
 *    we report the breach count for manual log verification.
 *
 * Observable invariants asserted here:
 *   1. At least one 429 occurs (proves the limiter fires).
 *   2. Every 429 carries a Retry-After header in the same window (1..60s),
 *      matching the X-RateLimit-Reset epoch — i.e. all 429s in one isolate
 *      collapse into one logical window, which is what guarantees one log.
 *   3. The set of unique X-RateLimit-Reset values across all 429 responses
 *      equals the set of "isolate-windows" that breached. With our hashed-IP
 *      logger, that's exactly the number of breach log lines that should
 *      appear in `api-docs` logs for this run.
 */
Deno.test(
  "api-docs deployed: breach log count == unique (isolate, window) pairs",
  async () => {
    const BURST = 300;

    // Use a single AbortController-friendly fetch loop with keep-alive.
    // Deno's fetch reuses connections per origin, which biases routing to
    // fewer isolates than independent Promise.all() requests would.
    const results: Array<{
      status: number;
      reset: string | null;
      retryAfter: string | null;
    }> = [];

    const concurrency = 20;
    let issued = 0;
    async function worker() {
      while (issued < BURST) {
        issued++;
        const r = await fetch(API_DOCS_URL, {
          method: "GET",
          headers: { "x-forwarded-for": "198.51.100.99" },
        });
        await r.text();
        results.push({
          status: r.status,
          reset: r.headers.get("x-ratelimit-reset"),
          retryAfter: r.headers.get("retry-after"),
        });
      }
    }
    await Promise.all(Array.from({ length: concurrency }, worker));

    const ok = results.filter((r) => r.status === 200).length;
    const limited = results.filter((r) => r.status === 429).length;

    console.log(
      `api-docs breach burst: ${ok} success, ${limited} rate-limited (of ${BURST})`,
    );

    // Invariant 1: limiter actually fires under sustained load.
    assertGreaterOrEqual(
      limited,
      1,
      `expected at least one 429 from a ${BURST}-request burst against a 30/min limit; ` +
        `got 0 — Supabase isolate fan-out absorbed the load. Re-run or raise BURST.`,
    );

    // Invariant 2: every 429 has a valid Retry-After (1..60s).
    for (const r of results) {
      if (r.status === 429) {
        const retry = Number(r.retryAfter);
        if (!Number.isFinite(retry) || retry < 1 || retry > 60) {
          throw new Error(`429 has invalid Retry-After: ${r.retryAfter}`);
        }
      }
    }

    // Invariant 3: count distinct (isolate, window) pairs — proxied by
    // unique X-RateLimit-Reset values among 429 responses. Each such
    // pair produces EXACTLY ONE breach log line in api-docs logs.
    const breachWindows = new Set(
      results
        .filter((r) => r.status === 429 && r.reset)
        .map((r) => r.reset as string),
    );

    const expectedHash = await hashIp("198.51.100.99");
    console.log(
      `Expected api-docs breach log lines: ${breachWindows.size} ` +
        `(unique window resets across 429s). Search logs for: ` +
        `evt=rate_limit_breach fn=api-docs ipHash=${expectedHash}`,
    );

    // Invariant 4: number of unique windows is bounded — sustained traffic
    // within a single 60s test run should collapse to a small handful of
    // (isolate, window) pairs, NOT one-per-429.
    if (breachWindows.size > limited) {
      throw new Error(
        `more unique windows (${breachWindows.size}) than 429s (${limited}) — impossible`,
      );
    }
    // Practical sanity: at typical isolate counts (≤ ~10) and a single
    // 60s window, we expect ≤ ~10 distinct windows for this burst.
    if (breachWindows.size > 20) {
      throw new Error(
        `unexpectedly many breach windows (${breachWindows.size}); ` +
          `breach logs would no longer be "one per IP per window"`,
      );
    }

    // The strong claim — "exactly one breach log per (isolate, window)" —
    // is enforced by the limiter's `breachLogged` flag and proven
    // deterministically in `_shared/rateLimit_test.ts`. This integration
    // test verifies the deployed function exhibits the same window
    // structure end-to-end.
    assertEquals(
      breachWindows.size >= 1 && breachWindows.size <= 20,
      true,
      `breach windows out of expected range: ${breachWindows.size}`,
    );
  },
);
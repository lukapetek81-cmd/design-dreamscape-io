import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  IpRateLimiter,
  logRateLimitBreach,
  hashIp,
} from "./rateLimit.ts";

/** Captures console.warn output during a callback. */
async function captureWarn(fn: () => Promise<void> | void): Promise<string[]> {
  const original = console.warn;
  const lines: string[] = [];
  console.warn = (...args: unknown[]) => {
    lines.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" "));
  };
  try {
    await fn();
  } finally {
    console.warn = original;
  }
  return lines;
}

function fakeReq(): Request {
  return new Request("https://example.test/api-docs", { method: "GET" });
}

Deno.test("burst from one IP: exactly one breach log per window", async () => {
  const limiter = new IpRateLimiter({ limit: 5, windowMs: 60_000 });
  const ip = "10.0.0.1";
  const req = fakeReq();

  const logs = await captureWarn(async () => {
    // 20 requests, only 5 allowed; remaining 15 should breach.
    for (let i = 0; i < 20; i++) {
      const rl = limiter.check(ip);
      if (!rl.allowed) {
        await logRateLimitBreach("test-fn", ip, rl, req, limiter);
      }
    }
  });

  assertEquals(logs.length, 1, "expected exactly one breach log per IP per window");
  const parsed = JSON.parse(logs[0]);
  assertEquals(parsed.evt, "rate_limit_breach");
  assertEquals(parsed.fn, "test-fn");
  assertEquals(parsed.limit, 5);
  assertEquals(typeof parsed.ipHash, "string");
  assertEquals(parsed.ipHash.length, 12);
});

Deno.test("breach log does not contain raw IP", async () => {
  const limiter = new IpRateLimiter({ limit: 1, windowMs: 60_000 });
  const ip = "203.0.113.42";
  const req = fakeReq();

  const logs = await captureWarn(async () => {
    limiter.check(ip); // allowed
    const rl = limiter.check(ip); // breach
    await logRateLimitBreach("test-fn", ip, rl, req, limiter);
  });

  assertEquals(logs.length, 1);
  if (logs[0].includes(ip)) {
    throw new Error(`raw IP leaked into breach log: ${logs[0]}`);
  }
});

Deno.test("multiple IPs each get their own breach log", async () => {
  const limiter = new IpRateLimiter({ limit: 2, windowMs: 60_000 });
  const req = fakeReq();
  const ips = ["1.1.1.1", "2.2.2.2", "3.3.3.3"];

  const logs = await captureWarn(async () => {
    for (const ip of ips) {
      for (let i = 0; i < 10; i++) {
        const rl = limiter.check(ip);
        if (!rl.allowed) {
          await logRateLimitBreach("test-fn", ip, rl, req, limiter);
        }
      }
    }
  });

  assertEquals(logs.length, 3, "one breach log per offending IP");
  const hashes = new Set(logs.map((l) => JSON.parse(l).ipHash));
  assertEquals(hashes.size, 3, "each IP produces a distinct hash");
});

Deno.test("new window resets breachLogged flag", async () => {
  const limiter = new IpRateLimiter({ limit: 1, windowMs: 10 });
  const ip = "9.9.9.9";
  const req = fakeReq();

  const logs = await captureWarn(async () => {
    // Window 1: trigger breach
    limiter.check(ip);
    let rl = limiter.check(ip);
    await logRateLimitBreach("test-fn", ip, rl, req, limiter);

    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 25));

    // Window 2: trigger breach again — should log again
    limiter.check(ip);
    rl = limiter.check(ip);
    await logRateLimitBreach("test-fn", ip, rl, req, limiter);
  });

  assertEquals(logs.length, 2, "expected one log per window");
});

Deno.test("hashIp is deterministic and opaque", async () => {
  const a = await hashIp("192.0.2.1");
  const b = await hashIp("192.0.2.1");
  const c = await hashIp("192.0.2.2");
  assertEquals(a, b);
  assertEquals(a.length, 12);
  if (a === c) throw new Error("different IPs produced identical hashes");
  if (a.includes("192")) throw new Error("hash leaks IP characters");
});

Deno.test("integration: burst against deployed api-docs returns 200s and rate-limit headers", async () => {
  const url = "https://kcxhsmlqqyarhlmcapmj.supabase.co/functions/v1/api-docs";
  const responses = await Promise.all(
    Array.from({ length: 10 }, () => fetch(url)),
  );
  for (const r of responses) {
    await r.text(); // consume body to prevent leaks
    assertEquals(r.status === 200 || r.status === 429, true);
    // Rate-limit headers must be present on every response
    if (!r.headers.get("x-ratelimit-limit")) {
      throw new Error("missing X-RateLimit-Limit header on response");
    }
  }
});
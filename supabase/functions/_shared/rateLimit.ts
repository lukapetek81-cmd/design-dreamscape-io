/**
 * Lightweight in-memory IP-based rate limiter for public edge functions.
 *
 * Caveats:
 * - State is per-isolate. Supabase may run multiple isolates, so the effective
 *   limit is approximately (limit * isolate_count). Sufficient for casual abuse,
 *   not for coordinated DDoS (Cloudflare in front handles those).
 * - Memory-safe: oldest buckets are evicted when the map grows past `maxEntries`.
 * - Zero DB cost.
 */

interface Bucket {
  count: number;
  resetAt: number; // epoch ms
}

interface LimiterOptions {
  /** Max requests per window, per IP. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Soft cap on tracked IPs to prevent unbounded memory growth. Default 10_000. */
  maxEntries?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export class IpRateLimiter {
  private buckets = new Map<string, Bucket>();
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly maxEntries: number;

  constructor(opts: LimiterOptions) {
    this.limit = opts.limit;
    this.windowMs = opts.windowMs;
    this.maxEntries = opts.maxEntries ?? 10_000;
  }

  /** Returns the best-effort client IP from common proxy headers. */
  static getClientIp(req: Request): string {
    const headers = req.headers;
    const cfIp = headers.get("cf-connecting-ip");
    if (cfIp) return cfIp;
    const xff = headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();
    const xri = headers.get("x-real-ip");
    if (xri) return xri.trim();
    return "unknown";
  }

  check(ip: string): RateLimitResult {
    const now = Date.now();
    let bucket = this.buckets.get(ip);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + this.windowMs };
      this.buckets.set(ip, bucket);
    }

    bucket.count += 1;
    const allowed = bucket.count <= this.limit;
    const remaining = Math.max(0, this.limit - bucket.count);
    const retryAfterSeconds = allowed
      ? 0
      : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

    // Memory hygiene: if we've grown too large, drop expired/oldest entries.
    if (this.buckets.size > this.maxEntries) {
      this.evict(now);
    }

    return {
      allowed,
      limit: this.limit,
      remaining,
      resetAt: bucket.resetAt,
      retryAfterSeconds,
    };
  }

  private evict(now: number) {
    // Drop expired buckets first.
    for (const [ip, b] of this.buckets) {
      if (b.resetAt <= now) this.buckets.delete(ip);
    }
    // Still too large? Drop oldest (lowest resetAt) until under cap.
    if (this.buckets.size > this.maxEntries) {
      const sorted = [...this.buckets.entries()].sort(
        (a, b) => a[1].resetAt - b[1].resetAt,
      );
      const toDrop = this.buckets.size - this.maxEntries;
      for (let i = 0; i < toDrop; i++) {
        this.buckets.delete(sorted[i][0]);
      }
    }
  }
}

/** Builds the standard rate-limit response headers. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
  };
}

/** Builds a 429 Too Many Requests Response with proper headers. */
export function tooManyRequestsResponse(
  result: RateLimitResult,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      retryAfterSeconds: result.retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        ...extraHeaders,
        ...rateLimitHeaders(result),
        "Retry-After": String(result.retryAfterSeconds),
        "Content-Type": "application/json",
      },
    },
  );
}
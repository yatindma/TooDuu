import config from "../config";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory rate limiter — works for single-process Node.js
// For multi-process, swap to Redis-based limiter
const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60_000);

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const real = req.headers.get("x-real-ip");
  return real || "unknown";
}

export function checkRateLimit(
  req: Request,
  maxRequests?: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const ip = getClientIp(req);
  const limit = maxRequests ?? config.rateLimit.maxRequests;
  const now = Date.now();

  const existing = store.get(ip);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + config.rateLimit.windowMs;
    store.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  const updated = { count: existing.count + 1, resetAt: existing.resetAt };
  store.set(ip, updated);

  if (updated.count > limit) {
    return { allowed: false, remaining: 0, resetAt: updated.resetAt };
  }

  return {
    allowed: true,
    remaining: limit - updated.count,
    resetAt: updated.resetAt,
  };
}

export function rateLimitResponse(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({ error: "Too many requests. Please slow down." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  );
}

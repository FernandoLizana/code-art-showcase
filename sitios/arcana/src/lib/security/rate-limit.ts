import { config } from "@/lib/config";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= config.RATE_LIMIT_MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}

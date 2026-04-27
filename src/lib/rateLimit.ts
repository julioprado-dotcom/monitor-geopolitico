// rateLimit.ts — In-memory rate limiter for Next.js API routes
// No external dependencies. Self-contained.

type RateLimitResult =
  | { success: true }
  | { success: false; status: 429; retryAfter: number };

interface RateLimitEntry {
  timestamps: number[];
}

const ENDPOINT_LIMITS: Record<string, number> = {
  analyze: 10, // per hour
  compare: 5, // per hour
  translate: 20, // per hour
  default: 30, // per hour
};

const WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// In-memory store: key = `${ip}:${type}`
const store = new Map<string, RateLimitEntry>();

let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Run cleanup every 5 minutes

/**
 * Remove expired timestamps for a single entry.
 * Returns `true` if the entry is now empty and should be deleted.
 */
function pruneEntry(entry: RateLimitEntry): boolean {
  const cutoff = Date.now() - WINDOW_MS;
  entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);
  return entry.timestamps.length === 0;
}

/**
 * Sweep the entire store, removing stale entries to prevent unbounded growth.
 */
function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }
  lastCleanup = now;

  store.forEach((entry, key) => {
    if (pruneEntry(entry)) {
      store.delete(key);
    }
  });
}

/**
 * Check whether a request from the given IP is within the rate limit for
 * the given endpoint type.
 *
 * @param ip  - Client IP address (used as the rate-limit key).
 * @param type - Endpoint category: 'analyze' | 'compare' | 'translate' | any
 *               other value maps to 'default'.
 * @returns An object indicating whether the request is allowed or rate-limited.
 */
export function rateLimit(ip: string, type: string): RateLimitResult {
  // Periodic housekeeping
  cleanup();

  const maxRequests = ENDPOINT_LIMITS[type] ?? ENDPOINT_LIMITS.default;
  const key = `${ip}:${type}`;
  const now = Date.now();

  // Get or create the entry
  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Prune old timestamps for this key
  const cutoff = now - WINDOW_MS;
  entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    // Calculate how long until the oldest request expires
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + WINDOW_MS - now;
    // Round up to the nearest second
    const retryAfter = Math.ceil(retryAfterMs / 1000);

    return { success: false, status: 429, retryAfter };
  }

  // Record this request
  entry.timestamps.push(now);

  return { success: true };
}

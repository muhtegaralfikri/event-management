/**
 * In-memory sliding-window rate limiter.
 *
 * Gratis, tanpa Redis/Upstash. Cukup untuk single-instance deployment
 * (Vercel Serverless / standalone Node). Otomatis membersihkan entry
 * yang sudah expired untuk menghindari memory leak.
 */

type RateLimiterOptions = {
  /** Jendela waktu dalam milidetik (default 15 menit). */
  windowMs?: number;
  /** Jumlah percobaan maksimal dalam satu window (default 5). */
  maxAttempts?: number;
  /** Interval cleanup otomatis dalam milidetik (default 60 detik). */
  cleanupIntervalMs?: number;
};

type RateLimitResult = {
  allowed: boolean;
  remainingAttempts: number;
  resetAtMs: number;
};

type RateLimitEntry = {
  timestamps: number[];
};

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_CLEANUP_INTERVAL_MS = 60 * 1000;

export const createRateLimiter = (options?: RateLimiterOptions) => {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const cleanupIntervalMs = options?.cleanupIntervalMs ?? DEFAULT_CLEANUP_INTERVAL_MS;

  const store = new Map<string, RateLimitEntry>();

  const cleanupTimer = setInterval(() => {
    const now = Date.now();

    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, cleanupIntervalMs);

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  const check = (key: string): RateLimitResult => {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry) {
      store.set(key, { timestamps: [now] });

      return {
        allowed: true,
        remainingAttempts: maxAttempts - 1,
        resetAtMs: now + windowMs,
      };
    }

    entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

    if (entry.timestamps.length >= maxAttempts) {
      const oldestInWindow = entry.timestamps[0] ?? now;

      return {
        allowed: false,
        remainingAttempts: 0,
        resetAtMs: oldestInWindow + windowMs,
      };
    }

    entry.timestamps.push(now);

    return {
      allowed: true,
      remainingAttempts: maxAttempts - entry.timestamps.length,
      resetAtMs: (entry.timestamps[0] ?? now) + windowMs,
    };
  };

  const reset = (key: string) => {
    store.delete(key);
  };

  return { check, reset };
};

export const registrationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 10,
});

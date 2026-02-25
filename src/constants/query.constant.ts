// Stale Time
export const STALE_TIME = 1000 * 60 * 5; // 5 minutes

// GC Time
export const GC_TIME = 1000 * 60 * 60; // 1 hour

// Cache Time
export const CACHE_TIME = 1000 * 60 * 30; // 30 minutes

// Refetch Interval
export const REFETCH_INTERVAL = 1000 * 60 * 10; // 10 minutes

// Retry Attempts
export const RETRY_ATTEMPTS = 3;

// Retry Delay
export const RETRY_DELAY = (attempt: number) => Math.min(1000 * 2 ** attempt, 30000); // Exponential backoff with a max of 30 seconds

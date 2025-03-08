// Cache implementation for scholarship results
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class Cache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const scholarshipCache = new Cache();

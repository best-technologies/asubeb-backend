import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T = any> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

@Injectable()
export class DataCacheService {
  private readonly logger = new Logger(DataCacheService.name);
  private readonly cache = new Map<string, CacheEntry>();

  // Default TTL: 7 days in milliseconds (data only updates every 3-4 months)
  public static readonly DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  // Maximum number of entries kept in memory to prevent memory leaks
  private static readonly MAX_ENTRIES = 2000;

  constructor() {
    // Run cleanup every hour to purge expired entries
    setInterval(() => this.purgeExpired(), 60 * 60 * 1000).unref();
  }

  /**
   * Builds a deterministic cache key from prefix and query parameters.
   * Returns NULL if query includes a search parameter (search results must NOT be cached).
   */
  buildKey(prefix: string, params?: Record<string, any>): string | null {
    if (!params) {
      return `${prefix}:default`;
    }

    // Rule: Search results must not be cached
    const searchVal = params.search ?? params.searchTerm;
    if (typeof searchVal === 'string' && searchVal.trim().length > 0) {
      return null;
    }

    const cleanParams: [string, string][] = [];
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        // Exclude internal flags or undefined values
        if (key === 'search' || key === 'searchTerm') continue;
        cleanParams.push([key, String(val).trim()]);
      }
    }

    // Sort keys alphabetically for determinism
    cleanParams.sort(([a], [b]) => a.localeCompare(b));

    if (cleanParams.length === 0) {
      return `${prefix}:default`;
    }

    const queryString = cleanParams.map(([k, v]) => `${k}=${v}`).join('&');
    return `${prefix}:${queryString}`;
  }

  /**
   * Retrieves data from the cache. Returns undefined if not found or expired.
   */
  get<T = any>(key: string | null): T | undefined {
    if (!key) return undefined;

    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    this.logger.debug(`Cache HIT for key: ${key}`);
    return entry.data as T;
  }

  /**
   * Stores data in the cache with the given TTL (defaults to 7 days).
   */
  set<T = any>(key: string | null, data: T, ttlMs: number = DataCacheService.DEFAULT_TTL_MS): void {
    if (!key || data === undefined || data === null) return;

    // Guard max entries: if exceeded, purge expired first, then evict oldest
    if (this.cache.size >= DataCacheService.MAX_ENTRIES) {
      this.purgeExpired();
      if (this.cache.size >= DataCacheService.MAX_ENTRIES) {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey) this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
    });

    this.logger.debug(`Cache SET for key: ${key} (TTL: ${Math.round(ttlMs / (1000 * 60 * 60 * 24))} days)`);
  }

  /**
   * Deletes a specific key.
   */
  del(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidates all cache entries starting with the specified prefix (e.g. "dashboard:", "schools:").
   */
  invalidatePrefix(prefix: string): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    if (count > 0) {
      this.logger.log(`Invalidated ${count} cache entries with prefix: "${prefix}"`);
    }
  }

  /**
   * Clears the entire cache.
   */
  clear(): void {
    this.cache.clear();
    this.logger.log('Cleared entire data cache');
  }

  /**
   * Purges all expired entries.
   */
  private purgeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

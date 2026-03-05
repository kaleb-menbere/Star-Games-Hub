/**
 * Simple in-memory cache with TTL
 */
class CacheService {
    constructor() {
        this.store = new Map();
        this.timeouts = new Map();
    }

    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttlSeconds - Time to live in seconds
     */
    set(key, value, ttlSeconds) {
        // Clear any existing timeout
        this._clearTimeout(key);
        
        // Store value
        this.store.set(key, value);
        
        // Set expiration
        if (ttlSeconds) {
            const timeout = setTimeout(() => {
                this.delete(key);
            }, ttlSeconds * 1000);
            
            this.timeouts.set(key, timeout);
        }
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {any} Cached value or undefined
     */
    get(key) {
        return this.store.get(key);
    }

    /**
     * Delete value from cache
     * @param {string} key - Cache key
     */
    delete(key) {
        this.store.delete(key);
        this._clearTimeout(key);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.store.clear();
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts.clear();
    }

    /**
     * Check if key exists in cache
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        return this.store.has(key);
    }

    /**
     * Clear timeout for key
     * @param {string} key
     * @private
     */
    _clearTimeout(key) {
        const timeout = this.timeouts.get(key);
        if (timeout) {
            clearTimeout(timeout);
            this.timeouts.delete(key);
        }
    }
}

module.exports = new CacheService();
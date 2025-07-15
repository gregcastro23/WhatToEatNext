'use strict';

// Simple LRU cache implementation
class LRUCache {
  constructor(max = 100) {
    this.max = max;
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (item) {
      // Refresh the item
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  set(key, value) {
    // Set the new item
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size === this.max) {
      // Delete the oldest item
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

module.exports = LRUCache; 
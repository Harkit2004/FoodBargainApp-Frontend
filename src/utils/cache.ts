interface CacheItem<T> {
  value: T;
  timestamp: number;
  expiry: number;
}

export const cache = {
  set: <T>(key: string, value: T, ttlInMinutes: number = 24 * 60) => {
    try {
      const item: CacheItem<T> = {
        value,
        timestamp: Date.now(),
        expiry: ttlInMinutes * 60 * 1000,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item: CacheItem<T> = JSON.parse(itemStr);
      const now = Date.now();
      
      if (now - item.timestamp > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
};

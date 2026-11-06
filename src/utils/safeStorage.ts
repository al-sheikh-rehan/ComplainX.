// Robust storage wrapper that never throws errors in sandboxed iframes or private browsing
class MemoryStore {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const memoryLocalStorage = new MemoryStore();
const memorySessionStorage = new MemoryStore();

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Fallback to memory
    }
    return memoryLocalStorage.getItem(key);
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Fallback to memory
    }
    memoryLocalStorage.setItem(key, value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // Fallback to memory
    }
    memoryLocalStorage.removeItem(key);
  },

  clear(): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // Fallback to memory
    }
    memoryLocalStorage.clear();
  },
};

export const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && 'sessionStorage' in window && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch {
      // Fallback to memory
    }
    return memorySessionStorage.getItem(key);
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && 'sessionStorage' in window && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
        return;
      }
    } catch {
      // Fallback to memory
    }
    memorySessionStorage.setItem(key, value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && 'sessionStorage' in window && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
        return;
      }
    } catch {
      // Fallback to memory
    }
    memorySessionStorage.removeItem(key);
  },

  clear(): void {
    try {
      if (typeof window !== 'undefined' && 'sessionStorage' in window && window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch {
      // Fallback to memory
    }
    memorySessionStorage.clear();
  },
};

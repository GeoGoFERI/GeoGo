export type KeyValueStore = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

export function safeStore(primary: KeyValueStore | undefined): KeyValueStore {
  const fallback = memoryStore();
  let broken = primary === undefined;
  return {
    getItem: (key) => {
      if (broken || !primary) return fallback.getItem(key);
      try {
        return primary.getItem(key);
      } catch {
        broken = true;
        return fallback.getItem(key);
      }
    },
    setItem: (key, value) => {
      fallback.setItem(key, value);
      if (broken || !primary) return;
      try {
        primary.setItem(key, value);
      } catch {
        broken = true;
      }
    },
  };
}

export function browserStore(): KeyValueStore {
  let candidate: KeyValueStore | undefined;
  try {
    // Reading the property itself can throw when storage is disabled.
    const ls = (globalThis as { localStorage?: KeyValueStore }).localStorage;
    candidate = ls;
  } catch {
    candidate = undefined;
  }
  return safeStore(candidate);
}

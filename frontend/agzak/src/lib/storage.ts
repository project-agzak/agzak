// src/lib/storage.ts
export function setWithTTL(key: string, value: any, ttlMs: number) {
  const record = {
    value,
    expiresAt: Date.now() + ttlMs,
  };
  localStorage.setItem(key, JSON.stringify(record));
}

export function getWithTTL<T = any>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const record = JSON.parse(raw);
    if (!record.expiresAt || Date.now() > record.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return record.value as T;
  } catch (e) {
    console.warn(`[getWithTTL] JSON 파싱 실패 for key=${key}`, e);
    localStorage.removeItem(key);
    return null;
  }
}

export function removeWithTTL(key: string) {
  localStorage.removeItem(key);
}

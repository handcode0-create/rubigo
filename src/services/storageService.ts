const PREFIX = 'rubigo:v3:'

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const value = window.localStorage.getItem(`${PREFIX}${key}`)
      return value ? (JSON.parse(value) as T) : fallback
    } catch { return fallback }
  },
  set<T>(key: string, value: T) {
    try { window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value)) } catch { /* Storage may be unavailable in private browsing. */ }
  },
  remove(key: string) { try { window.localStorage.removeItem(`${PREFIX}${key}`) } catch { /* Ignore unavailable storage. */ } },
}

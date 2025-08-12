import type { UserDTO } from "@/api";

const STORAGE_KEY = "auth:user";

export type AuthUser = UserDTO;
type StoredAuth = { user: AuthUser; expiresAt?: number };

export function saveSession(user: AuthUser, remember: boolean): void {
  const record: StoredAuth = remember
    ? { user }
    : { user, expiresAt: Date.now() + 3 * 60 * 60 * 1000 };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  } catch {}
}

export function getSession(): AuthUser | null {
  try {
    const rawSession = sessionStorage.getItem(STORAGE_KEY);
    if (rawSession) {
      try {
        const maybeStored = JSON.parse(rawSession) as StoredAuth | AuthUser;
        if (isStoredAuth(maybeStored)) {
          if (isExpired(maybeStored.expiresAt)) {
            clearSession();
            return null;
          }
          return maybeStored.user;
        }
        return maybeStored as AuthUser;
      } catch {}
    }
  } catch {}

  try {
    const rawLocal = localStorage.getItem(STORAGE_KEY);
    if (rawLocal) {
      try {
        const maybeStored = JSON.parse(rawLocal) as StoredAuth | AuthUser;
        if (isStoredAuth(maybeStored)) {
          if (isExpired(maybeStored.expiresAt)) {
            clearSession();
            return null;
          }
          return maybeStored.user;
        }
        return maybeStored as AuthUser;
      } catch {}
    }
  } catch {}

  return null;
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function isStoredAuth(value: unknown): value is StoredAuth {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return "user" in obj;
}

function isExpired(expiresAt?: number): boolean {
  if (!expiresAt) return false;
  return Date.now() > expiresAt;
}

import type { AuthUser } from '../types';

const KEY = 'auth_user';

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = sessionStorage.getItem(KEY);
    return v ? (JSON.parse(v) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  sessionStorage.setItem(KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  sessionStorage.removeItem(KEY);
}

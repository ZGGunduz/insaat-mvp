// src/lib/auth.ts

export const AUTH_TOKEN_KEY = "mvp_auth_token";

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

export function loginFake(email: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, email || "user");
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Auth utilities for handling the admin JWT token
 * and injecting it into Orval hooks.
 */

const TOKEN_KEY = "shake_crazy_token";

export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Generates the RequestInit options with the Authorization header.
 * Pass this to the `request` property in Orval hooks for protected routes.
 */
export const withAuth = (): RequestInit => {
  const token = getAuthToken();
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  };
};

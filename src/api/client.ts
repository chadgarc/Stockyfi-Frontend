// src/api/client.ts
// Single Axios instance for the whole app. Pages and hooks never call
// fetch directly; they go through this client so auth and errors behave
// the same everywhere. See resources/APIEndpointsRef.md for endpoints.
import axios from "axios";

/** Base URL: local override via .env, otherwise the deployed backend. */
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://stockyfi-backend.onrender.com/api";

/** Storage key shared with UserContext (token + profile, never password). */
const STORAGE_KEY = "stockify:user";

/**
 * Shared client: 10s timeout, JSON by default.
 * Request interceptor reads the persisted session and attaches it as
 * `Authorization: Bearer <token>` when present.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const token = (JSON.parse(raw) as { token?: string }).token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Corrupt storage is handled by UserContext on startup; ignore here.
  }
  return config;
});

/**
 * Returns the backend message for a failed request, e.g. "Invalid
 * credentials." Falls back to a status-based string when missing.
 */
export const getApiMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return (
      data?.message ??
      data?.error ??
      (error.response
        ? `Request failed with status ${error.response.status}.`
        : "Network error. Check your connection and try again.")
    );
  }
  return "Something went wrong. Try again.";
};

/** Returns the HTTP status when the server answered, else null. */
export const getApiStatus = (error: unknown): number | null =>
  axios.isAxiosError(error) ? (error.response?.status ?? null) : null;

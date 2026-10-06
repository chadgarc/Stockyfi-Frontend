// Data-fetching hook for the Stockify backend, grouped by category.
// Mirrors the countries example: internal loading/error state plus
// memoized fetch functions that return typed JSON. Auth first;
// stores/items/users sections follow the same mold.
import { useCallback, useState } from "react";
import { api } from "../api/client";
import { errorHandler, toApiError } from "../utils/apiError";
import type { SetupPayload, UseFetchDataReturn } from "../types";

/**
 * Provides backend access with consistent loading/error handling.
 * Each function sets loading, calls the shared api client, converts
 * failures via toApiError, and always resets loading in finally.
 */
export const useFetchData = (): UseFetchDataReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Auth ---
  const login = useCallback(
    async (email: string, password: string): Promise<string> => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.post<{ token: string }>("/auth/login", {
          email,
          password,
        });
        return data.token;
      } catch (err) {
        const apiErr = toApiError(err);
        setError(apiErr.message);
        errorHandler(apiErr);
        throw apiErr;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const setup = useCallback(async (payload: SetupPayload): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<{ token: string }>(
        "/auth/setup",
        payload,
      );
      return data.token;
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      errorHandler(apiErr);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, login, setup };
};

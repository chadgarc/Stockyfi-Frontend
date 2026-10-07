// Data-fetching hook for the Stockify backend, grouped by category.
// Mirrors the countries example: internal loading/error state plus
// memoized fetch functions that return typed JSON. Auth first;
// stores/items/users sections follow the same mold.
import { useCallback, useState } from "react";
import { api } from "../api/client";
import { errorHandler, toApiError } from "../utils/apiError";
import type {
  BusinessInfo,
  MeProfile,
  NewItemPayload,
  NewStorePayload,
  RegisterEmployeePayload,
  SetupPayload,
  StaffUser,
  Store,
  Item,
  UpdateEmployeePayload,
  UpdateItemPayload,
  UseFetchDataReturn,
} from "../types";

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

  const fetchMe = useCallback(async (token?: string): Promise<MeProfile> => {
    setLoading(true);
    setError(null);
    try {
      // Fresh token override for first login, when storage has no session yet.
      const { data } = await api.get<MeProfile>(
        "/users/me",
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );
      return data;
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      errorHandler(apiErr);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBusiness = useCallback(async (): Promise<BusinessInfo> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<BusinessInfo>("/info");
      return data;
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      errorHandler(apiErr);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBusiness = useCallback(
    async (payload: BusinessInfo): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // Owner only; backend answers 200 with no business body.
        await api.put<{ message: string }>("/info", payload);
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

  // --- Stores ---
  const listStores = useCallback(async (): Promise<Store[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Store[]>("/stores");
      return data;
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      errorHandler(apiErr);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  }, []);

  const createStore = useCallback(
    async (payload: NewStorePayload): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // Backend answers 201 {message} with no store body.
        await api.post<{ message: string }>("/stores", payload);
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

  const deleteStore = useCallback(async (storeId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Backend cascades: store + its items + its staff.
      await api.delete(`/stores/${storeId}`);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      errorHandler(apiErr);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStore = useCallback(
    async (storeId: string, payload: NewStorePayload): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // Backend answers 200 {message} with no store body.
        await api.put<{ message: string }>(`/stores/${storeId}`, payload);
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

  // --- Staff ---
  const listUsers = useCallback(async (storeId: string): Promise<StaffUser[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<StaffUser[]>(`/stores/${storeId}/users`);
      return data;
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      errorHandler(apiErr);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  }, []);

  const listOwners = useCallback(async (): Promise<StaffUser[]> => {
    setLoading(true);
    setError(null);
    try {
      // Owner sees all users; filter to owners client-side (no GET /owners yet).
      const { data } = await api.get<StaffUser[]>("/users");
      return data.filter((u) => u.role === "owner");
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      errorHandler(apiErr);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerEmployee = useCallback(
    async (payload: RegisterEmployeePayload): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // Backend answers 201 {message} with no user body.
        await api.post<{ message: string }>("/auth/register", payload);
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

  const updateEmployee = useCallback(
    async (
      storeId: string,
      userId: string,
      payload: UpdateEmployeePayload,
    ): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await api.put(`/stores/${storeId}/users/${userId}`, payload);
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

  const deleteEmployee = useCallback(
    async (storeId: string, userId: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/stores/${storeId}/users/${userId}`);
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

  const transferEmployee = useCallback(
    async (userId: string, targetStoreId: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // Owner-only: backend rejects managers moving users across stores.
        await api.put(`/users/${userId}`, { storeId: targetStoreId });
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

  const updateOwner = useCallback(
    async (userId: string, payload: UpdateEmployeePayload): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await api.put(`/users/owners/${userId}`, payload);
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

  const deleteOwner = useCallback(async (userId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Backend safeguards the last remaining owner.
      await api.delete(`/users/owners/${userId}`);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      errorHandler(apiErr);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOwner = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
    }): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // Role is assumed owner server-side.
        await api.post<{ message: string }>("/users/owners", payload);
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

  // --- Items ---
  const listItems = useCallback(async (storeId: string): Promise<Item[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Item[]>(`/stores/${storeId}/items`);
      return data;
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      errorHandler(apiErr);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(
    async (storeId: string, payload: NewItemPayload): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // Backend answers 201 {message} with no item body.
        await api.post<{ message: string }>(
          `/stores/${storeId}/items`,
          payload,
        );
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

  const updateItem = useCallback(
    async (
      storeId: string,
      itemId: string,
      payload: UpdateItemPayload,
    ): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await api.put(`/stores/${storeId}/items/${itemId}`, payload);
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

  const deleteItem = useCallback(
    async (storeId: string, itemId: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/stores/${storeId}/items/${itemId}`);
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

  return {
    loading,
    error,
    login,
    setup,
    fetchMe,
    fetchBusiness,
    updateBusiness,
    listStores,
    createStore,
    deleteStore,
    updateStore,
    listUsers,
    listOwners,
    registerEmployee,
    updateEmployee,
    deleteEmployee,
    transferEmployee,
    updateOwner,
    deleteOwner,
    createOwner,
    listItems,
    createItem,
    updateItem,
    deleteItem,
  };
};

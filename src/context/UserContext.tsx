// Global auth state for the whole app.
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthUser, UserContextValue, UserProviderProps } from "../types";

/** Storage key for the persisted session. */
export const STORAGE_KEY = "stockify:user";

/** Storage key for the cached business name shown in the navbar. */
const BUSINESS_KEY = "stockify:business";

const UserContext = createContext<UserContextValue | null>(null);

/**
 * Provides the session to the whole app and restores it from
 * localStorage on startup.
 */
export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [businessName, setBusinessNameState] = useState<string | null>(null);

  // Restore session and cached business name once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
    try {
      const cached = localStorage.getItem(BUSINESS_KEY);
      if (cached) setBusinessNameState(JSON.parse(cached) as string);
    } catch {
      localStorage.removeItem(BUSINESS_KEY);
    }
  }, []);

  const login = (newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const setBusinessName = (name: string) => {
    setBusinessNameState(name);
    localStorage.setItem(BUSINESS_KEY, JSON.stringify(name));
  };

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null && user.token !== "",
      isLoading,
      login,
      logout,
      businessName,
      setBusinessName,
    }),
    [user, isLoading, businessName],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * Reads the session from any component. Must be used under UserProvider.
 */
export const useUser = (): UserContextValue => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used under UserProvider.");
  return ctx;
};

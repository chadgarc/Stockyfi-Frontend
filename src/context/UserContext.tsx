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

const UserContext = createContext<UserContextValue | null>(null);

/**
 * Provides the session to the whole app and restores it from
 * localStorage on startup.
 */
export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
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

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null && user.token !== "",
      isLoading,
      login,
      logout,
    }),
    [user, isLoading],
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

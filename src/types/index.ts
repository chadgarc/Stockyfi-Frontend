import type { ReactNode } from "react";

// Roles
export type UserRole = "owner" | "manager" | "associate";

// Result returned by the auth layer after a login attempt.
// ok=false surfaces its message in red above the Continue button.
export type LoginResult =
  | { ok: true; token: string ; message?: string }
  | { ok: false; message: string };

// Injectable auth handler: the page never fetches, only renders the result.
export type LoginHandler = (
  email: string,
  password: string,
) => Promise<LoginResult>;

// Props for LoginPage. onLogin defaults to a stub until the api layer is wired.
export interface LoginPageProps {
  onLogin?: LoginHandler;
}

/** Logged-in user held by UserContext. Never includes password. */
export type AuthUser = {
  /** JWT sent as `Authorization: Bearer <token>`. */
  token: string;
  name: string;
  email: string;
  role: UserRole;
  storeId: string | null;
};

/** Store location from `GET /api/stores`. */
export type Store = {
  /** Mongo document id. */
  _id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
};

/** Inventory item from `/api/stores/:storeId/items`. */
export type Item = {
  /** Mongo document id. */
  _id: string;
  name: string;
  /** Barcode, unique per store (compound index). */
  upc: string;
  /** Backroom stock, always >= 0. */
  inStock: number;
  /** Shelf availability, 0 <= inShelf <= inStock. */
  inShelf: number;
  /** Optional department label. */
  department?: string;
  /** Parent store id from the URL scope. */
  storeId: string;
};

/** Value exposed by the UserContext to every consumer. */
export interface UserContextValue {
  /** Current session, or null when logged out. */
  user: AuthUser | null;
  /** True when a session exists. Drives login vs dashboard routing. */
  isAuthenticated: boolean;
  /** True while restoring the session from storage on startup. */
  isLoading: boolean;
  /** Stores a complete session (used after the 2-step login finishes). */
  login: (user: AuthUser) => void;
  /** Clears state and storage. */
  logout: () => void;
  /** Business display name for the navbar. Cached across sessions. */
  businessName: string | null;
  /** Stores the business name after fetching GET /api/info. */
  setBusinessName: (name: string) => void;
  /** The store ID currently selected by the user. */
  selectedStoreId: string | null;
  /** Sets the selected store ID. */
  setSelectedStoreId: (storeId: string | null) => void;
  /** Clears the selected store ID. */
  clearSelectedStoreId: () => void;
}

/** Props for the provider wrapper mounted once in App.tsx. */
export interface UserProviderProps {
  children: ReactNode;
}

/** Payload for POST /auth/setup (first-run owner wizard). */
export interface SetupPayload {
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  ownerName: string;
  email: string;
  password: string;
}

/** Payload for POST /api/stores (owner creates a location). */
export interface NewStorePayload {
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
}

/** Profile returned by GET /users/me (never includes password). */
export interface MeProfile {
  name: string;
  email: string;
  role: UserRole;
  storeId: string | null;
}

/** Business info from GET /api/info. Navbar only reads `name`. */
export interface BusinessInfo {
  name: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
}

/** Value returned by the hook: shared state plus fetch functions. */
export interface UseFetchDataReturn {
  /** True while any hook request is in flight. */
  loading: boolean;
  /** Last backend message, or null when clean. */
  error: string | null;
  /** POST /auth/login -> JWT token. 401 on bad credentials. */
  login: (email: string, password: string) => Promise<string>;
  /** POST /auth/setup -> JWT token. 403 when already locked. */
  setup: (payload: SetupPayload) => Promise<string>;
  /** GET /users/me -> profile. Pass a fresh token on first login. */
  fetchMe: (token?: string) => Promise<MeProfile>;
  /** GET /api/info -> business. Navbar only reads `name`. */
  fetchBusiness: () => Promise<BusinessInfo>;
  /** GET /api/stores -> all stores (owner) or own store (rest). */
  listStores: () => Promise<Store[]>;
  /** POST /api/stores -> 201 {message} (no store body). Re-fetch after. */
  createStore: (payload: NewStorePayload) => Promise<void>;
  /** DELETE /api/stores/:storeId -> 200 (cascade). Re-fetch after. */
  deleteStore: (storeId: string) => Promise<void>;
  /** PUT /api/stores/:storeId -> 200 {message} (owner only). Re-fetch after. */
  updateStore: (storeId: string, payload: NewStorePayload) => Promise<void>;
  /** GET /api/stores/:storeId/users -> staff of one store. */
  listUsers: (storeId: string) => Promise<StaffUser[]>;
  /** GET /api/users (owner) filtered to role owner. */
  listOwners: () => Promise<StaffUser[]>;
  /** POST /api/auth/register -> 201 {message}. Re-fetch after. */
  registerEmployee: (payload: RegisterEmployeePayload) => Promise<void>;
  /** PUT .../users/:userId -> updated staff member. */
  updateEmployee: (
    storeId: string,
    userId: string,
    payload: UpdateEmployeePayload,
  ) => Promise<void>;
  /** DELETE .../users/:userId -> 200. Re-fetch after. */
  deleteEmployee: (storeId: string, userId: string) => Promise<void>;
  /** PUT .../users/:userId {storeId} -> move (owner only). Re-fetch after. */
  transferEmployee: (userId: string, targetStoreId: string) => Promise<void>;
  /** PUT /api/users/owners/:userId -> update an owner (owner only). */
  updateOwner: (userId: string, payload: UpdateEmployeePayload) => Promise<void>;
  /** DELETE /api/users/owners/:userId -> remove an owner (owner only). */
  deleteOwner: (userId: string) => Promise<void>;
  /** POST /api/users/owners -> create an owner (owner only, role assumed). */
  createOwner: (payload: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
}

/** Props for role-based access. */
export interface RoleRouteProps {
  /** Roles allowed to see the nested routes. */
  allowed: UserRole[];
  /** Where to send denied roles. Defaults to their landing page. */
  fallback?: string;
}

/** Props for the reusable store card used by the owner's dashboard. */
export interface CardProps {
  store: Store;
  onSelect?: (storeId: string) => void;
  /** Called when the Delete button is pressed (opens confirm modal). */
  onDelete?: (store: Store) => void;
  /** Called when the Edit button is pressed (opens edit modal). */
  onEdit?: (store: Store) => void;
}

/** Staff member listed in EmployeeManagement (never includes password). */
export interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId: string | null;
}

/** Payload for POST /api/auth/register (staff invite). */
export interface RegisterEmployeePayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  /** Omitted for managers (backend forces own store); null for global owners. */
  storeId?: string | null;
}

/** Editable fields for PUT .../users/:userId. */
export interface UpdateEmployeePayload {
  name?: string;
  email?: string;
  role?: UserRole;
  /** New password; omit or blank means "do not change". */
  password?: string;
}

/** Props for the shared employee table (used by Users + Owners pages). */
export interface EmployeeTableProps {
  employees: StaffUser[];
  loading: boolean;
  /** Shows the transfer action column (owners page hides it). */
  showTransfer: boolean;
  onEdit: (user: StaffUser) => void;
  onDelete: (user: StaffUser) => void;
  onTransfer?: (user: StaffUser) => void;
  /** Per-row gate; when false the row shows no actions. */
  canAct?: (user: StaffUser) => boolean;
}

/** Props for the back button component. */
export interface BackButtonProps {
  to?: string;
  label?: string;
  classStyle?: string;
}
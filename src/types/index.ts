// Roles
export type UserRole = "owner" | "manager" | "associate";

// Result returned by the auth layer after a login attempt.
// ok=false surfaces its message in red above the Continue button.
export type LoginResult =
  | { ok: true; token: string }
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

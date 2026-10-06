// Roles enforced by the backend (see resources/APIEndpointsRef.md).
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
export type LoginPageProps = {
  onLogin?: LoginHandler;
};

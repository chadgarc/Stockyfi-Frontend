import { useState } from "react";
import { useNavigate } from "react-router";
import type { LoginPageProps } from "../types";
import { validateLogin } from "../utils/validation";
import { useFetchData } from "../hooks/useFetchData";
import { useUser } from "../context/UserContext";
import { ApiError } from "../utils/apiError";

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const navigate = useNavigate();
  const { login: saveSession } = useUser();
  const { login: apiLogin, fetchMe } = useFetchData();

  // Form state.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Toggles the eye button.
  const [showPw, setShowPw] = useState(false);
  
  // Single error line shown in red above Continue (client or server).
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Shared client-side checks for fast UX; server is authoritative.
    const clientError = validateLogin(email, password);
    if (clientError) return setError(clientError);

    setBusy(true);
    // Default 2-step flow (JWT carries id only): login -> token,
    // fetchMe(token) -> profile, save both into UserContext.
    // A custom onLogin prop (tests) overrides this and returns LoginResult.
    try {
      if (onLogin) {
        // attempt to login the user.
        const result = await onLogin(email.trim(), password);

        if (!result.ok) {
          // Backend message when present, generic fallback that never breaks.
          setError(result.message ?? "Invalid email or password.");
          return;
        }

        // Get the profile of the logged in user.
        const me = await fetchMe(result.token);

        // Save the user into the context and local storage.
        saveSession({ token: result.token, ...me });

        // owner main page is stores and any other user is inside the store dashboard.
        navigate(me.role === "owner" ? "/stores" : `/stores/${me.storeId}`);
        return;
      }

      // if onLogin is not provided, use the default flow.
      // Login with the email and password.
      const token = await apiLogin(email.trim(), password);

      // Get the profile of the logged in user.
      const me = await fetchMe(token);

      // Save the user into the context and local storage.
      saveSession({ token, ...me });

      // owner main page is stores and any other user is inside the store dashboard.
      navigate(me.role === "owner" ? "/stores" : `/stores/${me.storeId}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Network error. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    // Transparent to the parent: App.tsx provides .dottedBackground.
    <section className="grid w-full min-h-svh place-content-center px-4 py-12">
      {/* Card container: max 400px, white, 18px radius, original border + shadow. */}
      <div className="w-full max-w-[550px] rounded-[18px] border border-[#e6e6e6] bg-white px-[clamp(22px,6vw,36px)] pb-7 pt-9 text-center text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.12)]">
        {/* Title + subtitle (no logo mark). */}
        <h1 className="mb-1.5 text-[22px] font-semibold tracking-[-0.02em]">
          Sign in to SilverMart
        </h1>
        <p className="mb-6 text-sm text-[#555]">
          Welcome back. Sign in with your email.
        </p>

        <form onSubmit={handleSubmit} noValidate className="text-left">
          {/* Email field: 42px high, 10px radius, gray border, black focus ring. */}
          <label className="mb-3.5 block">
            <span className="mb-1.5 block text-[13px] font-medium">Email</span>
            <input
              type="email"
              placeholder="you@company.com"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block h-[42px] w-full rounded-[10px] border border-[#d4d4d4] bg-white px-3 text-sm text-[#0a0a0a] placeholder:text-[#737373] focus:border-black focus:outline-none focus:ring-[3px] focus:ring-black/20"
            />
          </label>

          {/* Password field with absolute eye toggle button. */}
          <label className="mb-3.5 block">
            <span className="mb-1.5 block text-[13px] font-medium">Password</span>
            <span className="relative block">
              <input
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block h-[42px] w-full rounded-[10px] border border-[#d4d4d4] bg-white py-2 pl-3 pr-11 text-sm text-[#0a0a0a] focus:border-black focus:outline-none focus:ring-[3px] focus:ring-black/20"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                aria-pressed={showPw}
                className="absolute right-[3px] top-[3px] grid h-9 w-9 place-items-center rounded-lg text-[#555] hover:bg-[#f2f2f2] hover:text-black text-xs"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </span>
          </label>

          {/* Backend (or client) error in red, directly above Continue. */}
          {error && (
            <p role="alert" className="mb-2 text-[13px] text-[#c21d1d]">
              {error}
            </p>
          )}

          {/* Primary action: black 44px button, hover #262626. */}
          <button
            type="submit"
            disabled={busy}
            className="mt-1.5 h-11 w-full rounded-[10px] bg-[#0a0a0a] text-sm font-medium text-white hover:bg-[#262626] disabled:opacity-70"
          >
            {busy ? "Signing in…" : "Continue"}
          </button>
        </form>
      </div>
    </section>
  );
};

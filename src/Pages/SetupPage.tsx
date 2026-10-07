// src/Pages/SetupPage.tsx
// Public first-run wizard: creates the business plus the primary owner.
// No navbar and no back button: this page lives outside the Layout.
// On 201 the owner is logged in automatically (token -> profile -> /stores).
// On 403 locked (owner already exists) it redirects to /login.
import { useState } from "react";
import { useNavigate } from "react-router";
import { useFetchData } from "../hooks/useFetchData";
import { useUser } from "../context/UserContext";
import { Field } from "../components/Field";
import { BTN_PRIMARY_OUTLINE } from "../constants/ui";
import { validateEmail } from "../utils/validation";
import { ApiError, errorHandler } from "../utils/apiError";

const EMPTY = {
    businessName: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    ownerName: "",
    email: "",
    password: "",
    confirm: "",
};

export const SetupPage = () => {
    const navigate = useNavigate();
    const { setup, fetchMe } = useFetchData();
    const { login: saveSession } = useUser();
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const set =
        (key: keyof typeof EMPTY) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const validate = (): string => {
        if (!form.businessName.trim()) return "Enter the business name.";
        if (!form.street.trim()) return "Enter the street.";
        if (!form.city.trim()) return "Enter the city.";
        if (!form.state.trim()) return "Enter the state.";
        if (!form.zip.trim()) return "Enter the zip code.";
        if (!form.ownerName.trim()) return "Enter the owner name.";
        const emailErr = validateEmail(form.email);
        if (emailErr) return emailErr;
        if (form.password !== form.confirm)
        return "Passwords do not match.";
        if (form.password.length < 8)
        return "Passwords are at least 8 characters.";
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const clientError = validate();
        if (clientError) return setError(clientError);
        setError("");
        setBusy(true);
        try {
        const token = await setup({
            name: form.businessName.trim(),
            streetAddress: form.street.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            zip: form.zip.trim(),
            ownerName: form.ownerName.trim(),
            email: form.email.trim(),
            password: form.password,
        });
        const me = await fetchMe(token);
        saveSession({ token, ...me });
        navigate("/stores");
        } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
            navigate("/login");
            return;
        }
        errorHandler(err);
        setError(
            err instanceof ApiError
            ? err.message
            : "Could not complete the setup.",
        );
        } finally {
        setBusy(false);
        }
    };

    return (
        <section className="grid min-h-svh w-full place-items-center px-4 py-12">
        {/* Page-like card floating over the dotted background. */}
        <div className="card w-full max-w-[1000px] rounded-2xl bg-base-100 shadow-sm">
            <div className="card-body">
            <h1 className="card-title text-2xl">First-time Setup</h1>
            <p className="opacity-70">
                Create the business and its primary owner account
            </p>

            <form onSubmit={handleSubmit} noValidate>
                <div className="mt-4 grid max-w-[500px] gap-2">
                <Field
                    legend="Business Name"
                    placeholder="Business Name"
                    value={form.businessName}
                    onChange={set("businessName")}
                />
                <Field
                    legend="Street"
                    placeholder="123 Main St"
                    value={form.street}
                    onChange={set("street")}
                />
                <Field
                    legend="City"
                    placeholder="City"
                    value={form.city}
                    onChange={set("city")}
                />
                <Field
                    legend="State"
                    placeholder="State"
                    value={form.state}
                    onChange={set("state")}
                />
                <Field
                    legend="Zip"
                    placeholder="Zip Code"
                    value={form.zip}
                    onChange={set("zip")}
                />
                <Field
                    legend="Owner Name"
                    placeholder="Owner Name"
                    value={form.ownerName}
                    onChange={set("ownerName")}
                />
                <Field
                    legend="Email"
                    placeholder="owner@domain.com"
                    value={form.email}
                    onChange={set("email")}
                />
                <Field
                    legend="Password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set("password")}
                />
                <Field
                    legend="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={set("confirm")}
                />
                </div>

                {error && (
                <p role="alert" className="mt-2 text-sm text-error">
                    {error}
                </p>
                )}

                <div className="card-actions mt-4 justify-end">
                <button
                    type="submit"
                    className={BTN_PRIMARY_OUTLINE}
                    disabled={busy}
                >
                    {busy ? "Creating…" : "Create Business"}
                </button>
                </div>
            </form>
            </div>
        </div>
        </section>
    );
};

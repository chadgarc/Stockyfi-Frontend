// src/Pages/BusinessPage.tsx
// Owner-only business profile: flat fields preloaded from GET /api/info,
// single Save button persisting via PUT /api/info. Hidden from other roles
// by the owner-only route guard, not just by the navbar.
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useFetchData } from "../hooks/useFetchData";
import { Field } from "../components/Field";
import { BackButton } from "../components/BackButton";
import { BTN_PRIMARY_OUTLINE } from "../constants/ui";
import { ApiError } from "../utils/apiError";
import type { BusinessInfo } from "../types";

const EMPTY: BusinessInfo = {
  name: "",
  streetAddress: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
};

export const BusinessPage = () => {
  const { setBusinessName } = useUser();
  const { fetchBusiness, updateBusiness, loading } = useFetchData();
  const [form, setForm] = useState<BusinessInfo>(EMPTY);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Preload the form once on mount.
  useEffect(() => {
    fetchBusiness()
      .then((info) => {
        setForm({
          name: info.name ?? "",
          streetAddress: info.streetAddress ?? "",
          city: info.city ?? "",
          state: info.state ?? "",
          zip: info.zip ?? "",
          phone: info.phone ?? "",
        });
        if (info.name) setBusinessName(info.name);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load business."),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key: keyof BusinessInfo) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError("Enter the business name.");
    setError("");
    setSaving(true);
    try {
      await updateBusiness({
        ...form,
        name: form.name.trim(),
        phone: form.phone?.trim() || undefined,
      });
      setBusinessName(form.name.trim());
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not save the business.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <BackButton to="/stores" label="Back" classStyle="btn btn-outline" />

      {/* Page-like card floating over the dotted background. */}
      <div className="card mx-auto w-full max-w-[1000px] rounded-2xl bg-base-100 shadow-sm mt-6">
        <div className="card-body">
          <h1 className="card-title text-2xl">Business Settings</h1>
          <p className="opacity-70">Edit the global business information</p>

          {loading && !form.name ? (
            <p className="mt-4 opacity-70">Loading business…</p>
          ) : (
            <div className="mt-4 flex flex-col gap-2 max-w-[500px]">
              <Field
                legend="Business Name"
                placeholder="SilverMart HQ"
                value={form.name}
                onChange={set("name")}
              />
              <Field
                legend="Phone (optional)"
                placeholder="2145551234"
                value={form.phone ?? ""}
                onChange={set("phone")}
              />
              <Field
                legend="Street"
                placeholder="123 Main St"
                value={form.streetAddress ?? ""}
                onChange={set("streetAddress")}
              />
              <Field
                legend="City"
                placeholder="Dallas"
                value={form.city ?? ""}
                onChange={set("city")}
              />
              <Field legend="State" placeholder="TX" value={form.state ?? ""} onChange={set("state")} />
              <Field
                legend="Zip"
                placeholder="75201"
                value={form.zip ?? ""}
                onChange={set("zip")}
              />
            </div>
          )}

          {error && (
            <p role="alert" className="mt-2 text-sm text-error">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="mt-2 text-sm text-success">
              Business updated.
            </p>
          )}

          <div className="card-actions mt-4 justify-end">
            <button
              type="button"
              className={BTN_PRIMARY_OUTLINE}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

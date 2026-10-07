// src/Pages/StoresDashboard.tsx
// Owner landing: welcome hero plus the store collection rendered as Cards.
// Entering here clears the temporal store (back to global state).
// Includes the "+ New Store" modal (POST /api/stores) with per-field errors.
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useFetchData } from "../hooks/useFetchData";
import { Card } from "../components/Card";
import { Field } from "../components/Field";
import { Modal } from "../components/Modal";
import { BTN_OUTLINE, BTN_PRIMARY_OUTLINE } from "../constants/ui";
import { validateStore, type StoreFieldErrors } from "../utils/validation";
import { ApiError } from "../utils/apiError";
import type { NewStorePayload, Store } from "../types";

const EMPTY_FORM: NewStorePayload = {
  name: "",
  streetAddress: "",
  city: "",
  state: "",
  zip: "",
};

const EMPTY_ERRORS: StoreFieldErrors = {
  name: "",
  streetAddress: "",
  city: "",
  state: "",
  zip: "",
};

export const StoresDashboard = () => {
  const { user, clearSelectedStoreId } = useUser();
  const { listStores, createStore, loading } = useFetchData();
  const [stores, setStores] = useState<Store[]>([]);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewStorePayload>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] =
    useState<StoreFieldErrors>(EMPTY_ERRORS);
  const [saving, setSaving] = useState(false);

  // Reset temporal store and load the collection once on mount.
  useEffect(() => {
    clearSelectedStoreId();
    listStores()
      .then(setStores)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load stores."),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key: keyof NewStorePayload) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setFieldErrors(EMPTY_ERRORS);
  };

  const handleSave = async () => {
    const errors = validateStore(form);
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    setSaving(true);
    try {
      // Create only confirms; the list is the source of truth.
      await createStore(form);
      setStores(await listStores());
      closeModal();
    } catch (err) {
      setFieldErrors((prev) => ({
        ...prev,
        name:
          err instanceof ApiError
            ? err.message
            : "Could not create the store.",
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">

      <div className="card bg-base-100 shadow-sm max-w-[790px] mx-auto">
        <div className="card-body max-h-[40vh] items-center text-center">
          <h1 className="card-title text-2xl">Welcome {user?.name ?? ""}</h1>
          <p className="opacity-70">Please, choose a store</p>
          <div className="card-actions mt-2">
            <button
              type="button"
              className={BTN_PRIMARY_OUTLINE}
              onClick={() => setModalOpen(true)}
            >
              + New Store
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-error">
          {error}
        </p>
      )}

      {/* Store collection mapped to Cards keyed by Mongo id. */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {loading && stores.length === 0 ? (
          <p className="opacity-70">Loading stores…</p>
        ) : (
          stores.map((store) => <Card key={store._id} store={store} />)
        )}
      </div>

      <Modal id="new-store" title="New Store" open={modalOpen} onClose={closeModal}>
        <div className="mt-4 flex flex-col gap-2">
          <Field
            legend="Name"
            placeholder="Store Name"
            value={form.name}
            onChange={set("name")}
            error={fieldErrors.name}
          />
          <Field
            legend="Street"
            placeholder="123 Main St"
            value={form.streetAddress}
            onChange={set("streetAddress")}
            error={fieldErrors.streetAddress}
          />
          <Field
            legend="City"
            placeholder="City Name"
            value={form.city}
            onChange={set("city")}
            error={fieldErrors.city}
          />
          <Field
            legend="State"
            placeholder="State"
            value={form.state}
            onChange={set("state")}
            error={fieldErrors.state}
          />
          <Field
            legend="Zip"
            placeholder="Zip Code"
            value={form.zip}
            onChange={set("zip")}
            error={fieldErrors.zip}
          />
        </div>
        <div className="modal-action">
          <button type="button" className={BTN_OUTLINE} onClick={closeModal}>
            Cancel
          </button>
          <button
            type="button"
            className={BTN_PRIMARY_OUTLINE}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </Modal>
    </section>
  );
};

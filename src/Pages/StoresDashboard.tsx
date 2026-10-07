// src/Pages/StoresDashboard.tsx
// Owner landing: welcome hero plus the store collection rendered as Cards.
// Entering here clears the temporal store (back to global state).
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useFetchData } from "../hooks/useFetchData";
import { Card } from "../components/Card";
import type { Store } from "../types";

export const StoresDashboard = () => {
  const { user, clearSelectedStoreId } = useUser();
  const { listStores, loading } = useFetchData();
  const [stores, setStores] = useState<Store[]>([]);
  const [error, setError] = useState("");

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

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Welcome hero, at most 2/5 of the viewport height. */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body max-h-[40vh] items-center text-center">
          <h1 className="card-title text-2xl">
            Welcome {user?.name ?? ""}
          </h1>
          <p className="opacity-70">Please, choose a store</p>
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
    </section>
  );
};

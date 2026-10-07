// src/Pages/StoreDashboard.tsx
// Single-store hub: welcome hero plus action cards per role.
// Owner/manager see Inventory + Users; associate sees Inventory only.
import { useNavigate, useParams } from "react-router";
import { useUser } from "../context/UserContext";
import { BackButton } from "../components/BackButton";
import { BTN_PRIMARY_OUTLINE } from "../constants/ui";

export const StoreDashboard = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const role = user?.role;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">

      <BackButton to="/stores" label="Back"/>

      <div className="card bg-base-100 max-w-[790px] mx-auto shadow-sm mt-6">
        <div className="card-body max-h-[40vh] items-center text-center">
          <h1 className="card-title text-2xl">Welcome {user?.name ?? ""}</h1>
          <p className="opacity-70">What do you want to do?</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <div className="card bg-base-100 w-96 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">Inventory</h2>
            <p>Manage stock and shelf counts.</p>
            <div className="card-actions justify-end">
              <button
                type="button"
                className={BTN_PRIMARY_OUTLINE}
                onClick={() => navigate(`/stores/${storeId}/inventory`)}
              >
                Open
              </button>
            </div>
          </div>
        </div>

        {(role === "owner" || role === "manager") && (
          <div className="card bg-base-100 w-96 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Users</h2>
              <p>Manage staff of this store.</p>
              <div className="card-actions justify-end">
                <button
                  type="button"
                  className={BTN_PRIMARY_OUTLINE}
                  onClick={() => navigate(`/stores/${storeId}/users`)}
                >
                  Open
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

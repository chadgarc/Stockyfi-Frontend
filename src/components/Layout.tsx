// src/components/Layout.tsx
// Persistent shell for authenticated pages: navbar on top + nested route.
// Login/setup render outside this layout so they show no navbar.
import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useUser } from "../context/UserContext";
import { useFetchData } from "../hooks/useFetchData";

/**
 * Navbar matrix: owner sees Stores + Business (no store of their own),
 * manager sees Users + Inventory of their store, associate sees
 * Inventory only. The brand shows the business name fetched from
 * GET /api/info, falling back to "SilverMart".
 */
export const Layout = () => {
  const { user, businessName, setBusinessName, logout } = useUser();
  const { fetchBusiness } = useFetchData();
  const navigate = useNavigate();

  const role = user?.role;
  const storeId = user?.storeId ?? undefined;

  // Refresh the business name once per session. Non-owners may get
  // 403 until the backend opens GET /api/info (see notes.md);
  // the cached name stays in that case.
  useEffect(() => {
    if (!user) return;
    if (businessName) return;
    fetchBusiness()
      .then((info) => setBusinessName(info.name))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-svh">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl">
            {businessName ?? "SilverMart"}
          </NavLink>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            {role === "owner" && (
              <li>
                <NavLink to="/stores">Stores</NavLink>
              </li>
            )}
            {role === "owner" && (
              <li>
                <NavLink to="/business">Business</NavLink>
              </li>
            )}
            {role === "manager" && storeId && (
              <li>
                <NavLink to={`/stores/${storeId}/users`}>Users</NavLink>
              </li>
            )}
            {role === "manager" && storeId && (
              <li>
                <NavLink to={`/stores/${storeId}/inventory`}>
                  Inventory
                </NavLink>
              </li>
            )}
            {role === "associate" && storeId && (
              <li>
                <NavLink to={`/stores/${storeId}/inventory`}>
                  Inventory
                </NavLink>
              </li>
            )}
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

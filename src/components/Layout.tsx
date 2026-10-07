// src/components/Layout.tsx
// Persistent shell for authenticated pages: navbar on top + nested route.
// Login/setup render outside this layout so they show no navbar.
// Below the sm breakpoint the links collapse into a hamburger dropdown.
import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useUser } from "../context/UserContext";
import { useFetchData } from "../hooks/useFetchData";

/**
 * Navbar matrix: owner sees Stores + Business + Owners (plus Users and
 * Inventory of the temporal store when inside one), manager sees Users +
 * Inventory of their store, associate sees Inventory only. The brand shows
 * the business name fetched from GET /api/info, falling back to "SilverMart".
 */
export const Layout = () => {
  const { user, businessName, setBusinessName, logout, selectedStoreId } =
    useUser();
  const { fetchBusiness } = useFetchData();
  const navigate = useNavigate();

  const role = user?.role;
  const storeId = user?.storeId ?? undefined;
  const ownerStoreId = selectedStoreId ?? undefined;

  // Refresh the business name once per session. Non-owners may get
  // 403 until the backend opens GET /api/info; the cached name stays then.
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

  // Shared link set rendered in both the desktop row and the mobile menu.
  const links = (
    <>
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
      {role === "owner" && (
        <li>
          <NavLink to="/owners">Owners</NavLink>
        </li>
      )}
      {role === "owner" && ownerStoreId && (
        <li>
          <NavLink to={`/stores/${ownerStoreId}/users`}>Users</NavLink>
        </li>
      )}
      {role === "owner" && ownerStoreId && (
        <li>
          <NavLink to={`/stores/${ownerStoreId}/inventory`}>
            Inventory
          </NavLink>
        </li>
      )}
      {role === "manager" && storeId && (
        <li>
          <NavLink to={`/stores/${storeId}/users`}>Users</NavLink>
        </li>
      )}
      {role === "manager" && storeId && (
        <li>
          <NavLink to={`/stores/${storeId}/inventory`}>Inventory</NavLink>
        </li>
      )}
      {role === "associate" && storeId && (
        <li>
          <NavLink to={`/stores/${storeId}/inventory`}>Inventory</NavLink>
        </li>
      )}
      <li>
        <button onClick={handleLogout}>Logout</button>
      </li>
    </>
  );

  return (
    <div className="min-h-svh">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl">
            {businessName ?? "SilverMart"}
          </NavLink>
        </div>
        <div className="flex-none">
          {/* Desktop row, hidden below sm. */}
          <ul className="menu menu-horizontal hidden px-1 sm:flex">{links}</ul>
          {/* Hamburger dropdown, mobile only. */}
          <div className="dropdown dropdown-end sm:hidden">
            <button
              type="button"
              tabIndex={0}
              className="btn btn-ghost"
              aria-label="Open menu"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <ul
              tabIndex={0}
              className="menu dropdown-content bg-base-200 rounded-box w-56 mt-2 shadow"
            >
              {links}
            </ul>
          </div>
        </div>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

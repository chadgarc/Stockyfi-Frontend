// Route guards for auth, roles, and store jurisdiction.
import { Navigate, Outlet, useParams } from "react-router";
import { useUser } from "../context/UserContext";
import type { RoleRouteProps } from "../types";

/** Blocks logged-out users. Shows a loader while session restores. */
export const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useUser();
  if (isLoading) return <p className="p-8 text-center">Loading…</p>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

/** Blocks roles outside the allowed list. */
/** This is a custom guard for role-based access that works like React Router's RoleRoute component */
export const RoleRoute = ({ allowed, fallback }: RoleRouteProps) => {
  const { user, isLoading } = useUser();
  if (isLoading) return <p className="p-8 text-center">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.role)) {
    return (
      <Navigate
        to={
          fallback ??
          (user.role === "owner" ? "/stores" : `/stores/${user.storeId}`)
        }
        replace
      />
    );
  }
  return <Outlet />;
};

/**
 * Blocks cross-store access. Owners bypass; managers/associates must
 * match params.storeId with their own storeId.
 */
export const JurisdictionGuard = () => {
  const { user, isLoading } = useUser();
  const { storeId } = useParams<{ storeId: string }>();
  if (isLoading) return <p className="p-8 text-center">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "owner" && user.storeId !== storeId) {
    return <Navigate to={`/stores/${user.storeId}`} replace />;
  }
  return <Outlet />;
};

/**
 * Landing redirect for "/": sends each role to its home.
 * Owner -> /stores, manager -> own hub, associate -> own inventory.
 */
export const RoleLanding = () => {
  const { user, isAuthenticated, isLoading } = useUser();
  if (isLoading) return <p className="p-8 text-center">Loading…</p>;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role === "owner") return <Navigate to="/stores" replace />;
  if (user.role === "manager")
    return <Navigate to={`/stores/${user.storeId}`} replace />;
  return <Navigate to={`/stores/${user.storeId}/inventory`} replace />;
};

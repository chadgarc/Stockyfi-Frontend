# AGENT.md — Stockify Local Frontend Specialist

## 1. Objective
Build a responsive Single Page Application (SPA) for Stockify Local: closed inventory + workforce management, multi-store, with strict Role-Based Access Control (RBAC) and jurisdictional logic. No purchasing or sales modules. Applies to a retail store or warehouse. UI must dynamically adapt to Owner, Manager, and Associate permissions.

## 2. Stack & Global Architecture
- **Framework:** React + Vite, `react-router` (`HashRouter`; build output goes to `docs/` via `pnpm build`).
- **Styling:** Tailwind CSS + DaisyUI (toasts for errors). Global `.dottedBackground` in `src/index.css` (dotted-grid backdrop applied once on the `App.tsx` root wrapper, `min-h-svh` so it grows with tall content). Tables use `max-h-[55vh]` + internal scroll with sticky `thead` so search bars stay visible (transfer modal table: `max-h-[40vh]`).
- **State Management:** React Context API (`UserContext` + `UserProvider` in `src/context/UserContext.tsx`) storing `{ token, name, email, role, storeId }` in `localStorage`, plus `businessName` and `selectedStoreId` (owner's temporal store). Never store password. Owner has `storeId=null`. NOTE: JWT payload is `{ id }` only (see `Stockify-Backend/middleware/auth.js`), so role/storeId are never decoded — populate context via `GET /api/users/me` after login.
- **Auth storage note:** JWT is kept in `localStorage` so it survives refresh and Axios can attach it as `Bearer`. This is XSS-readable by design, so it is not suited for high-security production (which would use `httpOnly` refresh cookies). It is sufficient here because the payload carries `{ id }` only, expires in ~2h, is never logged or put in URLs, is read only by the Axios interceptor, and is cleared on `logout`/401.
- **API Client:** Axios (`src/api/client.ts`) with `VITE_API_URL` as baseURL (fallback to deploy URL in `resources/APIEndpointsRef.md`). Interceptors: automatically attach `Authorization: Bearer <token>` header; on 401 redirect to `/login`; on 403 display DaisyUI toast.
- **Data Layer:** `src/hooks/useFetchData.ts` (loading/error state + categorized fetch functions per `resources/APIEndpointsRef.md`: auth, stores, items, users, business). Errors via `ApiError` + central `errorHandler` in `src/utils/apiError.ts`.
- **Conventions:** `src/types/index.ts` holds shared data shapes as `type` (`UserRole`, `LoginResult`, `AuthUser`, `Store`, `Item`); component contracts as `interface` (`LoginPageProps`, etc.). Reusable field checks live in `src/utils/validation.ts` (login, register, profile update).
- **Backend Contract:** See `../Stockify-Backend/AGENT.md`. Models: `Business{businessName,street,city,state,zipcode}`, `User{name,email,password(hashed),role:owner|manager|associate,storeId:null if owner else Store ref}`, `Store{name,street,city,state,zipcode}`, `Item{name,department?,inStock>=0,inShelf 0<=x<=inStock,storeId}`. NOTE: `PUT .../items/:itemId` requires the full payload (`name,upc,inStock,inShelf,department`) even for associates — partial `{inShelf}` payloads get 400.

## 3. Auth / First-Run
- `/setup` (First-Run): Form fields `businessName, street, city, state, zipcode, ownerName, email, password`. On submit map to `POST /api/auth/setup-owner` payload: `{businessName, businessAddress:{street,city,state,zipcode}, ownerName, email, password}`. Creates Business + owner with `storeId=null`. If backend returns 403 locked (owner already exists), redirect to `/login`.
- `/login`: Form `email, password` mapping to `POST /api/auth/login` via the injected `LoginHandler` (`src/api` layer). Two-step flow (JWT carries `{ id }` only): 1) `POST /login` → `{ token }`, 2) `GET /api/users/me` with token → `{ name, email, role, storeId }` into `UserContext`. Redirect by role:
  - `owner` → `/stores`
  - `manager` → `/stores/:storeId` (own `storeId` from token)
  - `associate` → `/stores/:storeId/inventory` (own `storeId` from token)
- Guards: `PrivateRoute` (requires token), `RoleRoute` (requires allowed roles), `JurisdictionGuard` (owner bypass, otherwise `params.storeId === user.storeId`, else 403 toast + redirect).

## 4. Routing & Views

### A. Stores List — Owner Dashboard (`/stores`, Owner only)
- **Purpose:** Main landing for Owner. Owner must always pick a store first before managing staff or inventory.
- **Data:** `GET /api/stores` (owner gets all).
- **UI:** Grid of clickable cards. Each card displays `{name} - {street}, {city}` concatenated, linked internally to `storeId`. Click navigates to `/stores/:storeId`.
- **Create:** `+ New Store` button opens modal. Form `name, street, city, state, zipcode` → `POST /api/stores`.

### B. Store Hub (`/stores/:storeId`, Owner + Manager of that store + Associate redirect)
- **Purpose:** Main dashboard for Manager. Secondary view for Owner after selecting a card. Associates skip this and go directly to inventory.
- **UI:** Store header (name, address) + two large navigation buttons/cards: `Users` → `.../users`, `Inventory` → `.../inventory`.
- **Access:** `JurisdictionGuard` enforced.

### C. Staff Management (`/stores/:storeId/users`, Owner & Manager only; `UsersPage` + shared `EmployeeTable`)
- **Table Columns:** `Name` (+ email), `Role`, `Actions`. The `Actions` column is hidden entirely when the row set has no permitted actions.
- **List:** `GET /api/stores/:storeId/users`, scoped to current `storeId`. Managers never see owner accounts (filtered client-side; backend also blocks).
- **Add Employee Modal (uses register endpoint):** On submit → `POST /api/auth/register`. Show backend validation errors in modal, success closes modal + refreshes table. Role dropdown restricted to (`manager|associate`); owner accounts are managed separately in `/owners` (`OwnersPage`, reuses `EmployeeTable`, no transfer column).
- **Actions:** `Edit` (name/email/role + optional password change), `Delete`, and `Transfer` (owner-only: pick destination store, then confirm). Manager `canAct` guard: cannot act on `owner`/`manager` accounts. Associate role never sees this view.

### D. Inventory Management (`/stores/:storeId/inventory`, All roles with jurisdiction)
- **Data:** `GET /api/stores/:storeId/items`.
- **Table Columns:** `Name`, `UPC`, `Department`, `inShelf` (Display), `inStock` (Warehouse), `Actions` (`Actions` hidden for associates).
- **Owner/Manager:** Show `Add Product` button → `POST /api/stores/:storeId/items`. Rows have full `Edit` (→ `PUT /api/stores/:storeId/items/:itemId` full body) and `Delete` (→ `DELETE /api/stores/:storeId/items/:itemId`) buttons.
- **Associate:** Hide `Add Product`, `Delete`, `Edit`, and the `Actions` column. Each `inShelf`/`inStock` cell is a `CountEditor` (DaisyUI `join`: text input + save, Enter also saves). On save send `PUT /api/stores/:storeId/items/:itemId` with the FULL item payload (`name,upc,inStock,inShelf,department` — stored values resent unchanged) because the backend 400s partial payloads; the associate guard only forbids changing `name`/`upc`/`department`.
- **Validation:** `type="text"` inputs accept whole numbers only (`/^\d+$/`); anything else → `window.alert` + revert, no request. Out-of-range values are clamped (`inShelf > inStock` saves as `inStock`, negatives as `0`); lowering `inStock` below `inShelf` trims the shelf. Shared rules live in `validateItemCounts`/`validateItemForm`.

### E. Business Settings (`/business`, Owner only)
- **Data:** Populated by `GET /api/business`. Form flat fields: `businessName, street, city, state, zipcode`. Save via `PUT /api/business`.
- **Note:** Field shape differs from setup form (setup uses nested `businessAddress`). Map correctly in each view.

## 5. Navbar (Top, Dynamic)
- **Owner:** `Stores | Business | Owners | Users* | Inventory* | Logout` (*Users/Inventory links only contextual inside `/stores/:storeId`, owner always picks a store first).
- **Manager:** `Users | Inventory | Logout` — links scoped to own `storeId` (e.g. `/stores/<ownId>/users`). Landing is Store Hub.
- **Associate:** `Inventory | Logout` — single link to own `/stores/<ownId>/inventory`.
- Hide links entirely (not just disable) when role lacks access. Mirror with route guards.

## 6. Error Handling
- Central Axios interceptor: 401 → clear token, redirect `/login`; 403 → DaisyUI toast `Forbidden: insufficient permissions`; 400/404/422 → toast with backend JSON message; network error → generic toast.

## 7. Frontend Checklist (To-Do)
- [ ] Initialize React/Vite project, install Tailwind CSS, DaisyUI, `react-router`, Axios.
- [ ] Implement `UserContext` + `UserProvider` to store and provide `{ token, name, email, role, storeId }` globally (+ `businessName`, `selectedStoreId`) + `PrivateRoute`, `RoleRoute`, `JurisdictionGuard`.
- [ ] Implement Axios client (`src/api/client.ts`) + `ApiError`/`errorHandler` (`src/utils/apiError.ts`) + categorized `useFetchData` hook (`src/hooks/useFetchData.ts`) per `resources/APIEndpointsRef.md`.
- [ ] Build First-Run Setup form (`/setup`) matching exact nested `businessAddress` payload + 403-locked redirect.
- [ ] Build Login view (`/login`) with role-based post-login redirects.
- [ ] Build Dynamic Navbar (Owner: all; Manager: Users+Inventory; Associate: Inventory only).
- [ ] Build Stores list view (`/stores`, Owner only) with clickable cards `{name} - {street}, {city}` + Create Store modal.
- [ ] Build Store Hub view (`/stores/:storeId`) with Personal/Inventory navigation.
- [ ] Build Staff Management view (`/stores/:storeId/users`) with Add/Edit/Delete/Transfer modals (register endpoint) and Manager `canAct` restrictions.
- [ ] Build Inventory view (`/stores/:storeId/inventory`) with strict UI restrictions for `associate` (`CountEditor` for `inShelf`/`inStock`, full-payload PUT, `Actions` hidden).
- [ ] Build Business Settings view (`/business`, Owner only, flat fields).
- [ ] Integrate all API calls with central error handler (DaisyUI toasts for 401/403).

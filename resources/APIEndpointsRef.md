# 🏪 Stockify Local — Backend Endpoints Reference

Quick reference for frontend development. No setup instructions — endpoints only.

[🔗 Backend Repo](https://github.com/chadgarc/Stockyfi-Backend) | [🔗 Deployed API](https://stockyfi-backend.onrender.com/)

| Base URL (Deploy)                           | Auth                          | Format             |
| :------------------------------------------ | :---------------------------- | :----------------- |
| `https://stockyfi-backend.onrender.com/api` | `Authorization: Bearer <JWT>` | `application/json` |

## 👑 Role & Permissions Matrix

| Action                             |   Owner 👑   |                Manager 🧑‍💼                | Associate 🙋 |
| :--------------------------------- | :----------: | :--------------------------------------: | :----------: |
| First-time setup                   |      ✅      |                    ❌                    |      ❌      |
| Create / Delete stores             |      ✅      |                    ❌                    |      ❌      |
| View stores                        |     All      |                 Own only                 |   Own only   |
| View inventory                     |      ✅      |                    ✅                    |      ✅      |
| Create / Delete items              |      ✅      |                    ✅                    |      ❌      |
| Edit `name` / `upc` / `department` |      ✅      |                    ✅                    |      ❌      |
| Update `inStock` / `inShelf`       |      ✅      |                    ✅                    |      ✅      |
| Register staff                     | ✅ any store | ✅ own store, `manager`/`associate` only |      ❌      |
| Edit business info                 |      ✅      |                    ❌                    |      ❌      |

## 📡 API Reference

### 🔐 1. Authentication

<details>
<summary><b><code>POST</code> /api/auth/setup — First-run setup (public, locks after first use)</b></summary>

Creates the Business + primary Owner. Call only once.

```json
{
  "name": "SilverMart HQ",
  "streetAddress": "123 Main St",
  "city": "Dallas",
  "state": "TX",
  "zip": "75201",
  "ownerName": "Chad Owner",
  "email": "owner@silvermart.com",
  "password": "Password123"
}
```

- `201` → `{ "token": "<JWT>" }`
- `403` → setup already completed (locked), go to login.

</details>

<details>
<summary><b><code>POST</code> /api/auth/login — Login (public)</b></summary>

```json
{ "email": "owner@silvermart.com", "password": "Password123" }
```

- `200` → `{ "token": "<JWT>" }`
- `401` → invalid credentials.

</details>

<details>
<summary><b><code>POST</code> /api/auth/register — Register staff (auth required)</b></summary>

Owners can create any role in any store. Managers can create `manager`/`associate` in their own store only (backend forces `storeId` from token).

```json
{
  "name": "Marta Manager",
  "email": "marta@silvermart.com",
  "password": "Password123",
  "role": "manager",
  "storeId": "<STORE_ID>"
}
```

- `201` → user created.
- `403` → wrong role or outside own store.

</details>

---

### 🏬 2. Stores

<details>
<summary><b><code>POST</code> /api/stores — Create store (Owner only)</b></summary>

```json
{
  "name": "SilverMart Neighbourhood",
  "streetAddress": "789 Pine St",
  "city": "Fort Worth",
  "state": "TX",
  "zip": "76101"
}
```

- `201` → created.

</details>

<details>
<summary><b><code>GET</code> /api/stores — List stores (auth required)</b></summary>

- Owner → all stores. Manager / Associate → only assigned store.
- `200` → store array.

</details>

<details>
<summary><b><code>DELETE</code> /api/stores/:storeId — Delete store (Owner only, cascade)</b></summary>

> [!WARNING]
> Deletes the store plus all its items and staff.

- `200` → deleted.

</details>

---

### 📦 3. Items & Inventory

> `storeId` always goes in the URL (`/api/stores/:storeId/items`), never in the body.

<details>
<summary><b><code>POST</code> /api/stores/:storeId/items — Create item (Owner | Manager)</b></summary>

```json
{
  "name": "Coca 600ml",
  "upc": "123456789012",
  "inStock": 100,
  "inShelf": 20,
  "department": "drinks"
}
```

- `201` → created. Associates get `403`.

</details>

<details>
<summary><b><code>GET</code> /api/stores/:storeId/items — List items</b></summary>

- `GET /api/stores/:storeId/items` → full list.
- `GET /api/stores/:storeId/items?upc=123456789012` → lookup by barcode (UPC is unique per store).
- `200` → item(s).

</details>

<details>
<summary><b><code>GET</code> /api/stores/:storeId/items/:itemId — Get one item</b></summary>

- `200` → item. `404` → item not in this store.

</details>

<details>
<summary><b><code>PUT</code> /api/stores/:storeId/items/:itemId — Update item</b></summary>

- Owner / Manager: full edit (`name`, `upc`, `inStock`, `inShelf`, `department`).
- Associate: counts only (`inStock`, `inShelf`).

```json
{
  "name": "Coca 600ml",
  "upc": "123456789012",
  "inStock": 90,
  "inShelf": 30,
  "department": "drinks"
}
```

- `200` → updated.

</details>

<details>
<summary><b><code>DELETE</code> /api/stores/:storeId/items — Delete items (Owner | Manager)</b></summary>

- By id: `DELETE /api/stores/:storeId/items/:itemId`
- By UPC: `DELETE /api/stores/:storeId/items?upc=123456789012`
- Clear all: `DELETE /api/stores/:storeId/items?all=true`
- `200` → deleted.

</details>

---

### 🏢 4. Business Info (Owner only)

<details>
<summary><b><code>GET</code> /api/info — Get business details</b></summary>

- `200` → `{ "name": "...", "streetAddress": "...", "city": "...", "state": "...", "zip": "...", "phone": "..." }`

</details>

<details>
<summary><b><code>PUT</code> /api/info — Update business</b></summary>

```json
{
  "name": "SilverMart HQ",
  "streetAddress": "123 Main St",
  "city": "Dallas",
  "state": "TX",
  "zip": "75201",
  "phone": "2145551234"
}
```

- `200` → updated. `phone` optional, 10 digits.

</details>

---

### 👥 5. Users & Staff

<details>
<summary><b><code>GET</code> /api/users/me — Current profile</b></summary>

- `200` → `{ "name": "...", "email": "...", "role": "...", "storeId": "..." }` (no password).

</details>

<details>
<summary><b><code>PUT</code> /api/users/me — Update own profile</b></summary>

`role` and `storeId` are ignored here.

```json
{
  "name": "New Name",
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

- `200` → updated.

</details>

<details>
<summary><b><code>GET | PUT | DELETE</code> /api/stores/:storeId/users[/:userId] — Manage store staff</b></summary>

Owners and Managers manage workers of one store. Managers cannot touch Owner accounts.

</details>

<details>
<summary><b><code>POST | PUT | DELETE</code> /api/users/owners[/:id] — Owner admin (Owner only)</b></summary>

Manage Owner accounts. Safeguard: cannot delete the last Owner.

</details>

---

## 🧭 Status Codes

| Code  | Meaning      | When                                       |
| :---: | :----------- | :----------------------------------------- |
| `200` | OK           | Request worked.                            |
| `201` | Created      | User, store, or item created.              |
| `400` | Bad Request  | Missing fields or bad JSON.                |
| `401` | Unauthorized | Missing / invalid / expired JWT. Re-login. |
| `403` | Forbidden    | Wrong role or outside assigned store.      |
| `404` | Not Found    | Bad id, wrong store scope, or bad route.   |
| `500` | Server error | Unhandled backend exception.               |

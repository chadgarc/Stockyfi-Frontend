<div align="center">

# 🛍️ Stockify

### _Multi-Store Inventory & Workforce Management System_

<p align="center">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite 8" />
  <img src="https://img.shields.io/badge/TypeScript_6-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/DaisyUI_5-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white" alt="DaisyUI" />
</p>

Frontend client for **Stockify**, a full-featured retail & warehouse inventory suite featuring multi-store scoping, workforce management, and strict role-based jurisdictional security.

<br/>

[![Backend Repo](https://img.shields.io/badge/🔗_Backend_Repository-gray?style=flat-square&logo=github)](https://github.com/chadgarc/Stockyfi-Backend)
&nbsp;&nbsp;
[![Usage Guide](https://img.shields.io/badge/📖_Usage_&_Visual_Guide-blue?style=flat-square&logo=gitbook)](./USAGE_GUIDE.md)
<br/>

[![Render Deployment](https://img.shields.io/badge/Render_Deployment-blue?style=flat-square&logo=render)](https://stockyfi-frontend.onrender.com)

[![GitHub Deployment](https://img.shields.io/badge/GitHub_Deployment-blue?style=flat-square&logo=github)](https://chadgarc.github.io/Stockyfi-Frontend)

</div>

---

## 🌟 Overview

**Stockify** is an enterprise-ready management platform engineered around **stores, inventory, and staff**. Built to bridge retail and warehousing workflows, its data structure flexibly handles shelf vs. backroom stock (or pick faces vs. bulk storage).

> 💡 **Real-World Inspiration:** Designed based on direct hands-on experience in high-volume retail and logistics environments (Kroger, Sam's Club, Amazon), prioritizing strict jurisdictional boundaries for personnel and stock movement.

It follows a **zero-configuration initialization pattern**: starting from an uninitialized state, a guided **first-run setup wizard** provisions the business entity and root owner profile before unlocking the dashboard. I took inspiration from Docker's from my own experience doing my homelab.

---

## 🚀 First-Run Setup (`/setup`)

In the future, the application will detect an unconfigured state and expose the **First-time setup** workflow, for now it will have a button at the login page, but it will only work if there are no data on mongodb. to create an instance you can use the following:

```bash
📦 Business Entity   ➜   name, streetAddress, city, state, zip
👤 Owner Account     ➜   ownerName, email, password (min 8 chars)
```

1. **Submission**: Dispatches `POST /auth/setup` to generate the primary schema and issue a signed JWT session.
2. **Security Lock**: Once initialized, any subsequent setup attempts return `403 Forbidden` and auto-route to `/login`.

---

## 🔐 Role-Based Access Control (RBAC)

Stockify enforces multi-layered permission boundaries via `PrivateRoute`, `RoleRoute`, and `JurisdictionGuard`.

| Feature & View                       |        👑 Owner         |            🛡️ Manager            |         👷 Associate         |
| :----------------------------------- | :---------------------: | :------------------------------: | :--------------------------: |
| **Store Management** (`/stores`)     |     ✅ _Full CRUD_      |                ❌                |              ❌              |
| **Store Hub** (`/stores/:storeId`)   |     ✅ _All Stores_     |     🔹 _Assigned Store Only_     |   🔹 _Assigned Store Only_   |
| **Staff & Users** (`…/users`)        |  ✅ _Full + Transfer_   | 🔹 _Own Store (Associates Only)_ |              ❌              |
| **Owner Administration** (`/owners`) |     ✅ _Full CRUD_      |                ❌                |              ❌              |
| **Inventory Grid** (`…/inventory`)   | ✅ _Full CRUD + Search_ |     ✅ _Full CRUD + Search_      | ✏️ _Inline Count Edits Only_ |
| **Business Details** (`/business`)   |    ✅ _Full Access_     |                ❌                |              ❌              |

### 🛡️ Guard & Validation Highlights

- **Associate Mode:** Fast inline numeric editors for `inShelf` and `inStock`. Validations auto-clamp invalid numbers (e.g. `inShelf > inStock` automatically clamps to `inStock`). Action buttons remain protected.
- **Jurisdictional Firewall:** Non-owner staff attempting to access unauthorized `storeId` routes are immediately blocked by `JurisdictionGuard`.

---

## 🛠️ Tech Stack & Architecture

| Layer / Library  | Version  | Role in Project                                                      |
| :--------------- | :------: | :------------------------------------------------------------------- |
| **React**        |   `19`   | Modern declarative UI component tree & hooks                         |
| **Vite**         |   `8`    | Blazing-fast HMR dev server & optimized bundle compiler              |
| **TypeScript**   |   `6`    | Strict end-to-end data contracts and type safety                     |
| **Tailwind CSS** |   `4`    | Utility-first responsive design system                               |
| **DaisyUI**      |   `5`    | Semantic UI toolkit (Modals, Dropdowns, Tables, Badges)              |
| **React Router** |   `8`    | `HashRouter` with nested routing and declarative route guards        |
| **Axios**        |   `1`    | HTTP client with automatic auth token inject & response interceptors |
| **pnpm**         | `latest` | Fast, deterministic package management                               |

---

## 🔌 API & Backend Integration

The frontend connects dynamically through `VITE_API_URL`, falling back gracefully to live deployments:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

- **JWT Session Injection:** Interceptor attaches `Authorization: Bearer <token>` automatically to outgoing calls.
- **Interceptors:** Centralized error handling handles `401 Unauthorized` (triggers logout + redirect) and `403 Forbidden` (in-app notifications).
- **Endpoint Registry:** Consumes `/auth`, `/stores`, `/stores/:storeId/items`, `/stores/:storeId/users`, `/users/owners`, and `/info`.

---

## 📂 Directory Layout

```bash
src/
├── api/          # Axios instance, base configuration & interceptors
├── components/   # Layouts, Modals, Cards, Tables, Guards & UI atomic units
├── constants/    # Theme tokens, shared classes & static config
├── context/      # UserContext (global auth session, business & active store)
├── hooks/        # Custom hooks (useFetchData for reactive querying)
├── Pages/        # Route views: Login, Setup, Stores, Inventory, Users, etc.
├── types/        # TypeScript interfaces & API payload schemas
└── utils/        # Sanitization, numeric validation & error helpers
```

---

## ⚡ Quickstart & Installation

```bash
# 1. Clone the repository
git clone https://github.com/chadgarc/Stockyfi-Frontend.git
cd Stockify-Frontend

# 2. Install dependencies
pnpm install

# 3. Launch development server
pnpm dev

# 4. Build for production
pnpm build
```

---

## 🎓 Capstone Project Context

Developed as my **Per Scholas Capstone Project**, demonstrating full-stack engineering proficiency across the MERN stack:

- **Architecture:** Robust state management with React `Context`, coupled with scalable backend services on MongoDB & Node.js/Express.
- **UI/UX Polish:** Designed a cohesive interface leveraging **DaisyUI 5** and **Tailwind CSS 4**.
- **Challenges Overcome:** Transitioned from native `fetch` to full **Axios interceptors** for resilient token lifecycle and global error capturing.
- **Exceeding Requirements:** Built features far past the basic brief, adding multi-store transfers, owner management, dynamic jurisdiction protection, and a Docker-inspired setup wizard.

---

## 🗺️ Roadmap

- [ ] Department and category filtering splits
- [ ] Multi-tier jurisdictional roles (Regional Directors / Area Leads)
- [ ] Barcode scanning support via camera/handheld scanners
- [ ] Real-time inventory sync via WebSockets

---

<div align="center">
  <sub>Built with ❤️ by <strong>Christian Garlen</strong> for the Per Scholas Capstone.</sub>
</div>

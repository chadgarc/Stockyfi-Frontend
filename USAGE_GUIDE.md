<div align="center">

# 📖 Stockify — Visual & Usage Guide
### *Complete Step-by-Step System Walkthrough & Feature Reference*

<br/>

[![Back to README](https://img.shields.io/badge/⬅️_Back_to_README-gray?style=flat-square&logo=readme)](./README.md)
&nbsp;&nbsp;
[![Backend Repo](https://img.shields.io/badge/🔗_Backend_Repository-gray?style=flat-square&logo=github)](https://github.com/chadgarc/Stockyfi-Backend)
&nbsp;&nbsp;
[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-blue?style=flat-square&logo=render)](https://stockyfi-frontend.onrender.com)

<br/>

</div>

---

## 📑 Table of Contents

- [1. 🚀 First-Run Setup](#1--first-run-setup)
- [2. 🔑 Authentication & Landing](#2--authentication--landing)
- [3. 🧭 Adaptive Navbar System](#3--adaptive-navbar-system)
- [4. 👑 Owner Journey & Global Administration](#4--owner-journey--global-administration)
  - [4.1 Multi-Store Hub & Creation](#41-stores-stores)
  - [4.2 Store Management Hub](#42-store-hub-storesstoreid)
  - [4.3 Staff & Cross-Store Transfers](#43-users--staff-storesstoreidusers)
  - [4.4 Full Inventory & Search](#44-inventory-storesstoreidinventory)
  - [4.5 Root Owner Administration](#45-owners-owners)
  - [4.6 Business Entity Settings](#46-business-profile-business)
- [5. 🛡️ Manager Journey (Store Scoped)](#5-️-manager-journey)
- [6. 👷 Associate Journey (Floor & Inventory)](#6--associate-journey)

---

## 1. 🚀 First-Run Setup

On a brand-new or unconfigured database, Stockify provides a streamlined **First-Time Setup** wizard (`/setup`) accessible straight from the login screen:

<div align="center">

![Setup screen](./resources/setup_screen.png)

</div>

> [!NOTE]
> **Provisioning Payload**:
> - **📦 Business Profile**: `name`, `streetAddress`, `city`, `state`, `zip`
> - **👤 Root Owner Account**: `ownerName`, `email`, `password` (minimum 8 characters)

* **Execution**: Dispatches `POST /auth/setup` to instantiate the business and owner credentials, automatically logging in.
* **Security Lockout**: If an instance already exists, the server returns `403 Forbidden` and redirects to `/login`.

---

## 2. 🔑 Authentication & Landing

<div align="center">

![Login screen](./resources/login_screen.png)

</div>

Upon authentication (`POST /auth/login`), the client retrieves the user identity (`GET /users/me`) and dynamically directs traffic to role-specific landing views:

| Role | Initial Landing Route | Primary Workspace Scope |
| :--- | :--- | :--- |
| 👑 **Owner** | `/stores` | Global Store Fleet Management |
| 🛡️ **Manager** | `/stores/:storeId` | Assigned Store Control Center |
| 👷 **Associate** | `/stores/:storeId/inventory` | Live Floor & Stock Count Grid |

> [!IMPORTANT]
> - **Session Expiry**: An expired or invalid JWT (`401`) immediately terminates local state and redirects to `/login`.
> - **Route Protection**: Accessing an unauthorized store via direct URL triggers `JurisdictionGuard`, bouncing non-owners back to their registered store.

---

## 3. 🧭 Adaptive Navbar System

The navigation bar dynamically recalculates visible routes according to the active role and jurisdictional context. Restricted routes are hidden entirely rather than merely disabled.

| State / Role | Visible Navigation Items |
| :--- | :--- |
| 👑 **Owner (Global Scope)** | `Stores` · `Business` · `Owners` · `Logout` |
| 👑 **Owner (Inside a Store)** | `Stores` · `Users` · `Inventory` · `Business` · `Owners` · `Logout` |
| 🛡️ **Manager** | `Users` · `Inventory` · `Logout` *(Scoped to assigned store)* |
| 👷 **Associate** | `Inventory` · `Logout` *(Scoped to assigned store)* |

### 🖼️ Navbar Previews

#### 👑 Owner
![Owner navbar, global](./resources/navBarOwnerStores.png)
![Owner navbar, inside a store](./resources/navBarOwnerStore.png)

#### 🛡️ Manager
![Manager navbar](./resources/navBarManager.png)

#### 👷 Associate
![Associate navbar](./resources/navBarAssociate.png)

---

## 4. 👑 Owner Journey & Global Administration

### 4.1 Stores (`/stores`)
The entry portal for owners. Displays all active branch locations with actions to **+ New Store**, **Edit**, or **Delete** (cascades to staff and inventory).

![Stores dashboard](./resources/storesDashboard.png)

<details>
<summary><b>🔍 View Store Modals (Create / Edit / Delete)</b></summary>
<br/>

![Create store](./resources/storesDashboardCreate.png)
![Edit store](./resources/storesDashboardEditContent.png)
![Delete store](./resources/storesDashboardDelete.png)

</details>

---

### 4.2 Store Hub (`/stores/:storeId`)
Entering a branch establishes the active store context, surfacing quick access cards for **Users** and **Inventory** and appending them into the navbar.

![Store hub](./resources/StoreDashboard.png)

---

### 4.3 Users & Staff (`/stores/:storeId/users`)
Comprehensive team management with **+ Add Employee** (`manager` or `associate`). Supports editing credentials, deactivating employees, and initiating **cross-store transfers**.

![Users](./resources/UsersScreen.png)

<details>
<summary><b>🔍 View User Modals & Transfer Flow</b></summary>
<br/>

![Add employee](./resources/UsersScreenAdd.png)
![Edit employee](./resources/UsersScreenEdit.png)
![Delete employee](./resources/UsersScreenDelete.png)
![Transfer, pick store](./resources/UsersScreenTransfer.png)
![Transfer, confirm](./resources/UsersScreenTransferConfirmation.png)

</details>

---

### 4.4 Inventory (`/stores/:storeId/inventory`)
Full inventory matrix with dynamic search filtering by Name, UPC, or Department. Sticky headers maintain table alignment across large datasets.

![Inventory](./resources/InventoryScreen.png)

<details>
<summary><b>🔍 View Inventory Modals & Search Controls</b></summary>
<br/>

![Search/filter](./resources/InventoryScreenFilter.png)
![Add item](./resources/InventoryScreenAdd.png)
![Edit item](./resources/InventoryScreenEdit.png)
![Delete item](./resources/InventoryScreenDelete.png)

</details>

---

### 4.5 Owners (`/owners`)
Manage enterprise-level owner profiles. The system prohibits the deletion of the final remaining owner account.

![Owners](./resources/OwnerScreen.png)

<div align="center">

![Add owner](./resources/OwnerScreenAddModal.png)
![Edit owner](./resources/OwnerScreenEditModal.png)

</div>

---

### 4.6 Business Profile (`/business`)
Core business metadata management (Name, Address, Phone). Updates apply globally across the navbar brand and document manifests.

![Business](./resources/BusinessScreen.png)

---

## 5. 🛡️ Manager Journey

Store managers hold autonomous operational control over their assigned branch location.

![Users as manager](./resources/UsersScreenManager.png)

- **Store Hub & Inventory**: Identical full CRUD capabilities and search operations over the branch's inventory.
- **Team Management Scope**: Can add, update, and manage floor associates. Cannot alter other managers or transfer employees across stores.
- **Strict Isolation**: Blocked from accessing `/stores`, `/owners`, or `/business` via route-level guards.

---

## 6. 👷 Associate Journey

Floor associates interact with a streamlined, clutter-free workspace focused purely on stock counting accuracy.

![Inventory as associate](./resources/InventoryAssociate.png)

### ⚡ Key Features for Floor Staff:
- **Instant Inline Counting**: Edit `inShelf` and `inStock` counts directly with live cell inputs (Press `Enter` or `Save`).
- **Protected Actions**: Administrative action buttons (Add, Edit metadata, Delete) are completely hidden.
- **Auto-Clamping Validation**:
  - Non-numeric input immediately triggers validation alerts and reverts to the previous count.
  - Setting `inShelf > inStock` automatically clamps `inShelf` to match `inStock`.
  - Decreasing total `inStock` below existing `inShelf` trims `inShelf` safely.
- **Rapid Item Lookup**: Full search and department filtering remain active for fast aisle scanning.

---

<div align="center">
  <sub>Stockify Documentation · Built for the Per Scholas Capstone</sub>
</div>

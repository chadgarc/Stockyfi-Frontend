// src/Pages/InventoryPage.tsx
// Items management for one store: table + add/edit/delete modals.
// Owner/manager get full CRUD; associates only adjust inShelf (+/- stepper).
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useUser } from "../context/UserContext";
import { useFetchData } from "../hooks/useFetchData";
import { Field } from "../components/Field";
import { Modal } from "../components/Modal";
import { BackButton } from "../components/BackButton";
import {
  BTN_ERROR_OUTLINE,
  BTN_OUTLINE,
  BTN_PRIMARY_OUTLINE,
} from "../constants/ui";
import { validateItemForm } from "../utils/validation";
import { ApiError } from "../utils/apiError";
import type { Item, ItemSearchField, NewItemPayload } from "../types";

const EMPTY_FORM = {
  name: "",
  upc: "",
  department: "",
  inStock: "0",
  inShelf: "0",
};

export const InventoryPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { user } = useUser();
  const { listItems, createItem, updateItem, deleteItem, loading } =
    useFetchData();

  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState("");
  const [field, setField] = useState<ItemSearchField>("name");
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState({ field: "name" as ItemSearchField, q: "" });
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const canManage = user?.role === "owner" || user?.role === "manager";
  const isAssociate = !canManage;

  const refresh = async () => {
    if (!storeId) return;
    setItems(await listItems(storeId));
  };

  useEffect(() => {
    refresh().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : "Could not load items."),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // In-memory filter over the loaded items; no extra requests.
  const visible = useMemo(() => {
    const q = applied.q.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      if (applied.field === "upc") return it.upc.toLowerCase().includes(q);
      if (applied.field === "department")
        return (it.department ?? "").toLowerCase().includes(q);
      return it.name.toLowerCase().includes(q);
    });
  }, [items, applied]);

  const set = (key: keyof typeof EMPTY_FORM) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toPayload = (): NewItemPayload => ({
    name: form.name.trim(),
    upc: form.upc.trim(),
    department: form.department.trim() || undefined,
    inStock: Number(form.inStock),
    inShelf: Number(form.inShelf),
  });

  const handleAdd = async () => {
    if (!storeId) return;
    const payload = toPayload();
    const err = validateItemForm(payload);
    if (err) return setFormError(err);
    setFormError("");
    setSaving(true);
    try {
      // Backend answers 201 {message}; the list is the source of truth.
      await createItem(storeId, payload);
      setItems(await listItems(storeId));
      setAddOpen(false);
      setForm(EMPTY_FORM);
    } catch (e) {
      setFormError(
        e instanceof ApiError ? e.message : "Could not add the item.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!storeId || !editTarget) return;
    const payload = toPayload();
    const err = validateItemForm(payload);
    if (err) return setFormError(err);
    setFormError("");
    setSaving(true);
    try {
      await updateItem(storeId, editTarget._id, payload);
      setItems(await listItems(storeId));
      setEditTarget(null);
    } catch (e) {
      setFormError(
        e instanceof ApiError ? e.message : "Could not update the item.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!storeId || !deleteTarget) return;
    setSaving(true);
    try {
      await deleteItem(storeId, deleteTarget._id);
      setItems(await listItems(storeId));
      setDeleteTarget(null);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Could not delete the item.",
      );
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  };

  // Associates restock shelves only: sends {inShelf} per backend guard.
  const stepShelf = async (item: Item, delta: number) => {
    if (!storeId) return;
    const next = Math.max(0, Math.min(item.inStock, item.inShelf + delta));
    if (next === item.inShelf) return;
    setError("");
    try {
      await updateItem(storeId, item._id, { inShelf: next });
      setItems(await listItems(storeId));
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Could not update the shelf.",
      );
    }
  };

  const openEdit = (item: Item) => {
    setForm({
      name: item.name,
      upc: item.upc,
      department: item.department ?? "",
      inStock: String(item.inStock),
      inShelf: String(item.inShelf),
    });
    setFormError("");
    setEditTarget(item);
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <BackButton
        to={`/stores/${storeId}`}
        label="Back"
        classStyle={BTN_OUTLINE}
      />
      <div className="card bg-base-100 shadow-sm mt-6">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-2xl">Items Management</h1>
          <p className="opacity-70">Manage stock and shelf counts</p>
          {canManage && (
            <div className="card-actions mt-2">
              <button
                type="button"
                className={BTN_PRIMARY_OUTLINE}
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setFormError("");
                  setAddOpen(true);
                }}
              >
                + Add Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search: field dropdown + input + button, filters loaded items. */}
      <div className="card mt-4 bg-base-100 shadow-sm">
        <div className="card-body flex flex-col gap-2 sm:flex-row sm:items-end">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Search by</legend>
            <select
              className="select w-full sm:w-40"
              value={field}
              onChange={(e) => setField(e.target.value as ItemSearchField)}
            >
              <option value="name">Name</option>
              <option value="upc">UPC</option>
              <option value="department">Department</option>
            </select>
          </fieldset>
          <Field
            legend="Search"
            placeholder="Coca, 123456…, drinks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <fieldset className="fieldset">
            {/* Invisible legend matching the other blocks so buttons sit on the same Y. */}
            <legend
              className="fieldset-legend opacity-0 select-none"
              aria-hidden="true"
            >
              Go
            </legend>
            <div className="flex gap-2">
              <button
                type="button"
                className={BTN_PRIMARY_OUTLINE}
                onClick={() => setApplied({ field, q: query })}
              >
                Search
              </button>
              <button
                type="button"
                className={BTN_OUTLINE}
                onClick={() => {
                  setQuery("");
                  setApplied({ field, q: "" });
                }}
              >
                Clear
              </button>
            </div>
          </fieldset>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-error">
          {error}
        </p>
      )}

      <div className="card mt-4 bg-base-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>UPC</th>
                <th>Department</th>
                <th>inShelf</th>
                <th>inStock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center opacity-70">
                    Loading items…
                  </td>
                </tr>
              ) : (
                visible.map((item) => (
                  <tr key={item._id}>
                    <td className="font-bold">{item.name}</td>
                    <td>{item.upc}</td>
                    <td>{item.department ?? "—"}</td>
                    <td>
                      {isAssociate ? (
                        <span className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            className={`${BTN_OUTLINE} btn-xs`}
                            onClick={() => stepShelf(item, -1)}
                            aria-label={`Decrease shelf for ${item.name}`}
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center">
                            {item.inShelf}
                          </span>
                          <button
                            type="button"
                            className={`${BTN_OUTLINE} btn-xs`}
                            onClick={() => stepShelf(item, 1)}
                            aria-label={`Increase shelf for ${item.name}`}
                          >
                            +
                          </button>
                        </span>
                      ) : (
                        item.inShelf
                      )}
                    </td>
                    <td>{item.inStock}</td>
                    <td>
                      {canManage && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className={`${BTN_OUTLINE} btn-xs`}
                            onClick={() => openEdit(item)}
                            aria-label={`Edit ${item.name}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`${BTN_ERROR_OUTLINE} btn-xs`}
                            onClick={() => setDeleteTarget(item)}
                            aria-label={`Delete ${item.name}`}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add modal */}
      <Modal
        id="add-item"
        title="Add Item"
        open={addOpen}
        onClose={() => setAddOpen(false)}
      >
        <div className="mt-4 flex flex-col gap-2">
          <Field
            legend="Name"
            placeholder="Item Name"
            value={form.name}
            onChange={set("name")}
          />
          <Field
            legend="UPC"
            placeholder="123456789012"
            value={form.upc}
            onChange={set("upc")}
          />
          <Field
            legend="Department"
            placeholder="Item Department"
            value={form.department}
            onChange={set("department")}
          />
          <Field
            legend="Stock (warehouse)"
            type="number"
            min={0}
            value={form.inStock}
            onChange={set("inStock")}
          />
          <Field
            legend="Shelf (display)"
            type="number"
            min={0}
            value={form.inShelf}
            onChange={set("inShelf")}
          />
          {formError && (
            <p role="alert" className="text-sm text-error">
              {formError}
            </p>
          )}
        </div>
        <div className="modal-action">
          <button
            type="button"
            className={BTN_OUTLINE}
            onClick={() => setAddOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={BTN_PRIMARY_OUTLINE}
            onClick={handleAdd}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        id="edit-item"
        title={`Edit ${editTarget?.name ?? ""}`}
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
      >
        <div className="mt-4 flex flex-col gap-2">
          <Field
            legend="Name"
            value={form.name}
            onChange={set("name")}
          />
          <Field legend="UPC" value={form.upc} onChange={set("upc")} />
          <Field
            legend="Department"
            value={form.department}
            onChange={set("department")}
          />
          <Field
            legend="Stock (warehouse)"
            type="number"
            min={0}
            value={form.inStock}
            onChange={set("inStock")}
          />
          <Field
            legend="Shelf (display)"
            type="number"
            min={0}
            value={form.inShelf}
            onChange={set("inShelf")}
          />
          {formError && (
            <p role="alert" className="text-sm text-error">
              {formError}
            </p>
          )}
        </div>
        <div className="modal-action">
          <button
            type="button"
            className={BTN_OUTLINE}
            onClick={() => setEditTarget(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={BTN_PRIMARY_OUTLINE}
            onClick={handleEdit}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        id="delete-item"
        title="Delete Item?"
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
      >
        <p className="py-2 font-medium text-error">This cannot be undone.</p>
        <p>
          Delete <b>{deleteTarget?.name}</b> ({deleteTarget?.upc})?
        </p>
        <div className="modal-action">
          <button
            type="button"
            className={BTN_OUTLINE}
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={BTN_ERROR_OUTLINE}
            onClick={handleDelete}
            disabled={saving}
          >
            {saving ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Modal>
    </section>
  );
};

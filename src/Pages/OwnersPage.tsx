// src/Pages/OwnersPage.tsx
// Owner-only management of owner-tier accounts, reusing EmployeeTable.
// No transfer column: owners have no store to move between.
import { useEffect, useState } from "react";
import { useFetchData } from "../hooks/useFetchData";
import { EmployeeTable } from "../components/EmployeeTable";
import { Field } from "../components/Field";
import { Modal } from "../components/Modal";
import { BackButton } from "../components/BackButton";
import {
  BTN_ERROR_OUTLINE,
  BTN_OUTLINE,
  BTN_PRIMARY_OUTLINE,
} from "../constants/ui";
import { validateEmail } from "../utils/validation";
import { ApiError } from "../utils/apiError";
import type { StaffUser } from "../types";

export const OwnersPage = () => {
  const { listOwners, createOwner, updateOwner, deleteOwner, loading } =
    useFetchData();
  const [owners, setOwners] = useState<StaffUser[]>([]);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => setOwners(await listOwners());

  const handleAdd = async () => {
    const emailErr = validateEmail(addForm.email);
    if (!addForm.name.trim()) return setFormError("Enter the name.");
    if (emailErr) return setFormError(emailErr);
    if (addForm.password !== addForm.confirm)
      return setFormError("Passwords do not match.");
    if (addForm.password.length < 8)
      return setFormError("Passwords are at least 8 characters.");
    setFormError("");
    setSaving(true);
    try {
      // Role is assumed owner server-side.
      await createOwner({
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        password: addForm.password,
      });
      await refresh();
      setAddOpen(false);
      setAddForm({ name: "", email: "", password: "", confirm: "" });
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Could not add the owner.",
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    refresh().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : "Could not load owners."),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = async () => {
    if (!editTarget) return;
    const emailErr = validateEmail(editForm.email);
    if (!editForm.name.trim()) return setFormError("Enter the name.");
    if (emailErr) return setFormError(emailErr);
    if (editForm.password || editForm.confirm) {
      if (editForm.password !== editForm.confirm)
        return setFormError("Passwords do not match.");
      if (editForm.password.length < 8)
        return setFormError("Passwords are at least 8 characters.");
    }
    setFormError("");
    setSaving(true);
    try {
      await updateOwner(editTarget._id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        ...(editForm.password ? { password: editForm.password } : {}),
      });
      await refresh();
      setEditTarget(null);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Could not update the owner.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteOwner(deleteTarget._id);
      await refresh();
      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not delete the owner.",
      );
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <BackButton to="/stores" label="Back" classStyle={BTN_OUTLINE} />

      <div className="card bg-base-100 shadow-sm mt-6">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-2xl">Owners Management</h1>
          <p className="opacity-70">Manage owner-tier accounts</p>
          <div className="card-actions mt-2">
            <button
              type="button"
              className={BTN_PRIMARY_OUTLINE}
              onClick={() => {
                setAddForm({ name: "", email: "", password: "", confirm: "" });
                setFormError("");
                setAddOpen(true);
              }}
            >
              + Add Owner
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-error">
          {error}
        </p>
      )}

      <div className="card mt-6 bg-base-100 shadow-sm">
        <EmployeeTable
          employees={owners}
          loading={loading}
          showTransfer={false}
          onEdit={(u) => {
            setEditForm({ name: u.name, email: u.email, password: "", confirm: "" });
            setFormError("");
            setEditTarget(u);
          }}
          onDelete={setDeleteTarget}
        />
      </div>

      <Modal
        id="edit-owner"
        title={`Edit ${editTarget?.name ?? ""}`}
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
      >
        <div className="mt-4 flex flex-col gap-2">
          <Field
            legend="Name"
            value={editForm.name}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <Field
            legend="Email"
            value={editForm.email}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, email: e.target.value }))
            }
          />
          <Field
            legend="New Password (blank = keep current)"
            type="password"
            placeholder="••••••••"
            value={editForm.password}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, password: e.target.value }))
            }
          />
          <Field
            legend="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={editForm.confirm}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, confirm: e.target.value }))
            }
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

      <Modal
        id="add-owner"
        title="Add Owner"
        open={addOpen}
        onClose={() => setAddOpen(false)}
      >
        <div className="mt-4 flex flex-col gap-2">
          <Field
            legend="Name"
            placeholder="Chad Owner"
            value={addForm.name}
            onChange={(e) =>
              setAddForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <Field
            legend="Email"
            placeholder="owner@silvermart.com"
            value={addForm.email}
            onChange={(e) =>
              setAddForm((f) => ({ ...f, email: e.target.value }))
            }
          />
          <Field
            legend="Password"
            type="password"
            placeholder="••••••••"
            value={addForm.password}
            onChange={(e) =>
              setAddForm((f) => ({ ...f, password: e.target.value }))
            }
          />
          <Field
            legend="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={addForm.confirm}
            onChange={(e) =>
              setAddForm((f) => ({ ...f, confirm: e.target.value }))
            }
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

      <Modal
        id="delete-owner"
        title="Delete Owner?"
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
      >
        <p className="py-2 font-medium text-error">This cannot be undone.</p>
        <p>
          Delete owner <b>{deleteTarget?.name}</b> ({deleteTarget?.email})?
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

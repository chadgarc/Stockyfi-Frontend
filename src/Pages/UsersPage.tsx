// src/Pages/UsersPage.tsx
// EmployeeManagement for one store: table + add/edit/delete/transfer modals.
// Owner sees all actions; manager sees all but transfer (owner-only).
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useUser } from "../context/UserContext";
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
import type {
  RegisterEmployeePayload,
  StaffUser,
  Store,
  UserRole,
} from "../types";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  confirm: "",
  role: "associate" as UserRole,
};

export const UsersPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { user } = useUser();
  const {
    listUsers,
    listStores,
    registerEmployee,
    updateEmployee,
    deleteEmployee,
    transferEmployee,
    loading,
  } = useFetchData();

  const [employees, setEmployees] = useState<StaffUser[]>([]);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);
  const [transferTarget, setTransferTarget] = useState<StaffUser | null>(null);
  const [confirmTransfer, setConfirmTransfer] = useState<Store | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeQuery, setStoreQuery] = useState("");

  const isOwner = user?.role === "owner";
  // Managers never touch owner accounts (backend also blocks it).
  const visible = useMemo(
    () =>
      isOwner ? employees : employees.filter((e) => e.role !== "owner"),
    [employees, isOwner],
  );

  const refresh = async () => {
    if (!storeId) return;
    setEmployees(await listUsers(storeId));
  };

  useEffect(() => {
    refresh().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : "Could not load staff."),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const set = (key: keyof typeof EMPTY_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openTransfer = async (emp: StaffUser) => {
    setTransferTarget(emp);
    setStoreQuery("");
    try {
      setStores(await listStores());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load stores.");
    }
  };

  // Live filter over the loaded stores: address or zip, no extra requests.
  const filteredStores = useMemo(() => {
    const q = storeQuery.trim().toLowerCase();
    return stores
      .filter((s) => s._id !== storeId)
      .filter((s) => {
        if (!q) return true;
        const address = [s.streetAddress, s.city, s.state, s.zip]
          .filter(Boolean)
          .join(", ")
          .toLowerCase();
        return address.includes(q) || s.name.toLowerCase().includes(q);
      });
  }, [stores, storeQuery, storeId]);

  const handleAdd = async () => {
    const emailErr = validateEmail(form.email);
    if (!form.name.trim()) return setFormError("Enter the name.");
    if (emailErr) return setFormError(emailErr);
    if (form.password !== form.confirm)
      return setFormError("Passwords do not match.");
    if (form.password.length < 8)
      return setFormError("Passwords are at least 8 characters.");
    setFormError("");
    setSaving(true);
    try {
      const payload: RegisterEmployeePayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        ...(isOwner ? { storeId: storeId ?? null } : {}),
      };
      await registerEmployee(payload);
      await refresh();
      setAddOpen(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Could not add the employee.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget || !storeId) return;
    const emailErr = validateEmail(editForm.email);
    if (!editForm.name.trim()) return setFormError("Enter the name.");
    if (emailErr) return setFormError(emailErr);
    setFormError("");
    setSaving(true);
    try {
      await updateEmployee(storeId, editTarget._id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
      });
      await refresh();
      setEditTarget(null);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Could not update the employee.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !storeId) return;
    setSaving(true);
    try {
      await deleteEmployee(storeId, deleteTarget._id);
      await refresh();
      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not delete the employee.",
      );
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferTarget || !confirmTransfer) return;
    setSaving(true);
    try {
      await transferEmployee(transferTarget._id, confirmTransfer._id);
      await refresh();
      setConfirmTransfer(null);
      setTransferTarget(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not transfer the employee.",
      );
      setConfirmTransfer(null);
      setTransferTarget(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <BackButton to={`/stores/${storeId}`} label="Back" classStyle={BTN_OUTLINE} />

      <div className="card bg-base-100 shadow-sm mt-6">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-2xl">Employees Management</h1>
          <p className="opacity-70">Manage staff of this store</p>
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
              + Add Employee
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
          employees={visible}
          loading={loading}
          showTransfer={isOwner}
          onEdit={(u) => {
            setEditForm({ name: u.name, email: u.email });
            setFormError("");
            setEditTarget(u);
          }}
          onDelete={setDeleteTarget}
          onTransfer={openTransfer}
        />
      </div>

      {/* Add modal */}
      <Modal
        id="add-employee"
        title="Add Employee"
        open={addOpen}
        onClose={() => setAddOpen(false)}
      >
        <div className="mt-4 flex flex-col gap-2">
          <Field
            legend="Name"
            placeholder="Marta Manager"
            value={form.name}
            onChange={set("name")}
          />
          <Field
            legend="Email"
            placeholder="marta@silvermart.com"
            value={form.email}
            onChange={set("email")}
          />
          <Field
            legend="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={set("password")}
          />
          <Field
            legend="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={set("confirm")}
          />
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Role</legend>
            <select
              className="select w-full"
              value={form.role}
              onChange={set("role")}
            >
              <option value="manager">manager</option>
              <option value="associate">associate</option>
            </select>
          </fieldset>
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
        id="edit-employee"
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
        id="delete-employee"
        title="Delete Employee?"
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
      >
        <p className="py-2 font-medium text-error">This cannot be undone.</p>
        <p>
          Delete <b>{deleteTarget?.name}</b> ({deleteTarget?.email})?
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

      {/* Single transfer dialog: pick step swaps to confirm step inside. */}
      <Modal
        id="transfer-employee"
        title={
          confirmTransfer
            ? "Confirm Transfer?"
            : `Transfer ${transferTarget?.name ?? ""}`
        }
        open={transferTarget !== null}
        onClose={() => {
          setTransferTarget(null);
          setConfirmTransfer(null);
        }}
      >
        {confirmTransfer === null ? (
          <>
            <div className="mt-4">
              <Field
                legend="Search by address or zip"
                placeholder="Pine St, Fort Worth… or 76101"
                value={storeQuery}
                onChange={(e) => setStoreQuery(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>Address</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStores.map((s) => (
                    <tr key={s._id}>
                      <td className="font-bold">{s.name}</td>
                      <td>
                        {[s.streetAddress, s.city, s.state, s.zip]
                          .filter(Boolean)
                          .join(", ")}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`${BTN_OUTLINE} btn-xs`}
                          onClick={() => setConfirmTransfer(s)}
                        >
                          Transfer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <p>
              Transfer <b>{transferTarget?.name}</b> to{" "}
              <b>{confirmTransfer?.name}</b>?
            </p>
            <div className="modal-action">
              <button
                type="button"
                className={BTN_OUTLINE}
                onClick={() => {
                  setTransferTarget(null);
                  setConfirmTransfer(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={BTN_PRIMARY_OUTLINE}
                onClick={handleTransfer}
                disabled={saving}
              >
                {saving ? "Saving…" : "Confirm"}
              </button>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
};

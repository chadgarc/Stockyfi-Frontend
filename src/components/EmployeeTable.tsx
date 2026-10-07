// src/components/EmployeeTable.tsx
// Shared staff table (DaisyUI) used by UsersPage and OwnersPage.
// Rows keyed by Mongo _id; transfer column hidden when showTransfer is false.
import type { EmployeeTableProps } from "../types";
import { BTN_ERROR_OUTLINE, BTN_OUTLINE } from "../constants/ui";

export const EmployeeTable = ({
  employees,
  loading,
  showTransfer,
  onEdit,
  onDelete,
  onTransfer,
}: EmployeeTableProps) => (
  <div className="overflow-x-auto">
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading && employees.length === 0 ? (
          <tr>
            <td colSpan={3} className="text-center opacity-70">
              Loading employees…
            </td>
          </tr>
        ) : (
          employees.map((emp) => (
            <tr key={emp._id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="mask mask-squircle bg-neutral text-neutral-content h-12 w-12">
                      <span className="text-xl">
                        {emp.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{emp.name}</div>
                    <div className="text-sm opacity-50">{emp.email}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className="badge badge-ghost badge-sm">{emp.role}</span>
              </td>
              <td>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className={`${BTN_OUTLINE} btn-xs`}
                    onClick={() => onEdit(emp)}
                    aria-label={`Edit ${emp.name}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`${BTN_ERROR_OUTLINE} btn-xs`}
                    onClick={() => onDelete(emp)}
                    aria-label={`Delete ${emp.name}`}
                  >
                    Delete
                  </button>
                  {showTransfer && (
                    <button
                      type="button"
                      className={`${BTN_OUTLINE} btn-xs`}
                      onClick={() => onTransfer?.(emp)}
                      aria-label={`Transfer ${emp.name}`}
                    >
                      Transfer
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

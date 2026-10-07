// src/components/Modal.tsx
// Reusable DaisyUI dialog: closes on ESC/outside click by default,
// bottom-sheet on mobile, centered from sm breakpoint up.
// Save/Cancel actions are provided by each caller, not by this wrapper.
import { useEffect, useRef, type ReactNode } from "react";

/** Props for the reusable modal wrapper. */
export interface ModalProps {
  /** Dialog id for testing/aria. */
  id: string;
  /** Title shown at the top of the modal box. */
  title: string;
  /** Controls visibility; synced with the native dialog element. */
  open: boolean;
  /** Called on close (X, Cancel, ESC, or backdrop click). */
  onClose: () => void;
  /** Modal content plus an optional `.modal-action` button row. */
  children: ReactNode;
}

export const Modal = ({ id, title, open, onClose, children }: ModalProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  // Sync React state with the native dialog (needed for ESC/backdrop).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      id={id}
      ref={ref}
      className="modal modal-bottom sm:modal-middle"
      onClose={onClose}
      onClick={(e) => {
        // Backdrop click (outside modal-box) closes.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
      </div>
    </dialog>
  );
};

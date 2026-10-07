// src/components/Field.tsx
// Reusable DaisyUI fieldset: label legend, bordered input that turns
// red (input-error) when an error message is present, plus hint line.
import type { InputHTMLAttributes } from "react";

/** Props for a labeled input with inline validation display. */
export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Legend shown above the input. */
  legend: string;
  /** Error text; empty string hides the message. */
  error?: string;
  /** Hint shown under the input when there is no error. */
  hint?: string;
}

export const Field = ({ legend, error, hint, ...rest }: FieldProps) => (
  <fieldset className="fieldset">
    <legend className="fieldset-legend">{legend}</legend>
    <input
      {...rest}
      className={`input w-full ${error ? "input-error" : ""} ${rest.className ?? ""}`}
    />
    {error ? (
      <p className="label text-error">{error}</p>
    ) : hint ? (
      <p className="label">{hint}</p>
    ) : null}
  </fieldset>
);

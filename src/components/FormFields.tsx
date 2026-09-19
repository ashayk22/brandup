"use client";

import { useId, type ReactNode } from "react";
import { siteConfig } from "@/lib/data";
import type { FormErrors } from "./useFormspreeForm";

/** Field styles shared by the contact section and the project dialog, so the
 *  two forms always look like the same form. */
export const labelClass =
  "block text-[11px] font-medium uppercase tracking-[0.08em] text-ash/80";
export const inputClass =
  "mt-2 block w-full rounded-input border border-white/15 bg-white/[0.03] px-3.5 py-3 text-[16px] text-ivory placeholder:text-slateline/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] transition-all duration-200 outline-none hover:border-white/30 hover:bg-white/[0.05] focus:border-cobalt focus:bg-white/[0.05] focus:ring-4 focus:ring-cobalt/15 aria-[invalid=true]:border-[#e8a0a0] aria-[invalid=true]:focus:ring-[#e8a0a0]/15";

const errorText = "mt-1.5 text-[13px] leading-[1.4] text-[#e8a0a0]";

type FieldProps = {
  name: string;
  label: string;
  errors: FormErrors | null;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
};

function FieldErrors({
  id,
  name,
  label,
  errors,
}: {
  id: string;
  name: string;
  label: string;
  errors: FormErrors | null;
}) {
  const list = errors?.getFieldErrors(name) ?? [];
  if (list.length === 0) return null;
  return (
    <p id={id} role="alert" className={errorText}>
      {label}: {list.map((e) => e.message).join(", ")}
    </p>
  );
}

export function TextField({
  name,
  label,
  errors,
  type = "text",
  required,
  autoComplete,
  placeholder,
  className,
}: FieldProps & { type?: "text" | "email" }) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = (errors?.getFieldErrors(name).length ?? 0) > 0;
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        className={inputClass}
      />
      <FieldErrors id={errorId} name={name} label={label} errors={errors} />
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  errors,
  required,
  placeholder,
  rows = 4,
  className,
}: FieldProps & { rows?: number }) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = (errors?.getFieldErrors(name).length ?? 0) > 0;
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        className={`${inputClass} resize-none`}
      />
      <FieldErrors id={errorId} name={name} label={label} errors={errors} />
    </div>
  );
}

/** Spam trap: people never see or fill it, bots do. Formspree drops any
 *  submission where `_gotcha` has a value. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

/** Shown under the submit area whenever a submission fails. Field-level
 *  problems also show under their own field. */
export function FormFailure({ errors }: { errors: FormErrors | null }) {
  if (!errors) return null;
  return (
    <p role="alert" className="text-[14px] leading-[1.5] text-[#e8a0a0]">
      Your message did not go through. Check the form and try again, or write
      to{" "}
      <a
        href={`mailto:${siteConfig.email}`}
        className="underline decoration-current/40 underline-offset-4 hover:decoration-current"
      >
        {siteConfig.email}
      </a>
      .
    </p>
  );
}

export function SubmitButton({
  sending,
  children,
}: {
  sending: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={sending}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-button bg-ivory px-6 py-3.5 text-[15px] font-medium text-canvas shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_10px_24px_-12px_rgba(82,102,235,0.0)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_28px_-12px_rgba(82,102,235,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      {sending ? (
        <>
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-canvas/25 border-t-canvas"
          />
          Sending…
        </>
      ) : (
        <>
          {children}
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-1"
          >
            <path d="M3 8h10 M8.5 3.5 13 8l-4.5 4.5" />
          </svg>
        </>
      )}
    </button>
  );
}

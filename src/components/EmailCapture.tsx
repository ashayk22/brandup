"use client";

import { Honeypot } from "./FormFields";
import { useFormspreeForm } from "./useFormspreeForm";

type Props = {
  placeholder?: string;
  buttonLabel?: string;
};

const DEFAULT_ERROR = "Something went wrong. Please try again.";

/** Hero "get an audit" capture. Posts to the same Formspree form as the main
 *  contact section and project dialog (see useFormspreeForm), so every
 *  submission lands as a real notification in the studio inbox — just with
 *  its own `source` and subject line, and no redirect to /thank-you since
 *  this stays inline in the hero. */
export function EmailCapture({
  placeholder = "you@company.com",
  buttonLabel = "Get an audit",
}: Props) {
  const { status, errors, handleSubmit } = useFormspreeForm({
    source: "hero-audit",
    subject: (data) => `New lead: ${data.get("email")} wants to connect`,
    redirectOnSent: false,
  });

  const sending = status === "sending";

  if (status === "sent") {
    return (
      <div
        role="status"
        className="flex w-full items-center justify-center rounded-input border border-ivory/20 bg-white/[0.03] px-5 py-[13px] text-[16px] text-ivory"
      >
        You&rsquo;re on the list. Check your inbox shortly.
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative flex w-full">
        <label htmlFor="email-capture" className="sr-only">
          Work email
        </label>
        <input
          id="email-capture"
          name="email"
          type="email"
          required
          placeholder={placeholder}
          aria-invalid={
            (errors?.getFieldErrors("email").length ?? 0) > 0 || undefined
          }
          className="w-full min-w-0 flex-1 rounded-l-input border border-r-0 border-ivory/60 bg-transparent px-5 py-[13px] text-[16px] text-ivory placeholder:text-ash focus:outline-none"
        />
        {/* Context for the notification email; the visitor never sees this. */}
        <input
          type="hidden"
          name="message"
          value="This person/company wants to connect. They requested the free 20-minute audit of their current channels and site from the homepage."
        />
        <Honeypot />
        <button
          type="submit"
          disabled={sending}
          className="shrink-0 whitespace-nowrap rounded-r-input bg-cobalt px-6 py-[13px] text-[16px] text-purewhite transition-colors hover:bg-cobalt-hover disabled:opacity-70"
        >
          {sending ? "Sending…" : buttonLabel}
        </button>
      </form>
      {errors && (
        <p role="alert" className="mt-2 text-[13px] text-[#e8a0a0]">
          {errors.getFormErrors()[0]?.message ??
            errors.getFieldErrors("email")[0]?.message ??
            DEFAULT_ERROR}
        </p>
      )}
    </div>
  );
}

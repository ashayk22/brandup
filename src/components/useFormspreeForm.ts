"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSubmit } from "@formspree/react";
import { FORMSPREE_FORM_ID } from "@/lib/formspree";

/** What the form components need from a Formspree error. */
export type FormErrors = {
  getFormErrors(): readonly { message: string }[];
  getFieldErrors(field: string): readonly { message: string }[];
};

type Status = "idle" | "sending" | "sent";

/**
 * Shared submit logic for the contact section and the "Start a project"
 * dialog. Both post to the same Formspree form; `source` tells the two apart
 * in the inbox and `subject` builds the email subject line (Formspree reads
 * the special `_subject` field).
 */
export function useFormspreeForm({
  source,
  subject,
  onSent,
  redirectOnSent = true,
}: {
  source: string;
  subject: (data: FormData) => string;
  /** Runs once Formspree has accepted the submission, before the redirect. */
  onSent?: () => void;
  /** Navigate to /thank-you once sent. Defaults to true; pass false for
   *  inline forms (like the hero audit capture) that show their own success
   *  state instead of leaving the page. */
  redirectOnSent?: boolean;
}) {
  const router = useRouter();
  const submit = useSubmit<Record<string, string>>(FORMSPREE_FORM_ID);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FormErrors | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrors(null);

    const data = new FormData(e.currentTarget);
    data.set("source", source);
    data.set("_subject", subject(data));

    const result = await submit(data);
    if (result.kind === "error") {
      setErrors(result);
      setStatus("idle");
      return;
    }

    setStatus("sent");
    onSent?.();
    if (redirectOnSent) router.push("/thank-you");
  }

  return { status, errors, handleSubmit };
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { phoneHref, siteConfig } from "@/lib/data";
import {
  FormFailure,
  Honeypot,
  SubmitButton,
  TextAreaField,
  TextField,
  labelClass,
} from "./FormFields";
import { useFormspreeForm } from "./useFormspreeForm";

const SERVICES = ["Social media", "Website", "Both", "Other"];

type ProjectDialogContextValue = { open: () => void };

const ProjectDialogContext = createContext<ProjectDialogContextValue | null>(
  null
);

/** Opens the "Start a project" dialog from anywhere on the site. */
export function useProjectDialog() {
  const ctx = useContext(ProjectDialogContext);
  if (!ctx) {
    throw new Error("useProjectDialog must be used inside ProjectDialogProvider");
  }
  return ctx;
}

function ProjectForm({
  onClose,
  onSent,
}: {
  onClose: () => void;
  onSent: () => void;
}) {
  const { status, errors, handleSubmit } = useFormspreeForm({
    source: "start-project-dialog",
    subject: (data) => {
      const service = String(data.get("service") ?? "").trim();
      return `${siteConfig.name} project: ${service || "New enquiry"}`;
    },
    onSent,
  });

  return (
    <div className="relative grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center text-ash transition-colors hover:text-ivory"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M2 2 14 14 M14 2 2 14" />
        </svg>
      </button>

      <div className="flex flex-col p-8 pr-14 md:p-10 md:pr-8">
        <h2
          id="project-dialog-title"
          className="font-arcadia-display text-[clamp(44px,6vw,64px)] font-medium leading-[0.98] tracking-[-0.01em] text-ivory"
        >
          <span className="block">Start</span>
          <span className="block pl-[0.7em]">a project</span>
        </h2>
        <p className="mt-8 hidden max-w-[340px] text-[15px] leading-[1.6] text-ash md:block">
          Tell us where your social and site stand today: what is not working,
          what you want to change, and what success would look like.
        </p>
        <p className="mt-6 text-[15px] font-medium text-ivory md:mt-5">
          Our promise: a reply {siteConfig.responseTime}.
        </p>
        <p className="mt-5 text-[14px] text-ash">
          {phoneHref ? "Prefer to reach us directly? " : "Prefer email? "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-ivory underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            {siteConfig.email}
          </a>
          {phoneHref && (
            <>
              {" or "}
              <a
                href={phoneHref}
                className="text-ivory underline decoration-white/30 underline-offset-4 hover:decoration-white"
              >
                {siteConfig.phone}
              </a>
            </>
          )}
        </p>
      </div>

      <div className="border-t border-white/[0.12] p-8 md:border-l md:border-t-0 md:p-10">
        <form
          onSubmit={handleSubmit}
          aria-labelledby="project-dialog-title"
          className="relative flex flex-col gap-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="first_name"
              label="First name"
              autoComplete="given-name"
              required
              errors={errors}
            />
            <TextField
              name="last_name"
              label="Last name"
              autoComplete="family-name"
              errors={errors}
            />
          </div>
          <TextField
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            required
            errors={errors}
          />

          <fieldset>
            <legend className={labelClass}>What can we do for you?</legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {SERVICES.map((option) => (
                <label key={option} className="cursor-pointer">
                  <input
                    type="radio"
                    name="service"
                    value={option}
                    className="peer sr-only"
                  />
                  <span className="block rounded-card border border-white/15 bg-white/[0.03] px-4 py-2 text-[14px] text-ash transition-all duration-200 hover:border-white/35 hover:bg-white/[0.05] hover:text-ivory peer-checked:border-cobalt peer-checked:bg-cobalt/15 peer-checked:text-ivory peer-checked:shadow-[0_0_0_1px_rgba(82,102,235,0.4)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cobalt">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <TextAreaField
            name="message"
            label="Project details"
            required
            errors={errors}
          />
          <Honeypot />
          <FormFailure errors={errors} />
          <SubmitButton sending={status === "sending"}>
            Send project details
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

/** Mounts the "Start a project" dialog once for the whole site and exposes
 *  `useProjectDialog().open()` to any button. The form is only rendered while
 *  the dialog is open, so every opening starts from a clean form. */
export function ProjectDialogProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const value = useMemo(() => ({ open: () => setIsOpen(true) }), []);

  // The native <dialog> handles focus trapping, Escape, and returning focus
  // to the button that opened it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <ProjectDialogContext.Provider value={value}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="project-dialog-title"
        onClose={() => setIsOpen(false)}
        onClick={(e) => {
          // A click on the dialog element itself is a click on the backdrop.
          if (e.target === e.currentTarget) setIsOpen(false);
        }}
        className="project-dialog m-auto max-h-[calc(100dvh-24px)] w-[min(920px,calc(100vw-24px))] overflow-y-auto rounded-card border border-white/[0.15] bg-canvas p-0 text-ivory backdrop:bg-black/70"
      >
        {isOpen && (
          <ProjectForm
            onClose={() => setIsOpen(false)}
            onSent={() => setIsOpen(false)}
          />
        )}
      </dialog>
    </ProjectDialogContext.Provider>
  );
}

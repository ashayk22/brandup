"use client";

import {
  SiBehance,
  SiDribbble,
  SiFacebook,
  SiInstagram,
  SiTiktok,
  SiX,
  SiYoutube,
} from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa";
import { phoneHref, siteConfig } from "@/lib/data";
import { Reveal } from "./Reveal";
import {
  FormFailure,
  Honeypot,
  SubmitButton,
  TextAreaField,
  TextField,
} from "./FormFields";
import { useFormspreeForm } from "./useFormspreeForm";

function SocialIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  if (key.includes("instagram")) return <SiInstagram aria-hidden />;
  if (key.includes("linkedin")) return <FaLinkedinIn aria-hidden />;
  if (key === "x" || key.includes("twitter")) return <SiX aria-hidden />;
  if (key.includes("facebook")) return <SiFacebook aria-hidden />;
  if (key.includes("youtube")) return <SiYoutube aria-hidden />;
  if (key.includes("behance")) return <SiBehance aria-hidden />;
  if (key.includes("dribbble")) return <SiDribbble aria-hidden />;
  if (key.includes("tiktok")) return <SiTiktok aria-hidden />;
  return <span className="text-[13px]">{label}</span>;
}

const lineIcon = {
  width: 20,
  height: 20,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinejoin: "miter",
  "aria-hidden": true,
} as const;

function MailIcon() {
  return (
    <svg {...lineIcon}>
      <path d="M2.5 4.5h15v11h-15z M2.5 4.5 10 11l7.5-6.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg {...lineIcon}>
      <path d="M6 2.5h8v15H6z M9 14.5h2" />
    </svg>
  );
}

const railLink =
  "flex h-10 w-10 items-center justify-center text-[18px] text-ash transition-colors hover:text-ivory";

export function ContactCta() {
  const { status, errors, handleSubmit } = useFormspreeForm({
    source: "contact-section",
    subject: (data) => {
      const subject = String(data.get("subject") ?? "").trim();
      return `${siteConfig.name} contact: ${subject || "New message"}`;
    },
  });

  return (
    <section id="contact" className="bg-canvas py-[72px]">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal>
          <div className="grid border border-white/[0.12] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_64px]">
            {/* Heading and intro */}
            <div className="flex flex-col justify-center p-6 sm:p-12 lg:py-16 lg:pl-14 lg:pr-10">
              <h2 className="font-arcadia-display text-[38px] font-medium leading-[0.95] tracking-[-0.01em] text-ivory sm:text-[56px] md:text-[72px] lg:text-[104px]">
                <span className="block">Let&rsquo;s</span>
                <span className="block pl-4 sm:pl-[0.7em]">get in</span>
                <span className="block pl-8 sm:pl-[1.4em]">touch</span>
              </h2>
              <p className="mt-8 max-w-[360px] text-[15px] leading-[1.6] text-ash sm:mt-10">
                Questions, feedback, or a project in mind? Write to us and we
                reply {siteConfig.responseTime}. No discovery call is needed to
                hear back.
              </p>
              <p className="mt-4 text-[14px] text-ash">
                {phoneHref ? "Prefer to reach us directly? " : "Prefer email? "}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="break-all text-ivory underline decoration-white/30 underline-offset-4 hover:decoration-white"
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

            {/* Form */}
            <div className="border-t border-white/[0.12] p-6 sm:p-12 md:border-l md:border-t-0 lg:py-16">
              {status === "sent" ? (
                <div
                  role="status"
                  className="flex min-h-[280px] flex-col justify-center"
                >
                  <p className="font-arcadia-display text-[28px] font-medium text-ivory">
                    Message sent
                  </p>
                  <p className="mt-2 text-[16px] text-ash">
                    Thanks, we&apos;ll reply {siteConfig.responseTime}.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  aria-label="Contact form"
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
                  <TextField
                    name="subject"
                    label="Subject"
                    required
                    errors={errors}
                  />
                  <TextAreaField
                    name="message"
                    label="Message"
                    required
                    errors={errors}
                  />
                  <Honeypot />
                  <FormFailure errors={errors} />
                  <SubmitButton sending={status === "sending"}>
                    Send message
                  </SubmitButton>
                </form>
              )}
            </div>

            {/* Contact rail */}
            <div className="flex justify-center gap-2 border-t border-white/[0.12] p-4 md:flex-col md:items-center md:justify-start md:border-l md:border-t-0 md:py-8">
              <a
                href={`mailto:${siteConfig.email}`}
                aria-label={`Email ${siteConfig.email}`}
                className={railLink}
              >
                <MailIcon />
              </a>
              {phoneHref && (
                <a
                  href={phoneHref}
                  aria-label={`Call ${siteConfig.phone}`}
                  className={railLink}
                >
                  <PhoneIcon />
                </a>
              )}
              {siteConfig.socials.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={railLink}
                >
                  <SocialIcon label={s.label} />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

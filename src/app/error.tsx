"use client";

import { useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/data";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex flex-1 items-center bg-canvas py-[72px]">
      <div className="mx-auto w-full max-w-[800px] px-6">
        <h1 className="font-arcadia-display text-[32px] font-medium leading-[1.15] tracking-[0.01em] text-ivory sm:text-[42px]">
          Something went wrong
        </h1>
        <p className="mt-4 max-w-[520px] text-[16px] leading-[1.5] text-ash">
          An unexpected error stopped this page from loading. Try again, and if
          it keeps happening, email us at{" "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-ivory underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            {siteConfig.email}
          </a>
          .
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex items-center justify-center rounded-button bg-cobalt px-5 py-[11px] text-[16px] text-purewhite transition-colors duration-150 hover:bg-cobalt-hover"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-button border border-ivory/90 px-5 py-[11px] text-[16px] text-ivory transition-colors duration-150 hover:bg-ivory/[0.06]"
          >
            Back to the home page
          </Link>
        </div>
      </div>
    </section>
  );
}

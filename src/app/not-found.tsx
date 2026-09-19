import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <PageShell stickyCta={false}>
      <section className="bg-canvas py-[72px]">
        <Reveal className="mx-auto max-w-[800px] px-6">
          <p className="font-arcadia-display text-[14px] font-medium text-slateline">
            404
          </p>
          <h1 className="mt-4 font-arcadia-display text-[32px] font-medium leading-[1.15] tracking-[0.01em] text-ivory sm:text-[42px]">
            This page could not be found
          </h1>
          <p className="mt-4 max-w-[520px] text-[16px] leading-[1.5] text-ash">
            The link may be out of date, or the page may have moved. The home
            page has everything we do, or you can write to us at{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-ivory underline decoration-white/30 underline-offset-4 hover:decoration-white"
            >
              {siteConfig.email}
            </a>
            .
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/" variant="primary">
              Back to the home page
            </Button>
            <Button href="/#work" variant="ghost">
              See our work
            </Button>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}

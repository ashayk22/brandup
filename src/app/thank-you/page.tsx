import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { siteConfig } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Thank you",
  description: "Your message has reached the team.",
  path: "/thank-you",
  noindex: true,
});

export default function ThankYou() {
  return (
    <PageShell stickyCta={false}>
      <section className="bg-canvas py-[72px]">
        <Reveal className="mx-auto max-w-[800px] px-6">
          <h1 className="font-arcadia-display text-[32px] font-medium leading-[1.15] tracking-[0.01em] text-ivory sm:text-[42px]">
            Thank you, your message is with us
          </h1>
          <p className="mt-4 max-w-[560px] text-[16px] leading-[1.5] text-ash">
            We reply {siteConfig.responseTime}, with next steps and no
            discovery call required to hear back. If you need to add anything
            in the meantime, write to{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-ivory underline decoration-white/30 underline-offset-4 hover:decoration-white"
            >
              {siteConfig.email}
            </a>
            .
          </p>

          <p className="mt-10 text-[13px] text-ash">While you wait</p>
          <ul className="mt-3 flex max-w-[420px] flex-col divide-y divide-white/[0.08] border-y border-white/[0.08]">
            <li>
              <Link
                href="/#work"
                className="block py-3 text-[15px] text-ivory hover:text-ash"
              >
                Read our case studies
              </Link>
            </li>
            <li>
              <Link
                href="/#process"
                className="block py-3 text-[15px] text-ivory hover:text-ash"
              >
                See how an engagement runs
              </Link>
            </li>
          </ul>

          <div className="mt-10">
            <Button href="/" variant="ghost">
              Back to the home page
            </Button>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}

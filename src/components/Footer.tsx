import Link from "next/link";
import { nav, phoneHref, siteConfig } from "@/lib/data";
import { Reveal } from "./Reveal";

type FooterLinkItem = { label: string; href: string };

const columns: { title: string; links: FooterLinkItem[] }[] = [
  {
    title: "Studio",
    links: nav.map(({ label, href }) => ({ label, href })),
  },
  {
    title: "Connect",
    links: [
      { label: siteConfig.email, href: `mailto:${siteConfig.email}` },
      ...(phoneHref ? [{ label: siteConfig.phone, href: phoneHref }] : []),
      ...siteConfig.socials,
    ],
  },
];

const legal: FooterLinkItem[] = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" },
];

const linkClass = "text-[14px] text-ivory transition-colors hover:text-ash break-all sm:break-normal";

function FooterLink({ label, href }: FooterLinkItem) {
  // Plain anchors for mailto:, tel: and off-site links; router links for pages.
  if (/^(mailto|tel):/.test(href)) {
    return (
      <a href={href} className={linkClass}>
        {label}
      </a>
    );
  }
  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={linkClass}>
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-canvas pb-24 md:pb-0">
      <Reveal className="mx-auto max-w-[1200px] px-6 py-[72px]" y={16}>
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-[320px]">
            <span className="font-arcadia-display text-[18px] font-medium tracking-[0.01em] text-ivory">
              {siteConfig.name}
            </span>
            <p className="mt-3 text-[14px] leading-[1.5] text-ash">
              A social media and website studio for brands that want both
              done properly, by people who talk to each other.
            </p>
            <p className="mt-3 text-[14px] leading-[1.5] text-ash">
              We reply {siteConfig.responseTime}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:gap-20">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-[13px] text-ash">{col.title}</h4>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink {...link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legal.map((link) => (
              <li key={link.href}>
                <FooterLink {...link} />
              </li>
            ))}
          </ul>
          <p className="text-[12px] leading-[1.4] tracking-[0.01em] text-ash">
            © {new Date().getFullYear()} {siteConfig.legalName}. All work is
            performed under a signed statement of work; figures shown in case
            studies reflect individual client results and are not guaranteed for
            future engagements.
          </p>
        </div>
      </div>
    </footer>
  );
}

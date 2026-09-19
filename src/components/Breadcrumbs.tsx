import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { absoluteUrl } from "@/lib/seo";

type Crumb = { label: string; href?: string };

/** Home is added automatically; leave `href` off the last crumb (current page). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ label: "Home", href: "/" }, ...items];

  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-[13px] text-ash">
          {trail.map((crumb, i) => {
            const last = i === trail.length - 1;
            return (
              <li key={crumb.label} className="flex items-center gap-2">
                {crumb.href && !last ? (
                  <Link
                    href={crumb.href}
                    className="underline decoration-white/20 underline-offset-4 hover:text-ivory"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className={last ? "text-ivory" : undefined}>
                    {crumb.label}
                  </span>
                )}
                {!last && <span aria-hidden="true">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((crumb, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: crumb.label,
            ...(crumb.href && { item: absoluteUrl(crumb.href) }),
          })),
        }}
      />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProjectArt } from "@/components/ProjectArt";
import { Reveal } from "@/components/Reveal";
import { StartProjectButton } from "@/components/StartProjectButton";
import { work } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return work.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/work/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const item = work.find((w) => w.slug === slug);
  if (!item) return {};
  return pageMetadata({
    title: `${item.client} case study`,
    description: `${item.client}: ${item.kind.toLowerCase()}. ${item.description}`,
    path: `/work/${item.slug}`,
  });
}

const h2 = "font-arcadia-display text-[24px] font-medium text-ivory";
const list =
  "mt-4 flex flex-col divide-y divide-white/[0.08] border-y border-white/[0.08]";
const textLink =
  "text-ivory underline decoration-white/30 underline-offset-4 hover:decoration-white";

export default async function CaseStudy(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const item = work.find((w) => w.slug === slug);
  if (!item) notFound();

  const others = work.filter((w) => w.slug !== item.slug);

  const facts: { label: string; value: React.ReactNode }[] = [
    { label: "Type", value: item.kind },
    ...(item.stack?.length
      ? [{ label: "Built with", value: item.stack.join(", ") }]
      : []),
    ...(item.href
      ? [
          {
            label: "Live site",
            value: (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={textLink}
              >
                {item.href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            ),
          },
        ]
      : []),
  ];

  return (
    <PageShell>
      <article className="bg-canvas py-[72px]">
        <div className="mx-auto max-w-[800px] px-6">
          <Breadcrumbs
            items={[{ label: "Work", href: "/#work" }, { label: item.client }]}
          />

          <Reveal>
            <h1 className="mt-10 font-arcadia-display text-[32px] font-medium leading-[1.15] tracking-[0.01em] text-ivory sm:text-[42px]">
              {item.client}
            </h1>
            <p className="mt-2 text-[16px] text-ivory/70">{item.kind}</p>

            <div className="mt-8 flex h-[260px] items-center justify-center rounded-card border border-white/[0.12] bg-card p-6 sm:h-[340px]">
              <ProjectArt
                name={item.art}
                title={`Illustration for ${item.client}`}
                className="h-full w-full max-w-[280px] text-ivory"
              />
            </div>

            <p className="mt-8 text-[18px] leading-[1.5] text-ivory">
              {item.description}
            </p>

            <dl className="mt-8 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="grid gap-1 py-3 text-[15px] sm:grid-cols-[140px_1fr] sm:gap-4"
                >
                  <dt className="text-ash">{f.label}</dt>
                  <dd className="text-ivory">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {item.brief && (
            <Reveal className="mt-14">
              <h2 className={h2}>The brief</h2>
              <p className="mt-4 max-w-[640px] text-[16px] leading-[1.6] text-ash">
                {item.brief}
              </p>
            </Reveal>
          )}

          {item.built && item.built.length > 0 && (
            <Reveal className="mt-14">
              <h2 className={h2}>What we built</h2>
              <ul className={list}>
                {item.built.map((line) => (
                  <li key={line} className="py-3 text-[15px] text-ivory">
                    {line}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {item.approach && (
            <Reveal className="mt-14">
              <h2 className={h2}>How it came together</h2>
              <p className="mt-4 max-w-[640px] text-[16px] leading-[1.6] text-ash">
                {item.approach}
              </p>
            </Reveal>
          )}

          {item.outcome && (
            <Reveal className="mt-14">
              <h2 className={h2}>Where it stands</h2>
              <p className="mt-4 max-w-[640px] text-[16px] leading-[1.6] text-ash">
                {item.outcome}
              </p>
            </Reveal>
          )}

          <Reveal className="mt-14 rounded-card bg-card p-8">
            <h2 className={h2}>Talk to us about your own project</h2>
            <p className="mt-2 max-w-[520px] text-[15px] leading-[1.5] text-ash">
              Tell us where your social and site stand today and we will reply
              with next steps.
            </p>
            <div className="mt-6">
              <StartProjectButton />
            </div>
          </Reveal>

          {others.length > 0 && (
            <Reveal className="mt-14">
              <h2 className={h2}>More case studies</h2>
              <ul className={list}>
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link
                      href={`/work/${o.slug}`}
                      className="flex items-baseline justify-between gap-4 py-3 text-[15px] text-ivory hover:text-ash"
                    >
                      <span>{o.client}</span>
                      <span className="text-[14px] text-ash">{o.kind}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </article>
    </PageShell>
  );
}

import { PageShell } from "./PageShell";
import { Breadcrumbs } from "./Breadcrumbs";
import { Reveal } from "./Reveal";
import { LEGAL_UPDATED, type LegalSection } from "@/lib/legal";

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <PageShell>
      <article className="bg-canvas py-[72px]">
        <div className="mx-auto max-w-[800px] px-6">
          <Breadcrumbs items={[{ label: title }]} />
          <Reveal>
            <h1 className="mt-10 font-arcadia-display text-[32px] font-medium leading-[1.15] tracking-[0.01em] text-ivory sm:text-[42px]">
              {title}
            </h1>
            <p className="mt-3 text-[13px] text-ash">
              Last updated {LEGAL_UPDATED}
            </p>
            <p className="mt-8 max-w-[640px] text-[16px] leading-[1.6] text-ash">
              {intro}
            </p>
          </Reveal>

          <div className="mt-10 flex flex-col divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {sections.map((section) => (
              <Reveal key={section.heading}>
                <section className="py-8">
                  <h2 className="font-arcadia-display text-[22px] font-medium text-ivory">
                    {section.heading}
                  </h2>
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-3 max-w-[640px] text-[15px] leading-[1.6] text-ash"
                    >
                      {paragraph}
                    </p>
                  ))}
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </article>
    </PageShell>
  );
}

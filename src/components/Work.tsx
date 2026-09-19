import { work } from "@/lib/data";
import { ProjectStack } from "./ProjectStack";
import { Reveal } from "./Reveal";
import { StartProjectButton } from "./StartProjectButton";

export function Work() {
  const items = work.map((item) => ({
    title: item.client,
    kind: item.kind,
    description: item.description,
    art: item.art,
    href: item.href || undefined,
    caseStudyHref: `/work/${item.slug}`,
  }));

  return (
    <section id="work" className="bg-canvas pt-[72px]">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal className="max-w-[560px]">
          <h2 className="font-arcadia-display text-[32px] font-medium leading-[1.15] tracking-[0.01em] text-ivory sm:text-[42px]">
            Previous projects
          </h2>
          <p className="mt-4 text-[16px] leading-[1.5] text-ash">
            Websites and apps we have designed and built, each with its own
            case study.
          </p>
        </Reveal>

        {work.length === 0 && (
          <div className="mt-12 rounded-card border border-white/[0.08] p-8">
            <p className="text-[18px] font-medium text-ivory">
              Projects are on their way
            </p>
            <p className="mt-2 max-w-[520px] text-[15px] leading-[1.5] text-ash">
              We are writing up recent projects. In the meantime, tell us about
              yours and we will share relevant examples directly.
            </p>
            <div className="mt-6">
              <StartProjectButton />
            </div>
          </div>
        )}
      </div>

      {work.length > 0 && <ProjectStack items={items} />}
    </section>
  );
}

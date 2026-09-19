import { processSteps } from "@/lib/data";
import { Reveal } from "./Reveal";

export function Process() {
  return (
    <section id="process" className="bg-canvas py-[72px]">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal className="max-w-[560px]">
          <h2 className="font-arcadia-display text-[32px] font-medium leading-[1.15] tracking-[0.01em] text-ivory sm:text-[42px]">
            How an engagement runs
          </h2>
          <p className="mt-4 text-[16px] leading-[1.5] text-ash">
            The same five stages whether we&apos;re starting your social
            presence, your site, or both at once.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-card bg-white/[0.06] md:grid-cols-5">
          {processSteps.map((item, i) => (
            <Reveal key={item.step} delay={i * 0.08} className="bg-canvas p-6">
              <span className="font-arcadia-display text-[14px] font-medium text-slateline">
                {item.step}
              </span>
              <h3 className="mt-4 text-[18px] font-medium text-ivory">
                {item.title}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.5] text-ash">
                {item.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { services } from "@/lib/data";
import { Reveal } from "./Reveal";

export function Services() {
  return (
    <section id="services" className="bg-canvas py-[72px]">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal className="max-w-[560px]">
          <h2 className="font-arcadia-display text-[32px] font-medium leading-[1.15] tracking-[0.01em] text-ivory sm:text-[42px] sm:tracking-[0.01em]">
            Two disciplines, one calendar
          </h2>
          <p className="mt-4 text-[16px] leading-[1.5] text-ash">
            Most agencies hand you off between a social team and a dev team
            who never talk. We run both out of the same weekly plan.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {services.map((service, i) => (
            <Reveal
              key={service.title}
              delay={i * 0.1}
              className="rounded-card bg-card p-8"
            >
              <h3 className="font-arcadia-display text-[24px] font-medium tracking-[0.02em] text-ivory">
                {service.title}
              </h3>
              <p className="mt-3 text-[16px] leading-[1.5] text-ash">
                {service.summary}
              </p>
              <ul className="mt-6 flex flex-col divide-y divide-white/[0.08] border-t border-white/[0.08]">
                {service.points.map((point) => (
                  <li
                    key={point}
                    className="py-3 text-[15px] leading-[1.4] text-ivory"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

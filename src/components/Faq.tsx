import { faqs } from "@/lib/data";
import { Reveal } from "./Reveal";

export function Faq() {
  return (
    <section className="bg-canvas py-[72px]">
      <div className="mx-auto max-w-[800px] px-6">
        <Reveal>
          <h2 className="font-arcadia-display text-[32px] font-medium leading-[1.15] tracking-[0.01em] text-ivory sm:text-[42px]">
            Questions worth answering upfront
          </h2>
        </Reveal>

        <div className="mt-10 flex flex-col divide-y divide-white/[0.08] border-t border-white/[0.08]">
          {faqs.map((faq, i) => (
            <Reveal key={faq.question} delay={i * 0.06}>
              <details className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-ivory">
                  {faq.question}
                  <span
                    className="shrink-0 text-[20px] leading-none text-ash transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-[640px] text-[15px] leading-[1.5] text-ash">
                  {faq.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

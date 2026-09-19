import { ChannelsPanel } from "./ChannelsPanel";

const bullets = [
  {
    title: "Every channel & the site, together",
    body: "One login shows what's posted, what's scheduled, and how the site is performing, so the full picture lives in one place.",
  },
  {
    title: "Content calendar",
    body: "See what's shipping this week across every platform before it goes live.",
  },
  {
    title: "Reporting",
    body: "Monthly summaries written in plain language and ready to act on.",
  },
];

export function ProductIntro() {
  return (
    <section className="bg-canvas py-[72px]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-6 md:grid-cols-2">
        <div>
          <h2 className="font-arcadia-display text-[32px] font-medium leading-[1.15] tracking-[0.01em] text-ivory sm:text-[42px]">
            Everything you post.
            <br />
            All in one place.
          </h2>

          <div className="mt-8 flex flex-col divide-y divide-white/[0.08] border-t border-white/[0.08]">
            {bullets.map((b) => (
              <div key={b.title} className="py-5">
                <p className="text-[16px] font-medium text-ivory">{b.title}</p>
                <p className="mt-1.5 text-[14px] leading-[1.5] text-ash">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <ChannelsPanel />
      </div>
    </section>
  );
}

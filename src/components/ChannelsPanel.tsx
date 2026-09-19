const channels = [
  { name: "Instagram", sub: "Content + community", metric: "82.4K followers" },
  { name: "TikTok", sub: "Short-form video", metric: "146K followers" },
  { name: "Website", sub: "brandupstudio.com", metric: "19.6K sessions/mo" },
  { name: "LinkedIn", sub: "B2B outreach", metric: "12.1K followers" },
  { name: "Email", sub: "Weekly newsletter", metric: "38% open rate" },
];

export function ChannelsPanel() {
  return (
    <div className="overflow-hidden rounded-card border border-white/[0.06] bg-card">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <span className="text-[12px] text-ash">Channel</span>
        <span className="text-[12px] text-ash">Performance</span>
      </div>
      <div>
        {channels.map((c, i) => (
          <div
            key={c.name}
            className={`flex items-center justify-between border-b border-white/[0.05] px-6 py-4 last:border-b-0 ${
              i === 2 ? "bg-white/[0.04]" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-medium text-ivory">
                {c.name.slice(0, 1)}
              </span>
              <div>
                <p className="text-[14px] font-medium text-ivory">{c.name}</p>
                <p className="text-[12px] text-ash">{c.sub}</p>
              </div>
            </div>
            <span className="text-[13px] text-ivory">{c.metric}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 px-6 py-4 text-[13px] text-ash">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-white/20 text-[14px]">
            +
          </span>
          Connect a channel
        </div>
      </div>
    </div>
  );
}

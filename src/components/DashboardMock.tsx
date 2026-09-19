const bars = [38, 62, 45, 80, 58, 92, 70, 84, 66, 96, 74, 100];
const reachLine = [30, 55, 40, 70, 52, 78, 60, 85, 68, 92, 76, 100];

export function DashboardMock() {
  return (
    <div className="flex h-full w-full bg-[#14141f] text-ivory">
      {/* sidebar */}
      <div className="hidden w-[168px] shrink-0 flex-col gap-1 border-r border-white/[0.06] bg-[#111119] p-4 sm:flex">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cobalt" />
          <span className="text-[11px] font-medium text-ivory">BrandUp Portal</span>
        </div>
        {["Overview", "Social", "Website", "Content queue", "Reports"].map(
          (item, i) => (
            <div
              key={item}
              className={`rounded-md px-3 py-2 text-[11px] ${
                i === 0 ? "bg-white/[0.06] text-ivory" : "text-ash"
              }`}
            >
              {item}
            </div>
          )
        )}
      </div>

      {/* main — fills whatever height the panel has, instead of pinning to
          the top and leaving dead space below (the chart grows to fit). */}
      <div className="flex flex-1 flex-col overflow-hidden p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[13px] font-medium text-ivory">
            This month at a glance
          </p>
          <span className="rounded-tag bg-white/[0.06] px-2.5 py-1 text-[10px] text-ash">
            Live
          </span>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            { label: "Followers", value: "48.2K", delta: "+12.4%" },
            { label: "Engagement", value: "6.8%", delta: "+1.1%" },
            { label: "Site sessions", value: "19.6K", delta: "+22%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
            >
              <p className="text-[10px] text-ash">{stat.label}</p>
              <p className="mt-1 text-[16px] font-medium text-ivory">
                {stat.value}
              </p>
              <p className="mt-0.5 text-[10px] text-cobalt">{stat.delta}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="mb-3 text-[10px] text-ash">Reach, last 12 weeks</p>
          <div className="flex flex-1 items-end gap-1.5">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-cobalt/70"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-1 flex-col rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="mb-3 text-[10px] text-ash">Engagement rate, daily</p>
          <svg
            viewBox="0 0 240 100"
            preserveAspectRatio="none"
            className="h-full w-full flex-1"
          >
            <polyline
              points={reachLine
                .map((v, i) => `${(i / (reachLine.length - 1)) * 240},${100 - v}`)
                .join(" ")}
              fill="none"
              stroke="#5266EB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

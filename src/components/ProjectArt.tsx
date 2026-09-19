import type { ProjectArtName } from "@/lib/data";

/**
 * Line illustrations for the project cards and case-study pages. Each one is
 * drawn on a 200 x 200 grid with a single stroke weight and mitred corners
 * (square, like the rest of the site), in the current text colour, with one
 * cobalt shape as the only accent.
 */

const cobalt = "var(--cobalt)";

function Coffee() {
  return (
    <>
      {/* lid */}
      <rect x="66" y="34" width="68" height="8" />
      <rect x="58" y="42" width="84" height="12" />
      {/* cup */}
      <path d="M62 54 L72 168 H128 L138 54" />
      {/* sleeve */}
      <path d="M65.1 88 H134.9 L131.5 128 H68.5 Z" fill={cobalt} stroke="none" />
      {/* ground */}
      <path d="M34 176 H166" />
    </>
  );
}

function Birds() {
  const bird = (
    <g>
      <ellipse cx="76" cy="104" rx="30" ry="24" />
      <circle cx="100" cy="80" r="14" />
      <path d="M113 77 L125 81.5 L113 86 Z" fill={cobalt} stroke="none" />
      <circle cx="104.5" cy="77" r="1.6" fill="currentColor" stroke="none" />
      <path d="M60 102 Q74 92 90 106" />
      <path d="M48 108 L28 120 M48 114 L30 130" />
      <path d="M72 128 V144 M84 128 V144" />
    </g>
  );
  return (
    <>
      <g transform="translate(-7 14) scale(0.82)">{bird}</g>
      <g transform="translate(207 14) scale(-0.82 0.82)">{bird}</g>
      <path d="M16 132 H184" />
    </>
  );
}

function Cooked() {
  return (
    <g transform="translate(-12 0)">
      {/* pan and handle */}
      <circle cx="90" cy="110" r="56" />
      <circle cx="90" cy="110" r="44" opacity="0.4" />
      <path d="M146 104 H190 V116 H146" />
      {/* egg white */}
      <path d="M64 96 C60 78 92 70 108 82 C128 88 122 118 110 128 C98 140 70 136 66 118 C62 112 62 104 64 96 Z" />
      {/* yolk */}
      <circle cx="92" cy="106" r="13" fill={cobalt} stroke="none" />
    </g>
  );
}

function Split() {
  return (
    <>
      {/* receipt with a zigzag tear */}
      <path d="M56 30 H144 V160 L133 172 L122 160 L111 172 L100 160 L89 172 L78 160 L67 172 L56 160 Z" />
      {/* itemised lines */}
      <path d="M68 54 H132 M68 70 H116 M68 86 H124" />
      <path d="M68 104 H132" opacity="0.4" />
      {/* the split: two equal shares */}
      <rect x="68" y="116" width="30" height="16" fill={cobalt} stroke="none" />
      <rect x="102" y="116" width="30" height="16" />
    </>
  );
}

const art: Record<ProjectArtName, () => React.JSX.Element> = {
  coffee: Coffee,
  birds: Birds,
  cooked: Cooked,
  split: Split,
};

export function ProjectArt({
  name,
  title,
  className,
}: {
  name: ProjectArtName;
  /** Accessible description. Leave empty when the art is decorative. */
  title?: string;
  className?: string;
}) {
  const Art = art[name];
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
      strokeLinecap="square"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
    >
      <Art />
    </svg>
  );
}

/** Position marker for the card stack: one bar per project, the current one
 *  longer and in cobalt. Replaces a printed "01" so the card carries no
 *  numerals. */
export function PositionMarks({
  index,
  total,
  className,
}: {
  index: number;
  total: number;
  className?: string;
}) {
  const short = 10;
  const long = 26;
  const gap = 6;
  const widths = Array.from({ length: total }, (_, i) =>
    i === index ? long : short
  );
  const bars = widths.map((w, i) => ({
    w,
    x: widths.slice(0, i).reduce((sum, prev) => sum + prev + gap, 0),
    current: i === index,
  }));
  const width = widths.reduce((sum, w) => sum + w, 0) + gap * (total - 1);

  return (
    <svg
      width={width}
      height="4"
      viewBox={`0 0 ${width} 4`}
      role="img"
      aria-label={`Project ${index + 1} of ${total}`}
      className={className}
    >
      {bars.map((b) => (
        <rect
          key={b.x}
          x={b.x}
          y="0"
          width={b.w}
          height="4"
          fill={b.current ? cobalt : "currentColor"}
          opacity={b.current ? 1 : 0.3}
        />
      ))}
    </svg>
  );
}

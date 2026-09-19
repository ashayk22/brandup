"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { EmailCapture } from "./EmailCapture";
import { DashboardMock } from "./DashboardMock";
import { ChannelsPanel } from "./ChannelsPanel";

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/** Maps `v` from [inMin, inMax] to [outMin, outMax], clamped at both ends. */
function mapClamp(
  v: number,
  inMin: number,
  inMax: number,
  outMin = 0,
  outMax = 1
) {
  if (inMax === inMin) return v >= inMax ? outMax : outMin;
  const t = clamp01((v - inMin) / (inMax - inMin));
  return outMin + t * (outMax - outMin);
}

function ease(t: number) {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Scroll-progress breakpoints (all 0..1 over the sticky section's scroll range).
const TEXT_FADE_START = 0.15; // hero copy & email start fading...
const TEXT_FADE_END = 0.32; // ...and are fully gone by mid-zoom.
const HANDOFF_START = 0.38; // the frame sequence has finished scrubbing to its last frame;
const HANDOFF_END = 0.44; // ...the dashboard "switches on" over the laptop's display.
const HOLD_END = 0.56; // dashboard sits on the laptop screen, fully visible.
const SPLIT_END = 1; // dashboard has slid off the laptop to the right; new copy is in.

// Within the split (0..1, after easing):
const SCENE_FADE_END = 0.55; // the laptop scene has faded out to the page background by here.
const INTRO_FADE_START = 0.5; // the left-hand copy starts fading in (after the scene is mostly gone).
const CONTENT_CROSSFADE_START = 0.5; // the dashboard content stays put for the first half of the move...
const CONTENT_CROSSFADE_END = 0.9; // ...then swaps for the account list as it docks.

// The source frames are 1152x648 and drawn `object-cover`. On the last frame,
// the laptop's display (the lit area inside the bezel) sits at these edges, in
// frame pixels — measured from public/video/hero-frames/f-038.jpg and checked
// against a live render. The lid is tilted back a touch, so the display is a
// slight trapezoid (a few pixels wider at the bottom than the top) and the left
// edge isn't perfectly straight; each side is a list of [y, x] points, top to
// bottom. If the frames are ever re-exported, re-measure these.
const FRAME_W = 1152;
const FRAME_H = 648;
type Pt = [number, number];
const SCREEN_IN_FRAME = {
  top: 96,
  bottom: 444.5,
  left: [
    [96, 306.3],
    [240, 306.0],
    [280, 303.5],
    [444.5, 302.6],
  ] as Pt[],
  right: [
    [96, 830.3],
    [444.5, 834.5],
  ] as Pt[],
  radius: 4,
};

// The fixed navbar covers the top of the stage. If the laptop's display would
// end up under it (short, wide windows crop the frame and push the display up),
// the frame is slid down just enough to clear it.
const NAV_HEIGHT = 76;
const NAV_CLEARANCE = 16;

// Where the dashboard docks at the end, as fractions of the stage.
const DOCK = { left: 0.54, top: 0.2, width: 0.42, height: 0.58 };
const DOCK_RADIUS = 16;

type PanelRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  radius: number;
  /** The display's left / right edges as [x%, y%] points inside the box —
   *  the clip that turns the box into the display's outline. A plain box has
   *  x = 0 on the left and x = 100 on the right. */
  clipLeft: Pt[];
  clipRight: Pt[];
};

/** How the frame sits on a `w` x `h` stage: `object-cover` scaling, plus any
 *  downward slide needed to keep the laptop's display clear of the navbar. */
function frameLayout(w: number, h: number) {
  const scale = Math.max(w / FRAME_W, h / FRAME_H);
  const offsetX = (w - FRAME_W * scale) / 2;
  const centeredY = (h - FRAME_H * scale) / 2; // 0 or negative (cropped)
  const screenTop = centeredY + SCREEN_IN_FRAME.top * scale;
  const shift = Math.min(
    Math.max(NAV_HEIGHT + NAV_CLEARANCE - screenTop, 0),
    -centeredY // can't slide past the crop, or a gap opens above the frame
  );
  const offsetY = centeredY + shift;
  // CSS object-position y% that produces `offsetY` (offsetY = (h - imgH) * p).
  const posY = centeredY === 0 ? 50 : (offsetY / (2 * centeredY)) * 100;
  return { scale, offsetX, offsetY, posY };
}

/** Where the laptop display lands on the stage (bounding box + outline clip).
 *  Clamped to the stage so a narrow portrait viewport (where cover crops the
 *  laptop) can't push the panel off-screen. */
function laptopScreenRect(w: number, h: number): PanelRect {
  const { scale, offsetX, offsetY } = frameLayout(w, h);
  const sc = SCREEN_IN_FRAME;
  const fl = Math.min(...sc.left.map(([, x]) => x));
  const fr = Math.max(...sc.right.map(([, x]) => x));
  const left = offsetX + fl * scale;
  const right = offsetX + fr * scale;
  const top = offsetY + sc.top * scale;
  const bottom = offsetY + sc.bottom * scale;
  const cl = Math.max(0, left);
  const ct = Math.max(0, top);
  const cr = Math.min(w, right);
  const cb = Math.min(h, bottom);
  const clamped = cl !== left || ct !== top || cr !== right || cb !== bottom;
  const toPct = ([y, x]: Pt, edge: 0 | 100): Pt => [
    clamped ? edge : ((x - fl) / (fr - fl)) * 100,
    ((y - sc.top) / (sc.bottom - sc.top)) * 100,
  ];
  return {
    left: cl,
    top: ct,
    width: cr - cl,
    height: cb - ct,
    radius: sc.radius * scale,
    clipLeft: sc.left.map((pt) => toPct(pt, 0)),
    clipRight: sc.right.map((pt) => toPct(pt, 100)),
  };
}

function dockRect(w: number, h: number): PanelRect {
  return {
    left: w * DOCK.left,
    top: h * DOCK.top,
    width: w * DOCK.width,
    height: h * DOCK.height,
    radius: DOCK_RADIUS,
    clipLeft: [[0, 0]],
    clipRight: [[100, 0]],
  };
}

// The source clip keeps going after this and renders its own (fake, AI-
// generated) dashboard UI, which looks nothing like — and visibly clashes
// with — our real DashboardMock. Stop scrubbing well before that, while the
// laptop screen is still just dimming to black, so the handoff to layer 2
// is a clean dissolve instead of two different dashboards double-exposed.
const FRAME_COUNT = 38; // pre-extracted stills covering that same ~3.2s window.
const FRAME_URLS = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/video/hero-frames/f-${String(i + 1).padStart(3, "0")}.jpg`
);

const introBullets = [
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

function IntroCopy({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <h2 className="font-arcadia-display text-[32px] font-medium leading-[1.15] tracking-[0.01em] text-ivory sm:text-[42px]">
        Everything you post.
        <br />
        All in one place.
      </h2>
      <div className="mt-8 flex flex-col divide-y divide-white/[0.08] border-t border-white/[0.08]">
        {introBullets.map((b) => (
          <div key={b.title} className="py-5">
            <p className="text-[16px] font-medium text-ivory">{b.title}</p>
            <p className="mt-1.5 text-[14px] leading-[1.5] text-ash">
              {b.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Darkens the top and bottom of the photo a bit for legibility, leaving the
 *  middle (where the headline sits) close to untouched — same trick the
 *  reference relies on. */
const HERO_SCRIM =
  "linear-gradient(180deg, rgba(10,10,16,0.6) 0%, rgba(10,10,16,0.15) 25%, rgba(10,10,16,0.15) 55%, rgba(10,10,16,0.65) 100%)";

/** Depth-of-field look: the middle of the shot (the laptop) stays sharp while
 *  the edges go soft and dark, so the eye lands on the laptop. Built from a few
 *  stacked backdrop blurs, each masked to start further from the centre, so the
 *  softness ramps up gradually instead of switching on at a visible edge.
 *  Percentages are relative to the sharp ellipse below (100% = its edge). It's
 *  sized to keep the whole laptop display crisp on the last frame. Lives inside
 *  layer 1, so it fades out with the scene. */
const FOCUS_ELLIPSE = "ellipse 35% 50% at 50% 50%";
const FOCUS_BLUR_LAYERS = [
  { blur: 5, from: 90, to: 130 },
  { blur: 12, from: 110, to: 150 },
  { blur: 26, from: 125, to: 170 },
];
const FOCUS_VIGNETTE = `radial-gradient(${FOCUS_ELLIPSE}, transparent 110%, rgba(10,10,16,0.5) 175%)`;

function FocusBlur() {
  return (
    <>
      {FOCUS_BLUR_LAYERS.map(({ blur, from, to }) => {
        const mask = `radial-gradient(${FOCUS_ELLIPSE}, transparent ${from}%, #000 ${to}%)`;
        return (
          <div
            key={blur}
            className="pointer-events-none absolute inset-0"
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
            aria-hidden="true"
          />
        );
      })}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: FOCUS_VIGNETTE }}
        aria-hidden="true"
      />
    </>
  );
}

function HeroCopy() {
  return (
    <>
      <p className="mb-5 rounded-tag border border-ivory/30 bg-obsidian/30 px-4 py-[7px] text-[12px] tracking-[0.005em] text-ivory backdrop-blur-sm">
        Social &amp; web, run as one team
      </p>
      <h1 className="font-arcadia-display text-center text-[42px] font-medium leading-[1.12] tracking-[0.01em] text-ivory drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-[52px] sm:leading-[1.12] lg:text-[65px] lg:leading-[1.1]">
        Grow the brand people already want to trust.
      </h1>
      <p className="mt-6 max-w-[520px] text-center text-[18px] font-medium leading-[1.35] text-ivory/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.4)]">
        BrandUp runs your social channels and builds the website behind them.
        One team, one calendar, one number we&apos;re both watching.
      </p>
      <div className="mt-10 w-full max-w-[420px] rounded-input bg-obsidian/25 p-2 backdrop-blur-md">
        <EmailCapture placeholder="you@company.com" buttonLabel="Get an audit" />
        <p className="mt-3 text-center text-[12px] text-ivory/80">
          Free 20-minute audit of your current channels and site.
        </p>
      </div>
    </>
  );
}

function WebPerformancePanel() {
  return (
    <div className="overflow-hidden rounded-card border border-white/[0.06] bg-card">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <span className="text-[12px] text-ash">Web Metric</span>
        <span className="text-[12px] text-ash">Benchmark</span>
      </div>
      <div>
        <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 font-mono text-[12px] font-bold text-emerald-400">
              100
            </span>
            <div>
              <p className="text-[14px] font-medium text-ivory">Core Web Vitals</p>
              <p className="text-[11px] text-ash">Google page experience</p>
            </div>
          </div>
          <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
            Grade A
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.05] bg-white/[0.02] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cobalt/20 font-mono text-[12px] font-semibold text-cobalt">
              0.4s
            </span>
            <div>
              <p className="text-[14px] font-medium text-ivory">Load Speed</p>
              <p className="text-[11px] text-ash">Global CDN edge render</p>
            </div>
          </div>
          <span className="font-mono text-[13px] text-ivory">3.8x faster</span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] font-mono text-[12px] font-bold text-ivory">
              +34%
            </span>
            <div>
              <p className="text-[14px] font-medium text-ivory">Conversion Rate</p>
              <p className="text-[11px] text-ash">Visitor to booked call</p>
            </div>
          </div>
          <span className="text-[13px] font-medium text-emerald-400">+34% avg</span>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/15 font-mono text-[12px] font-semibold text-purple-300">
              CMS
            </span>
            <div>
              <p className="text-[14px] font-medium text-ivory">Zero-Code Editing</p>
              <p className="text-[11px] text-ash">Instant live publishing</p>
            </div>
          </div>
          <span className="text-[12px] text-ash">Automated</span>
        </div>
      </div>
    </div>
  );
}

function MobileHero() {
  const [activeTab, setActiveTab] = useState<"social" | "website">("social");
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle tabs every 5 seconds for dynamic life
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev === "social" ? "website" : "social"));
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div className="md:hidden">
      {/* Top Hero Section */}
      <section className="relative flex flex-col items-center overflow-hidden bg-canvas px-5 pb-16 pt-28 text-center">
        {/* Graphic Background: Bespoke 3D Ribbon & Matrix Mesh */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/mobile-hero-bg.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-top opacity-60 mix-blend-screen scale-105"
          />
          {/* Top gradient scrim so navbar stays crystal legible */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-canvas/95 via-canvas/40 to-canvas/95"
            aria-hidden="true"
          />
          {/* Bottom fade into canvas */}
          <div
            className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-canvas via-canvas/80 to-transparent"
            aria-hidden="true"
          />
        </div>

        {/* Animated Aurora Ambient Glow behind graphic */}
        <div
          className="aurora-glow pointer-events-none absolute -top-28 left-1/2 z-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cobalt/30 via-indigo-600/15 to-transparent blur-3xl"
          aria-hidden="true"
        />

        {/* Subtle dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(rgba(237, 237, 243, 0.25) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />

        {/* Foreground Content Container */}
        <div className="relative z-10 flex w-full flex-col items-center">
          {/* Brand Tag Pill with glowing accent */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 text-[12px] font-medium tracking-wide text-ivory/90 shadow-sm backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cobalt opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cobalt" />
          </span>
          Social &amp; web, run as one team
        </motion.div>

        {/* Display Headline with gradient shimmer accent */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-arcadia-display text-[35px] font-medium leading-[1.1] tracking-tight text-ivory sm:text-[44px]"
        >
          Grow the brand
          <span className="shimmer-text block font-medium">
            people already want to trust.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 max-w-sm text-[15px] leading-relaxed text-ash"
        >
          BrandUp runs your social channels and builds the website behind them.
          One team, one calendar, one number we&apos;re both watching.
        </motion.p>

        {/* Email Audit Capture Form */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 w-full max-w-sm rounded-lg border border-white/[0.1] bg-card/75 p-2.5 shadow-2xl backdrop-blur-md"
        >
          <EmailCapture placeholder="you@company.com" buttonLabel="Get an audit" />
          <p className="mt-2 text-center text-[12px] text-ash">
            Free 20-minute audit of your current channels and site.
          </p>
        </motion.div>

        {/* Floating Quick Badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 flex items-center justify-center gap-3 text-[11px]"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-ivory/80">
            <span className="text-cobalt">✦</span> 146K+ Reach
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-ivory/80">
            <span className="text-emerald-400">⚡</span> 0.4s Edge Speed
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-ivory/80">
            <span className="text-indigo-400">●</span> 1 Plan
          </span>
        </motion.div>

        {/* Interactive Dual-Mode Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="mt-5 w-full max-w-sm text-left"
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#14141f] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
            {/* Window Top Bar with Interactive Switcher */}
            <div className="border-b border-white/[0.08] bg-white/[0.02] p-2.5">
              <div className="flex items-center justify-between px-1.5 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ash/80">
                  {activeTab === "social" ? "● LIVE SYNC (4 CHANNELS)" : "● 100% PRODUCTION READY"}
                </span>
              </div>

              {/* Segmented Switcher */}
              <div className="grid grid-cols-2 gap-1 rounded-md bg-canvas/90 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("social");
                    setIsPaused(true);
                  }}
                  className={clsx(
                    "flex items-center justify-center gap-1.5 rounded py-1.5 text-[12px] font-medium transition-all duration-200",
                    activeTab === "social"
                      ? "bg-[#252535] text-ivory shadow-sm"
                      : "text-ash hover:text-ivory"
                  )}
                >
                  <span>✦</span> Social Growth
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("website");
                    setIsPaused(true);
                  }}
                  className={clsx(
                    "flex items-center justify-center gap-1.5 rounded py-1.5 text-[12px] font-medium transition-all duration-200",
                    activeTab === "website"
                      ? "bg-[#252535] text-ivory shadow-sm"
                      : "text-ash hover:text-ivory"
                  )}
                >
                  <span>⚡</span> Web Engine
                </button>
              </div>
            </div>

            {/* Content Cross-fade with AnimatePresence */}
            <div className="relative min-h-[310px] p-2">
              <AnimatePresence mode="wait">
                {activeTab === "social" ? (
                  <motion.div
                    key="social-tab"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChannelsPanel />
                  </motion.div>
                ) : (
                  <motion.div
                    key="website-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <WebPerformancePanel />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        </div>
      </section>

      {/* Intro section: Everything you post. All in one place. */}
      <section className="border-t border-white/[0.06] bg-canvas px-5 py-12">
        <div className="mx-auto max-w-sm">
          <IntroCopy />
        </div>
      </section>
    </div>
  );
}

export function ZoomHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameImgRef = useRef<HTMLImageElement>(null);
  const lastFrameIndex = useRef(-1);

  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const ticking = useRef(false);

  // Check prefers-reduced-motion safely after mount to avoid SSR hydration mismatch
  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionMq.matches);
    const onMotionChange = () => setReducedMotion(motionMq.matches);
    motionMq.addEventListener("change", onMotionChange);
    return () => motionMq.removeEventListener("change", onMotionChange);
  }, []);

  // Pre-load frames only on desktop screens when motion is enabled
  useEffect(() => {
    if (reducedMotion || typeof window === "undefined" || window.innerWidth < 768) return;
    FRAME_URLS.forEach((url) => {
      const img = new window.Image();
      img.src = url;
    });
  }, [reducedMotion]);

  // Track the stage size on desktop
  useEffect(() => {
    const el = stageRef.current;
    if (!el || reducedMotion || typeof window === "undefined" || window.innerWidth < 768) return;
    const ro = new ResizeObserver(([entry]) => {
      setStage({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || typeof window === "undefined" || window.innerWidth < 768) return;

    function update() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const next = total > 0 ? clamp01(scrolled / total) : 0;
      setProgress(next);

      const videoP = ease(mapClamp(next, 0, HANDOFF_START, 0, 1));
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.round(videoP * (FRAME_COUNT - 1))
      );
      if (frameIndex !== lastFrameIndex.current && frameImgRef.current) {
        frameImgRef.current.src = FRAME_URLS[frameIndex];
        lastFrameIndex.current = frameIndex;
      }

      ticking.current = false;
    }

    function onScroll() {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion]);

  const textOpacity = reducedMotion
    ? 1
    : 1 - mapClamp(progress, TEXT_FADE_START, TEXT_FADE_END, 0, 1);

  const layer2Opacity = reducedMotion
    ? 0
    : mapClamp(progress, HANDOFF_START, HANDOFF_END, 0, 1);

  const splitEase = ease(mapClamp(progress, HOLD_END, SPLIT_END, 0, 1));
  const layer1Opacity = reducedMotion
    ? 1
    : 1 - mapClamp(splitEase, 0, SCENE_FADE_END, 0, 1);
  const dashboardOpacity =
    1 - mapClamp(splitEase, CONTENT_CROSSFADE_START, CONTENT_CROSSFADE_END, 0, 1);
  const channelsOpacity = mapClamp(
    splitEase,
    CONTENT_CROSSFADE_START,
    CONTENT_CROSSFADE_END,
    0,
    1
  );

  let panelStyle: React.CSSProperties = {};
  let panelClip: string | undefined;
  let frameObjectPosition = "50% 50%";
  if (!reducedMotion && stage.w > 0 && stage.h > 0) {
    const from = laptopScreenRect(stage.w, stage.h);
    const to = dockRect(stage.w, stage.h);
    frameObjectPosition = `50% ${frameLayout(stage.w, stage.h).posY}%`;
    panelStyle = {
      left: lerp(from.left, to.left, splitEase),
      top: lerp(from.top, to.top, splitEase),
      width: lerp(from.width, to.width, splitEase),
      height: lerp(from.height, to.height, splitEase),
      borderRadius: lerp(from.radius, to.radius, splitEase),
      boxShadow: `0 25px 50px -12px rgba(0,0,0,${0.55 * splitEase})`,
      opacity: layer2Opacity,
    };
    const outline: Pt[] = [
      ...from.clipRight.map(([x, y]): Pt => [lerp(x, 100, splitEase), y]),
      ...[...from.clipLeft]
        .reverse()
        .map(([x, y]): Pt => [lerp(x, 0, splitEase), y]),
    ];
    panelClip = `polygon(${outline.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
  } else if (!reducedMotion) {
    panelStyle = { opacity: 0 };
  }

  const introProgress = mapClamp(splitEase, INTRO_FADE_START, 1, 0, 1);
  const introOpacity = reducedMotion ? 1 : introProgress;
  const introTranslate = reducedMotion ? 0 : lerp(16, 0, introProgress);

  return (
    <>
      {/* 1. Ultra-clean, fast, Mercury-styled mobile hero (phones & small screens) */}
      <MobileHero />

      {/* 2. Desktop experience (screens >= 768px) */}
      <div className="hidden md:block">
        {reducedMotion ? (
          <>
            <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-canvas px-6 py-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="absolute inset-0 h-full w-full object-cover"
                src={FRAME_URLS[0]}
                alt=""
                aria-hidden="true"
              />
              <FocusBlur />
              <div className="absolute inset-0" style={{ background: HERO_SCRIM }} aria-hidden="true" />
              <div className="relative z-20 flex w-full flex-col items-center">
                <HeroCopy />
              </div>
            </section>
            <section className="bg-canvas py-[72px]">
              <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-6 md:grid-cols-2">
                <IntroCopy />
                <ChannelsPanel />
              </div>
            </section>
          </>
        ) : (
          <section ref={containerRef} className="relative h-[460vh] bg-canvas">
            <div
              ref={stageRef}
              className="sticky top-0 h-screen w-full overflow-hidden"
            >
              <div className="absolute inset-0" style={{ opacity: layer1Opacity }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={frameImgRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: frameObjectPosition }}
                  src={FRAME_URLS[0]}
                  alt=""
                  aria-hidden="true"
                />
                <FocusBlur />
                <div className="absolute inset-0" style={{ background: HERO_SCRIM }} aria-hidden="true" />
                <div
                  className="relative z-20 flex h-full w-full flex-col items-center justify-center px-6"
                  style={{ opacity: textOpacity }}
                >
                  <HeroCopy />
                </div>
              </div>

              <div className="absolute" style={panelStyle}>
                <div
                  className="absolute inset-0 overflow-hidden border border-white/[0.06] bg-[#14141f]"
                  style={{ borderRadius: "inherit", clipPath: panelClip }}
                >
                  <div className="absolute inset-0" style={{ opacity: dashboardOpacity }}>
                    <DashboardMock />
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-card p-6"
                    style={{ opacity: channelsOpacity }}
                  >
                    <ChannelsPanel />
                  </div>
                </div>
              </div>

              <div
                className="absolute left-[8vw] top-1/2 w-[36vw] max-w-[460px]"
                style={{
                  opacity: introOpacity,
                  transform: `translateY(calc(-50% + ${introTranslate}px))`,
                }}
              >
                <IntroCopy />
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

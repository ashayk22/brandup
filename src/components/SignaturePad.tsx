"use client";

/**
 * SignaturePad, supplied as a reference component. Local changes: Radix icons
 * (aliased to the original names) in place of lucide-react, "motion/react" in
 * place of framer-motion, the site font, self-hosted script faces, square
 * corners, no shadows, an `allowSaving` option, and a stable default for
 * `saved` (a new [] every render re-triggered its effect).
 */
/* The previews are data URLs, which next/image cannot optimise. */
/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { IconType } from "react-icons";
import {
  RxBookmark as BookmarkCheck,
  RxCheck as Check,
  RxChevronDown as ChevronDown,
  RxEraser as Eraser,
  RxUpload as ImageUp,
  RxPencil1 as PenLine,
  RxReload as RotateCcw,
  RxTrash as Trash2,
  RxText as TypeIcon,
  RxReset as Undo2,
  RxCross2 as X,
} from "react-icons/rx";
// Signing faces, self-hosted (files download only when a face is actually shown).
import "@fontsource/caveat/600.css";
import "@fontsource/dancing-script/600.css";
import "@fontsource/great-vibes/400.css";
import "@fontsource/sacramento/400.css";
import "@fontsource/homemade-apple/400.css";

/* ==========================================================================
   SignaturePad

   Three ways to sign one document: draw it, type it, or upload a picture of
   it. Whichever you use, the panel hands back the same thing — a trimmed PNG
   and, where the mark is vector, an SVG you can scale into a contract.

   The drawn signature is the part worth reading. A signature drawn as a
   polyline looks like a polyline: same weight everywhere, blunt at both ends.
   Real ink swells where the pen presses and slows, and tapers where it lifts.
   So a stroke here is not a line at all — it is a filled outline built from
   a radius that follows stylus pressure, or, for a mouse, the speed of the
   hand. The first and last few millimetres are eased down to a point, which
   is what makes the mark read as handwriting rather than as a graph.

   Everything degrades: no stylus, and speed stands in for pressure; no
   drawing at all, and typing produces the same result shape.
   ========================================================================== */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** iOS style continuous corners, degrading to a plain radius. */
const SQUIRCLE = "";

/**
 * Inter for the interface, matching the rest of the set. Load the face once
 * in your app, e.g.
 *   @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
 * The signing faces are a separate concern and are handled below.
 */
const FONT_STACK = 'var(--font-arcadia), ui-sans-serif, system-ui, sans-serif';

const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as const;
const SOFT = { type: "spring", stiffness: 300, damping: 30 } as const;

/* --------------------------------------------------------------- types -- */

export type SignatureMethod = "draw" | "type" | "upload" | "saved";

export interface SignatureResult {
  /** Which tab produced the mark. */
  method: SignatureMethod;
  /** Trimmed PNG, transparent background, 2x for retina. */
  png: string;
  /** Vector form. Present for drawn and typed signatures. */
  svg?: string;
  /** The typed name, when the signature was typed. */
  name?: string;
  /** Ink colour used, as a CSS colour. */
  color: string;
  /** When the signature was accepted. */
  signedAt: Date;
}

/** A signature the signer has used before, ready to reuse in one click. */
export interface SavedSignature {
  id: string;
  /** Transparent PNG of the mark. */
  png: string;
  /** Vector form, when there is one. */
  svg?: string;
  /** Shown under the mark, e.g. "Full signature" or "Initials". */
  label?: string;
  /** The signer's name, carried into the result. */
  name?: string;
}

export interface Typeface {
  /** Shown in the picker. */
  name: string;
  /** CSS font-family value. */
  family: string;
}

export interface Ink {
  name: string;
  value: string;
}

export interface SignaturePadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Panel heading. */
  title?: string;
  /** Prefills the typed signature and labels the signed card. */
  signerName?: string;
  /** The line printed under the signature area. */
  consent?: string;
  /** Which tab opens first. */
  defaultMethod?: SignatureMethod;
  /** Faces offered on the Type tab. */
  typefaces?: Typeface[];
  /** Ink colours offered on every tab. */
  inks?: Ink[];
  /** Previously used signatures, offered on the Saved tab. */
  saved?: SavedSignature[];
  /**
   * Called when a new signature is kept for next time. The pad also adds it
   * to its own Saved tab, so it works with or without a store behind it.
   */
  onSaveSignature?: (signature: SavedSignature) => void;
  /** Called when one is removed on the Saved tab. */
  onDeleteSignature?: (id: string) => void;
  /**
   * Adds a stylesheet link for the default signing faces. Set false if you
   * self host them or pass your own `typefaces`.
   */
  loadFonts?: boolean;
  /** Called with the finished signature. */
  onAccept?: (result: SignatureResult) => void;
  /** Called when the panel is dismissed. */
  onCancel?: () => void;
  /** Show the signed card in place of the panel after accepting. */
  showSignedState?: boolean;
  /** Offer the Saved tab and the Save signature button. */
  allowSaving?: boolean;
}

/* ------------------------------------------------------------ defaults -- */

const DEFAULT_TYPEFACES: Typeface[] = [
  { name: "Caveat", family: '"Caveat", cursive' },
  { name: "Dancing Script", family: '"Dancing Script", cursive' },
  { name: "Great Vibes", family: '"Great Vibes", cursive' },
  { name: "Sacramento", family: '"Sacramento", cursive' },
  { name: "Homemade Apple", family: '"Homemade Apple", cursive' },
];

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Dancing+Script:wght@600&family=Great+Vibes&family=Sacramento&family=Homemade+Apple&display=swap";

const DEFAULT_INKS: Ink[] = [
  { name: "Ink", value: "#171717" },
  { name: "Blue", value: "#1d4ed8" },
  { name: "Red", value: "#b91c1c" },
];

const NO_SAVED: SavedSignature[] = [];

const DEFAULT_CONSENT =
  "By signing this document with an electronic signature, I agree that such signature is as valid as a handwritten signature to the extent allowed by local law.";

/**
 * Adds the signing faces once per document. Two pads on a page share the
 * one link, and it is never removed, because a face that disappears while a
 * signature is on screen would reflow the mark.
 */
function useSigningFonts(enabled: boolean) {
  React.useEffect(() => {
    if (!enabled || typeof document === "undefined") return;
    if (document.querySelector('link[data-signature-faces="true"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    link.setAttribute("data-signature-faces", "true");
    document.head.appendChild(link);
  }, [enabled]);
}


/* ---------------------------------------------------------------- theme --
   Ink is chosen for the document, which is white — so on a dark panel the
   very ink that will be printed would be invisible. The stored colour never
   changes; only its rendering is lifted for the screen, the same trick the
   signed card plays on its exported PNG.
   -------------------------------------------------------------------- */

/** Any CSS colour resolved to rgb, by letting the canvas do the parsing. */
function toRgb(css: string): [number, number, number] | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

const relLuminance = ([r, g, b]: [number, number, number]) =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/** Same ink, lifted enough to read on a dark surface. */
function inkOnScreen(color: string, dark: boolean): string {
  if (!dark) return color;
  const rgb = toRgb(color);
  if (!rgb || relLuminance(rgb) > 0.5) return color;
  const mix = (v: number) => Math.round(v + (255 - v) * 0.72);
  return `rgb(${mix(rgb[0])} ${mix(rgb[1])} ${mix(rgb[2])})`;
}

/**
 * Whether the panel is sitting on a dark surface. Read off its own painted
 * background rather than a class name, so it works whether dark mode comes
 * from a class, a data attribute or the media query — and through the canvas,
 * because a modern stylesheet reports its colours in oklch, not rgb.
 */
function useOnDark(ref: React.RefObject<HTMLElement | null>) {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    const read = () => {
      const el = ref.current;
      if (!el) return;
      const rgb = toRgb(getComputedStyle(el).backgroundColor);
      if (rgb) setDark(relLuminance(rgb) < 0.5);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener?.("change", read);
    return () => {
      mo.disconnect();
      mq.removeEventListener?.("change", read);
    };
  }, [ref]);
  return dark;
}

/* ============================================================== geometry ==

   A stroke is a list of points carrying a pressure. Turning it into ink is
   three steps: work out a radius at every point, walk the line offsetting
   that radius to either side, then join the two sides into one closed
   outline that gets filled. Filling an outline rather than stroking a path
   is what allows the width to vary at all.
   ========================================================================== */

interface Pt {
  x: number;
  y: number;
  /** 0..1. Real stylus pressure where there is one, speed derived otherwise. */
  p: number;
}

export interface Stroke {
  points: Pt[];
  color: string;
  size: number;
}

const num = (n: number) => Math.round(n * 100) / 100;

/** Three point moving average. Enough to take the stair steps off a mouse. */
function smooth(points: Pt[]): Pt[] {
  if (points.length < 3) return points;
  const out: Pt[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1];
    const b = points[i];
    const c = points[i + 1];
    out.push({
      x: (a.x + b.x * 2 + c.x) / 4,
      y: (a.y + b.y * 2 + c.y) / 4,
      p: (a.p + b.p * 2 + c.p) / 4,
    });
  }
  out.push(points[points.length - 1]);
  return out;
}

const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

/**
 * The outline of one stroke as an SVG path. The same string is used for the
 * canvas (through Path2D) and for the exported SVG, so what is drawn and
 * what is downloaded can never drift apart.
 */
function strokePath(stroke: Stroke): string {
  const pts = smooth(stroke.points);
  const base = stroke.size / 2;

  if (pts.length === 1) {
    const { x, y, p } = pts[0];
    const r = num(base * (0.4 + 0.6 * p));
    // a dot: two half arcs
    return `M ${num(x - r)} ${num(y)} a ${r} ${r} 0 1 0 ${num(r * 2)} 0 a ${r} ${r} 0 1 0 ${num(-r * 2)} 0 Z`;
  }

  // arc length at each point, for tapering the ends
  const len: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  const total = len[len.length - 1];
  // taper over a few nib widths, but never more than half the stroke, or a
  // short flick would be tapered out of existence
  const taper = Math.min(stroke.size * 3.5, total / 2);

  const left: Array<[number, number]> = [];
  const right: Array<[number, number]> = [];

  for (let i = 0; i < pts.length; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    let dx = next.x - prev.x;
    let dy = next.y - prev.y;
    const d = Math.hypot(dx, dy) || 1;
    dx /= d;
    dy /= d;

    const fromStart = taper > 0 ? Math.min(1, len[i] / taper) : 1;
    const fromEnd = taper > 0 ? Math.min(1, (total - len[i]) / taper) : 1;
    const r = base * (0.32 + 0.68 * pts[i].p) * easeOut(Math.min(fromStart, fromEnd));

    // normal to the direction of travel
    left.push([pts[i].x - dy * r, pts[i].y + dx * r]);
    right.push([pts[i].x + dy * r, pts[i].y - dx * r]);
  }

  return `${side(left)} ${side(right.reverse(), true)} Z`;
}

/** One side of the outline, drawn through the midpoints so the joins are soft. */
function side(points: Array<[number, number]>, continued = false): string {
  const [first, ...rest] = points;
  let d = `${continued ? "L" : "M"} ${num(first[0])} ${num(first[1])}`;
  for (let i = 0; i < rest.length - 1; i++) {
    const [x, y] = rest[i];
    const [nx, ny] = rest[i + 1];
    d += ` Q ${num(x)} ${num(y)} ${num((x + nx) / 2)} ${num((y + ny) / 2)}`;
  }
  const last = rest[rest.length - 1];
  if (last) d += ` L ${num(last[0])} ${num(last[1])}`;
  return d;
}

/** Bounding box of the ink, padded, for trimming an export. */
function bounds(strokes: Stroke[], pad = 10) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const s of strokes) {
    const r = s.size / 2;
    for (const pt of s.points) {
      x0 = Math.min(x0, pt.x - r);
      y0 = Math.min(y0, pt.y - r);
      x1 = Math.max(x1, pt.x + r);
      y1 = Math.max(y1, pt.y + r);
    }
  }
  if (!isFinite(x0)) return null;
  return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
}

function strokesToSvg(strokes: Stroke[]): string | undefined {
  const b = bounds(strokes);
  if (!b) return undefined;
  const paths = strokes
    .map(
      (s) =>
        `<path d="${strokePath({ ...s, points: s.points.map((p) => ({ ...p, x: p.x - b.x, y: p.y - b.y })) })}" fill="${s.color}"/>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${num(b.w)}" height="${num(b.h)}" viewBox="0 0 ${num(b.w)} ${num(b.h)}">${paths}</svg>`;
}

function strokesToPng(strokes: Stroke[], scale = 2): string | undefined {
  const b = bounds(strokes);
  if (!b) return undefined;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(b.w * scale);
  canvas.height = Math.ceil(b.h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;
  ctx.scale(scale, scale);
  ctx.translate(-b.x, -b.y);
  for (const s of strokes) {
    ctx.fillStyle = s.color;
    ctx.fill(new Path2D(strokePath(s)));
  }
  return canvas.toDataURL("image/png");
}

/* ============================================================ draw board == */

function DrawBoard({
  strokes,
  setStrokes,
  color,
  onDark,
  disabled,
}: {
  strokes: Stroke[];
  setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
  color: string;
  onDark: boolean;
  disabled?: boolean;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const liveRef = React.useRef<Stroke | null>(null);
  const lastRef = React.useRef<{ x: number; y: number; t: number; p: number } | null>(null);
  const [drawing, setDrawing] = React.useState(false);

  const SIZE = 6;

  /** Paints every committed stroke plus the one in progress. */
  const paint = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    const all = liveRef.current ? [...strokes, liveRef.current] : strokes;
    for (const s of all) {
      ctx.fillStyle = inkOnScreen(s.color, onDark);
      ctx.fill(new Path2D(strokePath(s)));
    }
  }, [strokes, onDark]);

  /* The canvas is sized in device pixels and scaled back down, so the ink is
     sharp on retina screens. It has to be re-measured on resize. */
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      paint();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [paint]);

  React.useEffect(paint, [paint]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    /* A pen reports pressure. A mouse reports 0.5 for every point, so the
       hand's speed stands in for it: fast is light, slow is heavy. The value
       is eased toward its target, otherwise a single jittery sample puts a
       blob in the middle of a line. */
    let p: number;
    const now = performance.now();
    const last = lastRef.current;
    if (e.pointerType === "pen" && e.pressure > 0 && e.pressure !== 0.5) {
      p = e.pressure;
    } else if (last) {
      const dt = Math.max(1, now - last.t);
      const speed = Math.hypot(x - last.x, y - last.y) / dt; // px per ms
      const target = Math.max(0.28, Math.min(1, 1 - speed / 2.4));
      p = last.p + (target - last.p) * 0.45;
    } else {
      p = 0.65;
    }
    lastRef.current = { x, y, t: now, p };
    return { x, y, p };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    lastRef.current = null;
    liveRef.current = { points: [point(e)], color, size: SIZE };
    setDrawing(true);
    paint();
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const live = liveRef.current;
    if (!live) return;
    const pt = point(e);
    const prev = live.points[live.points.length - 1];
    // drop samples that have barely moved: they add cost and jitter, not shape
    if (Math.hypot(pt.x - prev.x, pt.y - prev.y) < 1.1) return;
    live.points.push(pt);
    paint();
  };

  const end = () => {
    const live = liveRef.current;
    liveRef.current = null;
    lastRef.current = null;
    setDrawing(false);
    if (live && live.points.length) setStrokes((s) => [...s, live]);
  };

  const empty = strokes.length === 0 && !drawing;

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={end}
        onPointerCancel={end}
        role="img"
        aria-label="Signature drawing area"
        className={cn(
          "block h-[196px] w-full touch-none",
          disabled ? "cursor-default" : "cursor-crosshair",
        )}
      />
      {/* the ruled line, and the hint that sits on it until the first mark */}
      <div className="pointer-events-none absolute inset-x-8 bottom-[52px] select-none">
        <div className="h-px w-full bg-black/[0.12] dark:bg-white/20" />
        <AnimatePresence>
          {empty && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="m-0 mt-2 text-center text-[12.5px] text-neutral-400 dark:text-neutral-500"
            >
              Draw your signature above the line
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============================================================= typeface == */

/**
 * Script faces disagree wildly about how big a given font size is — set
 * Homemade Apple and Caveat at one size and the first towers over the second.
 * This levels them on x-height, measured from a lowercase x rather than from
 * each face's own name: a name full of swashes and descenders would otherwise
 * shrink its own face, and x-height is what the eye actually reads as size.
 */
function useLevelledSizes(faces: Typeface[], capHeight: number) {
  const [sizes, setSizes] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    let cancelled = false;

    const measure = () => {
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      const next: Record<string, number> = {};
      for (const face of faces) {
        ctx.font = `100px ${face.family}`;
        const x = ctx.measureText("x").actualBoundingBoxAscent || 45;
        next[face.name] = Math.round(Math.max(14, Math.min(26, (capHeight / x) * 100)));
      }
      if (!cancelled) setSizes(next);
    };

    measure();
    // fallbacks measure nothing like the face they stand in for
    if ("fonts" in document) document.fonts.ready.then(() => !cancelled && measure());
    return () => {
      cancelled = true;
    };
  }, [faces, capHeight]);

  return sizes;
}

function TypefacePicker({
  faces,
  value,
  onChange,
}: {
  faces: Typeface[];
  value: Typeface;
  onChange: (t: Typeface) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const boxRef = React.useRef<HTMLDivElement | null>(null);
  const sizes = useLevelledSizes(faces, 8);

  React.useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-card px-2.5 text-[12.5px] font-medium",
          "text-neutral-600 transition-colors hover:bg-black/[0.05] hover:text-neutral-900",
          "dark:text-neutral-300 dark:hover:bg-white/[0.08] dark:hover:text-neutral-50",
          open && "bg-black/[0.05] dark:bg-white/[0.08]",
          SQUIRCLE,
        )}
      >
        {/* the trigger sits in a 32px row, so it takes the same levelled size
            scaled down rather than a size of its own */}
        <span
          style={{
            fontFamily: value.family,
            fontSize: Math.round((sizes[value.name] ?? 20) * 0.78),
          }}
          className="leading-none"
        >
          {value.name}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={SOFT} className="flex">
          <ChevronDown aria-hidden className="h-3.5 w-3.5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={SOFT}
            className={cn(
              "absolute left-0 top-[calc(100%+6px)] z-20 m-0 flex w-[212px] list-none flex-col gap-[2px] overflow-hidden p-1",
              "rounded-card border border-black/[0.07] bg-white",
              "dark:border-white/[0.09] dark:bg-card",
              SQUIRCLE,
            )}
          >
            {faces.map((f) => {
              const active = f.name === value.name;
              return (
                <li key={f.name}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(f);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex h-[34px] w-full items-center justify-between gap-2 rounded-card px-2.5 text-left",
                      "transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.07]",
                      active && "bg-black/[0.05] dark:bg-white/[0.07]",
                      SQUIRCLE,
                    )}
                  >
                    <span
                      style={{ fontFamily: f.family, fontSize: sizes[f.name] ?? 18 }}
                      className="truncate leading-none text-neutral-800 dark:text-neutral-100"
                    >
                      {f.name}
                    </span>
                    {active && (
                      <Check aria-hidden className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== type == */

/**
 * The largest size at which the name fits the line, measured from the glyphs
 * themselves rather than the font size. Script faces carry huge ascenders and
 * descenders — Great Vibes draws well past both edges of its em box — so
 * sizing on font-size alone is what clips the tops off capitals.
 */
function fitText(text: string, family: string, maxWidth: number, maxHeight: number, cap = 44) {
  const fallback = { size: cap, ascent: cap * 0.8, descent: cap * 0.2 };
  if (!text.trim() || typeof document === "undefined") return fallback;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return fallback;
  ctx.font = `100px ${family}`;
  const m = ctx.measureText(text);
  const w = m.width || 1;
  // real ink extents where the browser reports them, em box otherwise
  const ascent = m.actualBoundingBoxAscent || 80;
  const descent = m.actualBoundingBoxDescent || 20;
  const size = Math.max(16, Math.min(cap, (maxWidth / w) * 100, (maxHeight / (ascent + descent)) * 100));
  return { size, ascent: (ascent * size) / 100, descent: (descent * size) / 100 };
}

function TypeBoard({
  value,
  onChange,
  face,
  color,
  onDark,
  reduceMotion,
}: {
  value: string;
  onChange: (v: string) => void;
  face: Typeface;
  color: string;
  onDark: boolean;
  reduceMotion: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const lineRef = React.useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = React.useState(() => ({ size: 44, ascent: 35, descent: 9 }));
  const [focused, setFocused] = React.useState(false);

  const BOX = 124; // room above the ruled line

  /* Re-measured when the text, the face or the width changes — and once more
     when the face finishes downloading, because a fallback measures nothing
     like the face it stands in for. */
  React.useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const measure = () => setFit(fitText(value, face.family, el.clientWidth - 10, BOX - 12));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => !cancelled && measure());
    }
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [value, face.family]);

  return (
    <div
      className="relative h-[196px] cursor-text px-8"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="absolute inset-x-8 bottom-[52px]">
        {/* the box ends where the ruled line is, and the name is padded down
            by its own descender, which puts the baseline on the line and lets
            the tails cross it the way handwriting does */}
        <div
          ref={lineRef}
          style={{ height: BOX }}
          className="flex items-end justify-center"
        >
          <span
            style={{
              fontFamily: face.family,
              color: inkOnScreen(color, onDark),
              fontSize: fit.size,
              paddingBottom: Math.round(fit.descent),
            }}
            className="block whitespace-nowrap leading-none"
          >
            {value}
          </span>
          {focused && (
            <motion.span
              aria-hidden
              style={{ height: Math.max(18, fit.ascent), marginBottom: Math.round(fit.descent) }}
              animate={reduceMotion ? undefined : { opacity: [1, 1, 0, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
              className="ml-[3px] w-px shrink-0 bg-neutral-400 dark:bg-neutral-500"
            />
          )}
        </div>
        <div className="h-px w-full bg-black/[0.12] dark:bg-white/20" />
        {!value && (
          <p className="pointer-events-none m-0 mt-2 text-center text-[12.5px] text-neutral-400 dark:text-neutral-500">
            Type your full name
          </p>
        )}
      </div>

      {/* the real field: invisible, but where the typing lives */}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Type your signature"
        maxLength={40}
        style={{ height: BOX }}
        className="absolute inset-x-8 bottom-[52px] w-auto bg-transparent text-center text-[15px] text-transparent caret-transparent outline-none"
      />
    </div>
  );
}

/* ================================================================ upload == */

/**
 * Crops the transparent-ish border off an uploaded signature and knocks the
 * paper out from behind it, so a photo of a signed page drops onto a
 * document without a white rectangle around it.
 */
async function cleanUpload(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("could not read that image"));
      el.src = url;
    });

    const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("no canvas");
    ctx.drawImage(img, 0, 0, w, h);

    const data = ctx.getImageData(0, 0, w, h);
    const px = data.data;
    let x0 = w;
    let y0 = h;
    let x1 = -1;
    let y1 = -1;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        // paper becomes transparent, ink stays; the ramp keeps edges soft
        const alpha = Math.max(0, Math.min(255, (245 - lum) * 1.9));
        px[i + 3] = Math.min(px[i + 3], alpha);
        if (alpha > 24) {
          if (x < x0) x0 = x;
          if (y < y0) y0 = y;
          if (x > x1) x1 = x;
          if (y > y1) y1 = y;
        }
      }
    }
    ctx.putImageData(data, 0, 0);

    if (x1 < 0) return canvas.toDataURL("image/png"); // nothing found, keep it whole

    const pad = 6;
    x0 = Math.max(0, x0 - pad);
    y0 = Math.max(0, y0 - pad);
    x1 = Math.min(w - 1, x1 + pad);
    y1 = Math.min(h - 1, y1 + pad);

    const out = document.createElement("canvas");
    out.width = x1 - x0 + 1;
    out.height = y1 - y0 + 1;
    out.getContext("2d")!.drawImage(canvas, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
    return out.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

function UploadBoard({
  image,
  setImage,
  error,
  setError,
}: {
  image: string | null;
  setImage: (v: string | null) => void;
  error: string | null;
  setError: (v: string | null) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [over, setOver] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const take = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file is not an image.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setImage(await cleanUpload(file));
    } catch {
      setError("That image could not be read.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-[196px] items-center justify-center px-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => take(e.target.files?.[0])}
      />

      {image ? (
        <div className="flex w-full flex-col items-center gap-2">
          <img
            src={image}
            alt="Uploaded signature"
            className="max-h-[118px] max-w-full object-contain dark:invert"
          />
          <div className="flex items-center gap-1.5">
            <GhostButton onClick={() => inputRef.current?.click()} icon={ImageUp}>
              Replace
            </GhostButton>
            <GhostButton onClick={() => setImage(null)} icon={Trash2}>
              Remove
            </GhostButton>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            take(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex h-[156px] w-full flex-col items-center justify-center gap-2 rounded-card border border-dashed",
            "transition-colors duration-150",
            over
              ? "border-neutral-400 bg-black/[0.04] dark:border-white/30 dark:bg-white/[0.06]"
              : "border-neutral-300 hover:bg-black/[0.02] dark:border-white/15 dark:hover:bg-white/[0.03]",
            SQUIRCLE,
          )}
        >
          <motion.span animate={{ y: over ? -2 : 0 }} transition={SOFT} className="flex">
            <ImageUp aria-hidden className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
          </motion.span>
          <span className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200">
            {busy ? "Reading image…" : "Drop an image, or browse"}
          </span>
          <span className="text-[11.5px] text-neutral-400 dark:text-neutral-500">
            PNG or JPG. The paper behind it is removed for you.
          </span>
          {error && <span className="text-[11.5px] text-rose-600 dark:text-rose-400">{error}</span>}
        </button>
      )}
    </div>
  );
}

/* ================================================================= saved == */

function SavedBoard({
  saved,
  selected,
  onSelect,
  onDelete,
  onDark,
}: {
  saved: SavedSignature[];
  selected: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDark: boolean;
}) {
  if (!saved.length) {
    return (
      <div className="flex h-[196px] flex-col items-center justify-center gap-1.5 px-8 text-center">
        <BookmarkCheck aria-hidden className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
        <p className="m-0 text-[13px] font-medium text-neutral-700 dark:text-neutral-200">
          Nothing saved yet
        </p>
        <p className="m-0 text-[11.5px] text-neutral-400 dark:text-neutral-500">
          Draw or type one, then press Save signature.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[196px] overflow-y-auto p-3">
      <div className="grid grid-cols-2 gap-2">
        {saved.map((sig) => {
          const active = sig.id === selected;
          return (
            <button
              key={sig.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(sig.id)}
              className={cn(
                "group relative flex h-[84px] flex-col items-center justify-center gap-1 rounded-card border px-3",
                "transition-colors duration-150",
                active
                  ? "border-neutral-900 bg-white dark:border-neutral-100 dark:bg-white/[0.08]"
                  : "border-black/[0.08] bg-white hover:border-black/20 dark:border-white/[0.1] dark:bg-white/[0.03] dark:hover:border-white/25",
                SQUIRCLE,
              )}
            >
              <img
                src={sig.png}
                alt={sig.label ?? "Saved signature"}
                className={cn("max-h-[44px] max-w-full object-contain", onDark && "invert")}
              />
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {sig.label ?? "Signature"}
              </span>
              <AnimatePresence>
                {active && (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={SPRING}
                    className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  >
                    <Check aria-hidden className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </motion.span>
                )}
              </AnimatePresence>

              {/* removing is a stated option, not a hover secret */}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Remove ${sig.label ?? "signature"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(sig.id);
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(sig.id);
                }}
                className={cn(
                  "absolute left-1.5 top-1.5 grid h-[22px] w-[22px] place-items-center rounded-card",
                  "text-neutral-400 transition-colors duration-150",
                  "hover:bg-black/[0.06] hover:text-neutral-800",
                  "dark:text-neutral-500 dark:hover:bg-white/[0.1] dark:hover:text-neutral-100",
                  SQUIRCLE,
                )}
              >
                <Trash2 aria-hidden className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================ pieces == */

function GhostButton({
  onClick,
  icon: Icon,
  children,
  disabled,
}: {
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-card px-2.5 text-[12.5px] font-medium",
        "text-neutral-600 transition-colors hover:bg-black/[0.05] hover:text-neutral-900",
        "dark:text-neutral-300 dark:hover:bg-white/[0.08] dark:hover:text-neutral-50",
        "disabled:pointer-events-none disabled:opacity-40",
        SQUIRCLE,
      )}
    >
      {Icon && <Icon aria-hidden className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

function InkSwatches({
  inks,
  value,
  onChange,
}: {
  inks: Ink[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Ink colour" className="flex items-center gap-1.5">
      {inks.map((ink) => {
        const active = ink.value === value;
        return (
          <button
            key={ink.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={ink.name}
            onClick={() => onChange(ink.value)}
            className="grid h-7 w-7 place-items-center rounded-full transition-transform duration-150 hover:scale-110"
          >
            <span
              style={{ backgroundColor: ink.value }}
              className={cn(
                "grid h-[18px] w-[18px] place-items-center rounded-full",
                "ring-offset-2 ring-offset-white transition-all duration-150 dark:ring-offset-card",
                active ? "ring-2 ring-black/25 dark:ring-white/40" : "ring-0",
              )}
            >
              <AnimatePresence>
                {active && (
                  <motion.span
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={SPRING}
                    className="flex"
                  >
                    <Check aria-hidden className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
        );
      })}
    </div>
  );
}

const TABS: Array<{ id: SignatureMethod; label: string; icon: IconType }> = [
  { id: "draw", label: "Draw", icon: PenLine },
  { id: "type", label: "Type", icon: TypeIcon },
  { id: "upload", label: "Upload", icon: ImageUp },
  { id: "saved", label: "Saved", icon: BookmarkCheck },
];

function Tabs({
  value,
  onChange,
  tabs,
}: {
  value: SignatureMethod;
  onChange: (m: SignatureMethod) => void;
  tabs: typeof TABS;
}) {
  /* the sliding pill is a shared layout animation, so each pad needs its own
     id — two pads on one page would otherwise throw the pill from one panel
     to the other */
  const uid = React.useId();

  return (
    <div
      role="tablist"
      aria-label="Signature method"
      className={cn(
        "grid w-full gap-1 rounded-card p-1",
        "bg-neutral-100 dark:bg-white/[0.04]",
        SQUIRCLE,
      )}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const i = tabs.findIndex((t) => t.id === value);
              const next = (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
              onChange(tabs[next].id);
            }}
            className={cn(
              "relative flex h-[32px] min-w-0 items-center justify-center gap-1.5 rounded-card px-2",
              "text-[12.5px] transition-colors duration-150",
              /* weight carries as much of the selected state as the pill does:
                 the active tab is darker and heavier, the rest recede */
              active
                ? "font-semibold text-neutral-900 dark:text-white"
                : "font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200",
              SQUIRCLE,
            )}
          >
            {active && (
              <motion.span
                layoutId={`signature-tab-${uid}`}
                transition={SPRING}
                /* A solid fill, a hairline edge and a soft shadow: the pill is
                   lifted off the track the way a card sits above the board.
                   It is painted first and the label sits above it — a negative
                   z-index would drop it behind the track's own background. */
                className={cn(
                  "absolute inset-0 rounded-card",
                  "bg-white",
                  "dark:bg-neutral-700",
                  SQUIRCLE,
                )}
              />
            )}
            <tab.icon aria-hidden className="relative h-3.5 w-3.5 shrink-0" />
            <span className="relative truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================== root == */

export const SignaturePad = React.forwardRef<HTMLDivElement, SignaturePadProps>(
  function SignaturePad(
    {
      title = "Signature",
      signerName = "",
      consent = DEFAULT_CONSENT,
      defaultMethod = "draw",
      typefaces = DEFAULT_TYPEFACES,
      inks = DEFAULT_INKS,
      saved = NO_SAVED,
      onSaveSignature,
      onDeleteSignature,
      loadFonts = false,
      onAccept,
      onCancel,
      showSignedState = true,
      allowSaving = true,
      className,
      style,
      ...props
    },
    ref,
  ) {
    useSigningFonts(loadFonts);
    const reduceMotion = useReducedMotion();

    /* the panel keeps its own handle on the root so it can read the surface
       it was dropped on, while still honouring a forwarded ref */
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const setRoot = React.useCallback(
      (el: HTMLDivElement | null) => {
        rootRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      },
      [ref],
    );
    const onDark = useOnDark(rootRef);

    const [method, setMethod] = React.useState<SignatureMethod>(defaultMethod);
    const [color, setColor] = React.useState(inks[0]?.value ?? "#171717");

    const [strokes, setStrokes] = React.useState<Stroke[]>([]);
    const [typed, setTyped] = React.useState(signerName);
    const [face, setFace] = React.useState<Typeface>(typefaces[0]);
    const [image, setImage] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    /* the prop seeds the list; the pad keeps its own copy so a signature
       saved here appears on the Saved tab straight away, whether or not a
       store is wired up behind onSaveSignature */
    const [library, setLibrary] = React.useState<SavedSignature[]>(saved);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reference behaviour: the prop reseeds the list
    React.useEffect(() => setLibrary(saved), [saved]);
    const [pick, setPick] = React.useState<string | null>(saved[0]?.id ?? null);
    const [justSaved, setJustSaved] = React.useState(false);

    const [signed, setSigned] = React.useState<SignatureResult | null>(null);

    /* The Saved tab is always there. Removing the last signature must not
       pull the tab out from under the signer standing on it — the tab stays
       and states that it is empty. */
    const tabs = allowSaving ? TABS : TABS.filter((t) => t.id !== "saved");

    const chosen = library.find((sig) => sig.id === pick) ?? null;

    const ready =
      method === "draw"
        ? strokes.length > 0
        : method === "type"
          ? typed.trim().length > 0
          : method === "upload"
            ? !!image
            : !!chosen;

    const clear = () => {
      if (method === "draw") setStrokes([]);
      else if (method === "type") setTyped("");
      else setImage(null);
    };

    /** Types the name onto a canvas at the chosen face, then trims it. */
    const typedToPng = (): string | undefined => {
      const text = typed.trim();
      if (!text) return undefined;
      const font = `${Math.round(fitText(text, face.family, 560, 96, 64).size)}px ${face.family}`;
      const probe = document.createElement("canvas").getContext("2d");
      if (!probe) return undefined;
      probe.font = font;
      const m = probe.measureText(text);
      const w = Math.ceil(m.width) + 40;
      const h = 120;
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return undefined;
      ctx.scale(scale, scale);
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textBaseline = "middle";
      ctx.fillText(text, 20, h / 2);
      return canvas.toDataURL("image/png");
    };

    /** The mark as it stands, whichever tab made it. */
    const compose = (): SignatureResult | null => {
      const signedAt = new Date();
      let result: SignatureResult | null = null;

      if (method === "draw") {
        const png = strokesToPng(strokes);
        if (png) result = { method, png, svg: strokesToSvg(strokes), color, signedAt };
      } else if (method === "type") {
        const png = typedToPng();
        const text = typed.trim();
        if (png)
          result = {
            method,
            png,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="120"><text x="20" y="72" font-family="${face.family.replace(/"/g, "'")}" font-size="56" fill="${color}">${text.replace(/[<&>]/g, "")}</text></svg>`,
            name: text,
            color,
            signedAt,
          };
      } else if (method === "upload" && image) {
        result = { method, png: image, color, signedAt };
      } else if (method === "saved" && chosen) {
        result = {
          method,
          png: chosen.png,
          svg: chosen.svg,
          name: chosen.name ?? (signerName || undefined),
          color,
          signedAt,
        };
      }

      return result;
    };

    /* Saving is its own decision, taken before signing: the signer keeps the
       mark for next time, then signs — or signs without keeping it. */
    const save = () => {
      const result = compose();
      if (!result || result.method === "saved") return;
      const entry: SavedSignature = {
        id: `sig-${result.signedAt.getTime()}`,
        png: result.png,
        svg: result.svg,
        name: result.name ?? (signerName || undefined),
        label:
          result.method === "type"
            ? result.name || "Typed signature"
            : result.method === "upload"
              ? "Uploaded"
              : "Drawn signature",
      };
      setLibrary((list) => [entry, ...list].slice(0, 8));
      setPick(entry.id);
      onSaveSignature?.(entry);
      setJustSaved(true);
    };

    /* the confirmation on the Save button clears itself, and clears early if
       the mark changes underneath it */
    React.useEffect(() => {
      if (!justSaved) return;
      const t = window.setTimeout(() => setJustSaved(false), 1800);
      return () => window.clearTimeout(t);
    }, [justSaved]);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reference behaviour: the "Saved" badge clears when the mark changes
    React.useEffect(() => setJustSaved(false), [method, strokes, typed, image, face, color]);

    const accept = () => {
      const result = compose();
      if (!result) return;
      onAccept?.(result);
      if (showSignedState) setSigned(result);
    };

    const reset = () => {
      setSigned(null);
      setStrokes([]);
      setImage(null);
      setError(null);
    };

    /* ------------------------------------------------------------ signed */

    if (signed && showSignedState) {
      return (
        <motion.div
          ref={setRoot}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING}
          style={{ "--sig-font": FONT_STACK, fontFamily: "var(--sig-font)", ...style } as React.CSSProperties}
          className={cn(
            "w-full max-w-[520px] overflow-hidden rounded-card border p-5 text-neutral-950 antialiased",
            "border-black/[0.07] bg-white",
            "dark:border-white/[0.08] dark:bg-card dark:text-neutral-50",
            SQUIRCLE,
            className,
          )}
          {...(props as React.ComponentProps<typeof motion.div>)}
        >
          <div className="flex items-center gap-2">
            <motion.span
              initial={reduceMotion ? false : { scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ ...SPRING, delay: 0.05 }}
              className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
            >
              <Check aria-hidden className="h-3 w-3" strokeWidth={3} />
            </motion.span>
            <span className="text-[13px] font-medium">Signed</span>
            <span className="ml-auto text-[11.5px] tabular-nums text-neutral-400 dark:text-neutral-500">
              {signed.signedAt.toLocaleString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div
            className={cn(
              "mt-4 flex h-[132px] items-end justify-center rounded-card px-6 pb-4",
              "bg-neutral-100/70 dark:bg-white/[0.04]",
              SQUIRCLE,
            )}
          >
            <motion.img
              src={signed.png}
              alt="Your signature"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.08 }}
              className="max-h-[92px] max-w-full object-contain dark:invert"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="m-0 text-[13px] font-medium">
                {signed.name || signerName || "Signature on file"}
              </p>
              <p className="m-0 mt-0.5 text-[11.5px] text-neutral-500 dark:text-neutral-400">
                {signed.method === "draw"
                  ? "Drawn"
                  : signed.method === "type"
                    ? "Typed"
                    : signed.method === "upload"
                      ? "Uploaded"
                      : "Saved signature"}
              </p>
            </div>
            <GhostButton onClick={reset} icon={RotateCcw}>
              Sign again
            </GhostButton>
          </div>
        </motion.div>
      );
    }

    /* ------------------------------------------------------------- panel */

    return (
      <div
        ref={setRoot}
        style={{ "--sig-font": FONT_STACK, fontFamily: "var(--sig-font)", ...style } as React.CSSProperties}
        className={cn(
          "w-full max-w-[520px] overflow-hidden rounded-card border text-neutral-950 antialiased",
          "border-black/[0.07] bg-white",
          "dark:border-white/[0.08] dark:bg-card dark:text-neutral-50",
          SQUIRCLE,
          className,
        )}
        {...props}
      >
        {/* header */}
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="m-0 text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className={cn(
              "grid h-7 w-7 place-items-center rounded-card text-neutral-400 transition-colors",
              "hover:bg-black/[0.06] hover:text-neutral-800",
              "dark:text-neutral-500 dark:hover:bg-white/[0.1] dark:hover:text-neutral-100",
              SQUIRCLE,
            )}
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3.5 px-4">
          <Tabs value={method} onChange={setMethod} tabs={tabs} />
        </div>

        <div className="mt-4 h-px bg-black/[0.06] dark:bg-white/[0.08]" />

        {/* toolbar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            {method === "type" ? (
              <TypefacePicker faces={typefaces} value={face} onChange={setFace} />
            ) : method === "draw" ? (
              <div className="flex items-center gap-0.5">
                <GhostButton
                  onClick={() => setStrokes((s) => s.slice(0, -1))}
                  icon={Undo2}
                  disabled={!strokes.length}
                >
                  Undo
                </GhostButton>
                <GhostButton onClick={clear} icon={Eraser} disabled={!strokes.length}>
                  Clear
                </GhostButton>
              </div>
            ) : method === "upload" ? (
              <span className="text-[12.5px] text-neutral-400 dark:text-neutral-500">
                A photo or scan of your signature
              </span>
            ) : (
              <span className="text-[12.5px] text-neutral-400 dark:text-neutral-500">
                {library.length ? "Pick one and sign" : "Nothing saved yet"}
              </span>
            )}
          </div>
          {(method === "draw" || method === "type") && (
            <InkSwatches inks={inks} value={color} onChange={setColor} />
          )}
        </div>

        {/* the signing surface */}
        <div className="px-4">
          <div
            className={cn(
              "overflow-hidden rounded-card bg-neutral-100/70 dark:bg-white/[0.04]",
              SQUIRCLE,
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={method}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                {method === "draw" && (
                  <DrawBoard
                    strokes={strokes}
                    setStrokes={setStrokes}
                    color={color}
                    onDark={onDark}
                  />
                )}

                {method === "type" && (
                  <TypeBoard
                    value={typed}
                    onChange={setTyped}
                    face={face}
                    color={color}
                    onDark={onDark}
                    reduceMotion={!!reduceMotion}
                  />
                )}

                {method === "upload" && (
                  <UploadBoard
                    image={image}
                    setImage={setImage}
                    error={error}
                    setError={setError}
                  />
                )}

                {method === "saved" && (
                  <SavedBoard
                    saved={library}
                    selected={pick}
                    onSelect={setPick}
                    onDelete={(id) => {
                      setLibrary((list) => list.filter((sig) => sig.id !== id));
                      setPick((current) => (current === id ? null : current));
                      onDeleteSignature?.(id);
                    }}
                    onDark={onDark}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* consent */}
        <p className="m-0 px-4 pb-4 pt-3 text-[11.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {consent}
        </p>

        <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

        {/* actions */}
        <div className="flex items-center justify-end gap-2 px-4 py-3">
          {method !== "saved" && allowSaving && (
            <div className="mr-auto">
              <GhostButton
                onClick={save}
                disabled={!ready || justSaved}
                icon={justSaved ? Check : BookmarkCheck}
              >
                {justSaved ? "Saved" : "Save signature"}
              </GhostButton>
            </div>
          )}
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "inline-flex h-9 items-center rounded-card px-3 text-[13px] font-medium",
              "text-neutral-600 transition-colors hover:bg-black/[0.05] hover:text-neutral-900",
              "dark:text-neutral-300 dark:hover:bg-white/[0.08] dark:hover:text-neutral-50",
              SQUIRCLE,
            )}
          >
            Cancel
          </button>
          <motion.button
            type="button"
            onClick={accept}
            disabled={!ready}
            whileTap={ready && !reduceMotion ? { scale: 0.97 } : undefined}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-card px-3.5 text-[13px] font-medium",
              "bg-neutral-900 text-white transition-colors hover:bg-neutral-800",
              "dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-white",
              "disabled:pointer-events-none disabled:opacity-35",
              SQUIRCLE,
            )}
          >
            <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.75} />
            Accept and sign
          </motion.button>
        </div>
      </div>
    );
  },
);

export default SignaturePad;

export { SignaturePad as Component };

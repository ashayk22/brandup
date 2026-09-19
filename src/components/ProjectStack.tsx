"use client";

/**
 * Scroll-driven card stack adapted from Componentry's CaseStudyFlipStack
 * (https://componentry.dev, MIT). Each full-width card folds upward as you
 * scroll, revealing the next one underneath.
 * Local changes: only the stack is kept (no intro or closing screens); every
 * card is a step on the site's own graphite ramp (cobalt is reserved for one
 * small accent inside the artwork); corners are square; no shadow or gradient;
 * each card shows a line illustration and a position mark instead of numerals;
 * cards that are not on top are inert so their links can't be reached by
 * keyboard while hidden.
 */

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState } from "react";
import type { ProjectArtName } from "@/lib/data";
import { PositionMarks, ProjectArt } from "./ProjectArt";

export interface ProjectCardItem {
  title: string;
  /** What the project is, e.g. "Web app". */
  kind: string;
  description: string;
  art: ProjectArtName;
  /** External link to the live project. Omit while there isn't one. */
  href?: string;
  caseStudyHref: string;
}

/** One step per card on the site's graphite ramp (the same family as the
 *  canvas and service cards), so the stack reads as layers of one surface
 *  rather than four different colours. */
const stackTones = ["#1e1e2a", "#222230", "#262637", "#2a2a3c"];

const linkClass =
  "text-[15px] text-ivory underline decoration-white/30 underline-offset-4 hover:decoration-white";

function ProjectCard({
  item,
  index,
  total,
  progress,
  reduceMotion,
  active,
}: {
  item: ProjectCardItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
  active: boolean;
}) {
  const segment = 1 / Math.max(total, 1);
  const start = index * segment;
  const end = Math.min(start + segment, 1);
  const entryStart = Math.max(0, start - segment);
  const entryEnd =
    index === 0 ? 0.0001 : Math.min(start, entryStart + segment * 0.7);
  const stackedCardGap = Math.min(24, 72 / Math.max(total - 1, 1));
  const stackedOffset = index * stackedCardGap;
  const restingOffset = Math.min(index * 12, 34);
  const restingScale = 1 - Math.min(index * 0.012, 0.035);

  const exitYPercent = useTransform(
    progress,
    [start, end],
    reduceMotion ? [0, 0] : [0, -118]
  );
  const exitStackOffset = useTransform(
    progress,
    [start, end],
    reduceMotion ? [0, 0] : [0, stackedOffset]
  );
  const exitY = useMotionTemplate`calc(${exitYPercent}% + ${exitStackOffset}px)`;
  const rotateX = useTransform(
    progress,
    [start, end],
    reduceMotion ? [0, 0] : [0, 22]
  );
  const opacity = useTransform(
    progress,
    [start, end],
    reduceMotion ? [1, 0] : [1, 1]
  );
  const entryScale = useTransform(
    progress,
    [entryStart, entryEnd],
    index === 0 ? [1, 1] : [restingScale, 1]
  );
  const entryY = useTransform(
    progress,
    [entryStart, entryEnd],
    index === 0 ? [0, 0] : [restingOffset, 0]
  );

  return (
    <motion.article
      inert={!active}
      className="absolute inset-x-0 top-0 aspect-[3/4] will-change-transform sm:aspect-[1.76/1]"
      style={{
        y: exitY,
        rotateX,
        opacity,
        zIndex: total - index,
        transformOrigin: "50% 50%",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
    >
      <motion.div
        className="grid h-full grid-rows-[1fr_auto] overflow-hidden rounded-card border border-white/[0.12] text-ivory sm:grid-cols-[1.15fr_0.85fr] sm:grid-rows-1"
        style={{
          backgroundColor: stackTones[index % stackTones.length],
          y: entryY,
          scale: entryScale,
          transformOrigin: "50% 100%",
        }}
      >
        <div className="flex min-w-0 flex-col p-[clamp(20px,3vw,48px)]">
          <PositionMarks index={index} total={total} className="text-ivory" />

          <div className="mt-auto max-w-[46rem] pt-6">
            <h3 className="font-arcadia-display text-[clamp(28px,3.25vw,48px)] font-medium leading-[1] tracking-[0.005em]">
              {item.title}
            </h3>
            <p className="mt-2 text-[clamp(13px,1.1vw,15px)] text-ivory/70">
              {item.kind}
            </p>
            <p className="mt-[clamp(10px,1.4vw,16px)] line-clamp-3 max-w-[42rem] text-[clamp(13px,1.1vw,16px)] leading-[1.5] text-ash sm:line-clamp-none">
              {item.description}
            </p>
            <div className="mt-[clamp(14px,1.8vw,24px)] flex flex-wrap gap-x-6 gap-y-2">
              {item.href && (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Visit site
                  <span className="sr-only"> for {item.title}</span>
                </a>
              )}
              <Link href={item.caseStudyHref} className={linkClass}>
                Case study
                <span className="sr-only"> for {item.title}</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="relative m-[clamp(10px,1.2vw,18px)] min-h-[110px] overflow-hidden rounded-card border border-white/[0.08] bg-canvas sm:ml-0">
          <div className="flex h-full items-center justify-center p-[clamp(12px,2vw,32px)]">
            <ProjectArt
              name={item.art}
              className="h-full max-h-[320px] w-full max-w-[320px] text-ivory"
            />
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

function MobileProjectList({ items }: { items: ProjectCardItem[] }) {
  return (
    <div className="flex flex-col gap-6 px-5 py-8 md:hidden">
      {items.map((item, index) => (
        <article
          key={item.caseStudyHref}
          className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#1e1e2a] shadow-xl"
        >
          {/* Top Header: Step number & Kind tag */}
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-5 py-3.5">
            <span className="font-mono text-xs text-ash/80">
              0{index + 1} / 0{items.length}
            </span>
            <span className="rounded bg-white/[0.06] px-2.5 py-0.5 text-xs text-ivory/90">
              {item.kind}
            </span>
          </div>

          {/* Project Art / Visual Preview */}
          <div className="relative flex h-48 w-full items-center justify-center border-b border-white/[0.06] bg-canvas p-6">
            <ProjectArt
              name={item.art}
              className="h-full max-h-[160px] w-full max-w-[200px] text-ivory"
            />
          </div>

          {/* Body Content */}
          <div className="p-5">
            <h3 className="font-arcadia-display text-2xl font-medium tracking-tight text-ivory">
              {item.title}
            </h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-ash">
              {item.description}
            </p>

            {/* Actions */}
            <div className="mt-5 flex items-center gap-4 border-t border-white/[0.06] pt-3">
              <Link
                href={item.caseStudyHref}
                className="inline-flex items-center text-[14px] font-medium text-ivory underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                Case study &rarr;
              </Link>
              {item.href && (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[14px] text-ash underline decoration-white/20 underline-offset-4 hover:text-ivory hover:decoration-white"
                >
                  Visit site &#8599;
                </a>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ProjectStack({ items }: { items: ProjectCardItem[] }) {
  const stackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 22,
    mass: 0.8,
    restDelta: 0.0005,
  });
  const progress = reduceMotion ? scrollYProgress : smoothProgress;

  // Which card is on top right now (only that one is interactive).
  const [active, setActive] = useState(0);
  useMotionValueEvent(progress, "change", (latest) => {
    const next = Math.min(items.length - 1, Math.max(0, Math.floor(latest * items.length)));
    setActive((prev) => (prev === next ? prev : next));
  });

  return (
    <>
      {/* Clean native vertical list for mobile screens: no empty voids, smooth touch scroll */}
      <MobileProjectList items={items} />

      {/* Desktop 3D interactive stack for wide viewports */}
      <div
        ref={stackRef}
        className="relative hidden md:block"
        style={{ height: `${(items.length + 1) * 100}vh` }}
      >
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden px-[clamp(14px,4vw,64px)] py-8">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[860px] [perspective:800px] sm:aspect-[1.76/1]">
            {[...items].reverse().map((item, reverseIndex) => {
              const index = items.length - reverseIndex - 1;
              return (
                <ProjectCard
                  key={item.caseStudyHref}
                  item={item}
                  index={index}
                  total={items.length}
                  progress={progress}
                  reduceMotion={reduceMotion}
                  active={index === active}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

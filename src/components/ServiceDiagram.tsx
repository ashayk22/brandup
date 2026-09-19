"use client";

import { useEffect, useRef, useState } from "react";
import {
  PiBrowsers,
  PiChartLineUp,
  PiPackage,
  PiShareNetwork,
} from "react-icons/pi";
import { CircuitBoard } from "./CircuitBoard";
import { Reveal } from "./Reveal";

const BOARD_W = 500;
const BOARD_H = 300;

const nodes = [
  { id: "start", x: 80, y: 150, label: "Your product", icon: <PiPackage className="h-5 w-5" /> },
  { id: "process", x: 250, y: 80, label: "Our website service", icon: <PiBrowsers className="h-5 w-5" /> },
  { id: "validate", x: 250, y: 220, label: "Our social media services", icon: <PiShareNetwork className="h-5 w-5" /> },
  { id: "end", x: 420, y: 150, label: "Engagement", icon: <PiChartLineUp className="h-5 w-5" /> },
];

const connections = [
  { from: "start", to: "process", animated: true },
  { from: "start", to: "validate", animated: true },
  { from: "process", to: "end", animated: true },
  { from: "validate", to: "end", animated: true },
];

/** Shrinks the fixed-size board to fit narrow screens. */
function FittedBoard() {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / BOARD_W));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrap}
      role="img"
      aria-label="Diagram: your product connects to our website service and our social media services, which both lead to engagement."
      className="w-full"
      style={{ height: BOARD_H * scale }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: BOARD_W, height: BOARD_H }}>
        <CircuitBoard
          nodes={nodes}
          connections={connections}
          width={BOARD_W}
          height={BOARD_H}
        />
      </div>
    </div>
  );
}

function MobileFlowDiagram() {
  return (
    <div className="mx-auto w-full max-w-sm px-1 md:hidden">
      {/* Node 1: Your product */}
      <div className="flex items-center justify-between rounded-lg border border-white/[0.12] bg-[#1e1e2a] px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.05] text-ivory">
            <PiPackage className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-ivory">Your product</p>
            <p className="text-[11px] text-ash">Starting point</p>
          </div>
        </div>
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cobalt opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cobalt" />
        </span>
      </div>

      {/* Split Connector (SVG) */}
      <div className="relative flex justify-center py-1">
        <svg
          viewBox="0 0 280 44"
          fill="none"
          className="h-11 w-full max-w-[280px]"
          aria-hidden="true"
        >
          {/* Main vertical stem down from center */}
          <path
            d="M 140 0 V 16"
            stroke="rgba(237, 237, 243, 0.25)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Split to left branch */}
          <path
            d="M 140 16 H 65 V 44"
            stroke="rgba(237, 237, 243, 0.25)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Split to right branch */}
          <path
            d="M 140 16 H 215 V 44"
            stroke="rgba(237, 237, 243, 0.25)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Animated pulse dots */}
          <circle r="3" fill="#5266eb">
            <animateMotion
              path="M 140 0 V 16 H 65 V 44"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="3" fill="#5266eb">
            <animateMotion
              path="M 140 0 V 16 H 215 V 44"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      {/* Parallel Service Nodes */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left: Website service */}
        <div className="flex flex-col justify-between rounded-lg border border-white/[0.1] bg-[#1e1e2a] p-3.5 shadow-md">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded border border-white/[0.08] bg-white/[0.04] text-ivory">
              <PiBrowsers className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-mono uppercase text-ash/80">Digital</span>
          </div>
          <div className="mt-3">
            <p className="text-[13px] font-medium leading-snug text-ivory">
              Our website service
            </p>
            <p className="mt-0.5 text-[11px] text-ash">Design &amp; build</p>
          </div>
        </div>

        {/* Right: Social media service */}
        <div className="flex flex-col justify-between rounded-lg border border-white/[0.1] bg-[#1e1e2a] p-3.5 shadow-md">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded border border-white/[0.08] bg-white/[0.04] text-ivory">
              <PiShareNetwork className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-mono uppercase text-ash/80">Social</span>
          </div>
          <div className="mt-3">
            <p className="text-[13px] font-medium leading-snug text-ivory">
              Our social media
            </p>
            <p className="mt-0.5 text-[11px] text-ash">Daily growth</p>
          </div>
        </div>
      </div>

      {/* Merge Connector (SVG) */}
      <div className="relative flex justify-center py-1">
        <svg
          viewBox="0 0 280 44"
          fill="none"
          className="h-11 w-full max-w-[280px]"
          aria-hidden="true"
        >
          {/* Left branch into center */}
          <path
            d="M 65 0 V 28 H 140"
            stroke="rgba(237, 237, 243, 0.25)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Right branch into center */}
          <path
            d="M 215 0 V 28 H 140"
            stroke="rgba(237, 237, 243, 0.25)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Merged vertical stem down into Engagement */}
          <path
            d="M 140 28 V 44"
            stroke="rgba(82, 102, 235, 0.6)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Animated pulse dots */}
          <circle r="3" fill="#5266eb">
            <animateMotion
              path="M 65 0 V 28 H 140 V 44"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="3" fill="#5266eb">
            <animateMotion
              path="M 215 0 V 28 H 140 V 44"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      {/* Node 3: Engagement */}
      <div className="flex items-center justify-between rounded-lg border border-cobalt/40 bg-[#1e1e2a] px-4 py-3 shadow-[0_4px_24px_rgba(82,102,235,0.18)]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-cobalt/50 bg-cobalt/20 text-cobalt">
            <PiChartLineUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-ivory">Engagement</p>
            <p className="text-[11px] text-ash">Revenue &amp; trust</p>
          </div>
        </div>
        <span className="rounded bg-cobalt/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cobalt">
          Outcome
        </span>
      </div>
    </div>
  );
}

export function ServiceDiagram() {
  return (
    <section className="bg-canvas py-[72px]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <Reveal>
          <h2 className="font-arcadia-display text-[32px] font-medium leading-[1.15] tracking-[0.01em] text-ivory sm:text-[42px]">
            From your product to engagement
          </h2>
          <p className="mt-4 max-w-[460px] text-[16px] leading-[1.5] text-ash">
            Your product sits at the start. Our website service and our social
            media services run side by side, and both lead to the same place:
            engagement.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          {/* Mobile Mercury Flow Diagram: 100% visible, zero horizontal clipping */}
          <MobileFlowDiagram />

          {/* Desktop Circuit Board Diagram */}
          <div className="hidden md:block">
            <FittedBoard />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

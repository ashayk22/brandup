"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Button } from "./Button";
import { StartProjectButton } from "./StartProjectButton";
import { Logo } from "./Logo";
import RubberSegment from "./RubberSegment";
import { nav, phoneHref, siteConfig } from "@/lib/data";

const navItems = nav.map(({ label, href }) => ({
  value: href.replace("/#", ""),
  label,
  href,
}));

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Which nav section is on screen (home page only). While a click is
  // scrolling to its target the highlight stays pinned there, so it doesn't
  // flick through the sections in between.
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("");
  const pinned = useRef<string | null>(null);
  const pinTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (pathname !== "/") return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current = "";
      for (const { value } of navItems) {
        const el = document.getElementById(value);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) {
          current = value;
          break;
        }
      }
      if (pinned.current) {
        if (current !== pinned.current) return;
        pinned.current = null;
      }
      setActiveSection(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(pinTimer.current);
    };
  }, [pathname]);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "bg-canvas border-b border-white/[0.06]"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <RubberSegment
            items={navItems}
            value={activeSection}
            onChange={(value) => {
              pinned.current = value;
              setActiveSection(value);
              clearTimeout(pinTimer.current);
              // safety net: never stay pinned if the scroll never arrives
              pinTimer.current = setTimeout(() => {
                pinned.current = null;
              }, 2500);
            }}
            className="rubber-segment--nav"
            size="nav"
            radius={4}
            inset={0}
            equalSlots={false}
            trackColor="transparent"
            thumbColor="#25252e"
            textColor="#ededf3"
            activeTextColor="#ededf3"
            stretch={100}
            squash={3}
            speed={1}
            glide={75}
            draggable={false}
          />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <StartProjectButton />
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ivory md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className="relative block h-4 w-5">
            <span
              className={clsx(
                "absolute left-0 h-[1.5px] w-5 bg-ivory transition-transform",
                open ? "top-[7px] rotate-45" : "top-0"
              )}
            />
            <span
              className={clsx(
                "absolute left-0 top-[7px] h-[1.5px] w-5 bg-ivory transition-opacity",
                open && "opacity-0"
              )}
            />
            <span
              className={clsx(
                "absolute left-0 h-[1.5px] w-5 bg-ivory transition-transform",
                open ? "top-[7px] -rotate-45" : "top-[14px]"
              )}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-canvas px-6 pb-8 pt-2 md:hidden">
          <nav className="flex flex-col gap-1 py-3">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-nav px-3 py-3 text-[16px] text-ivory hover:bg-white/[0.06]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-3 pt-2">
            {phoneHref && (
              <Button href={phoneHref} variant="ghost" className="w-full">
                Call {siteConfig.phone}
              </Button>
            )}
            <StartProjectButton className="w-full" onOpen={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

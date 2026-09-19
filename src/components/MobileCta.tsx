"use client";

import { useEffect, useState } from "react";
import { StartProjectButton } from "./StartProjectButton";

/** Sticky "Start a project" bar for phones: opens the project form in a
 *  dialog. It waits until the visitor has scrolled past the hero (which has
 *  its own CTA) and steps aside once the contact form is on screen. */
export function MobileCta() {
  const [pastHero, setPastHero] = useState(false);
  const [atContact, setAtContact] = useState(false);

  useEffect(() => {
    const services = document.getElementById("services");
    const contact = document.getElementById("contact");

    const onScroll = () => {
      setPastHero(
        services ? services.getBoundingClientRect().top < window.innerHeight : true
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let observer: IntersectionObserver | undefined;
    if (contact) {
      observer = new IntersectionObserver(([entry]) =>
        setAtContact(entry.isIntersecting)
      );
      observer.observe(contact);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  if (!pastHero || atContact) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-canvas px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <StartProjectButton className="w-full" />
    </div>
  );
}

import { siteConfig } from "@/lib/data";

/** The circular brand mark. Swap this SVG (or render an <Image> of your
 *  logo file) to change the logo everywhere it is used. */
export function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="13" stroke="#ededf3" strokeWidth="1.3" />
      <circle cx="14" cy="14" r="7.5" stroke="#ededf3" strokeWidth="1.3" />
      <circle cx="14" cy="14" r="2.4" fill="#5266eb" />
    </svg>
  );
}

export function Logo() {
  return (
    <>
      <LogoMark />
      <span className="font-arcadia-display text-[18px] font-medium tracking-[0.01em] text-ivory">
        {siteConfig.name}
      </span>
    </>
  );
}

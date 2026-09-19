import Link from "next/link";
import { clsx } from "clsx";
import { LetterCascade } from "./LetterCascade";

type ButtonProps = {
  /** Where the button goes. Leave it out and pass `onClick` to get a real
   *  <button> (used for things that open a dialog rather than navigate). */
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  size?: "standalone" | "inline";
  className?: string;
  /** Letter-by-letter hover animation on the label (string labels only). */
  cascade?: boolean;
};

export function Button({
  href,
  onClick,
  children,
  variant = "primary",
  size = "inline",
  className,
  cascade = false,
}: ButtonProps) {
  const label =
    cascade && typeof children === "string" ? (
      <LetterCascade text={children} />
    ) : (
      children
    );

  const base =
    "inline-flex items-center justify-center gap-2 rounded-button text-[16px] font-normal transition-colors duration-150 whitespace-nowrap";

  const paddings =
    size === "standalone" ? "py-[18px] px-10" : "py-[11px] px-5";

  const styles = {
    primary:
      "bg-cobalt text-purewhite hover:bg-cobalt-hover",
    ghost:
      "bg-transparent text-ivory border border-ivory/90 hover:bg-ivory/[0.06]",
  };

  const classes = clsx(base, paddings, styles[variant], className);

  if (href === undefined) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={typeof children === "string" ? children : undefined}
        className={classes}
      >
        {label}
      </button>
    );
  }

  if (/^(mailto|tel):/.test(href)) {
    return (
      <a href={href} className={classes}>
        {label}
      </a>
    );
  }

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {label}
    </Link>
  );
}

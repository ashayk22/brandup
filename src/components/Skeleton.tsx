import { clsx } from "clsx";

/** Placeholder block for content that is still loading. Purely presentational. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={clsx("animate-pulse rounded-card bg-white/[0.06]", className)}
    />
  );
}

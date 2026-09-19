import { Skeleton } from "@/components/Skeleton";

/** Shown while a case study loads: same silhouette as the finished page. */
export default function Loading() {
  return (
    <div className="bg-canvas pt-[76px]" role="status" aria-label="Loading case study">
      <div className="mx-auto max-w-[800px] px-6 py-[72px]">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-10 h-10 w-3/4" />
        <Skeleton className="mt-3 h-4 w-40" />
        <Skeleton className="mt-8 h-[260px] w-full sm:h-[340px]" />
        <Skeleton className="mt-8 h-5 w-full" />
        <Skeleton className="mt-3 h-5 w-5/6" />
        <Skeleton className="mt-14 h-6 w-32" />
        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    </div>
  );
}

import type { MetadataRoute } from "next";
import { work } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    ...work.map((item) => ({
      url: absoluteUrl(`/work/${item.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.3 },
  ];
}

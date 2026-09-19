import { LegalPage } from "@/components/LegalPage";
import { termsSections } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of service",
  description:
    "The terms that apply when you use the BrandUp website, and how they relate to a signed statement of work.",
  path: "/terms",
});

export default function Terms() {
  return (
    <LegalPage
      title="Terms of service"
      intro="These terms cover your use of this website. They are short on purpose, and project work is covered by its own signed agreement."
      sections={termsSections}
    />
  );
}

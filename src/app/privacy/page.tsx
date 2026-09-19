import { LegalPage } from "@/components/LegalPage";
import { privacySections } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "What personal information BrandUp collects through this website, how it is used, and how to ask us to change or delete it.",
  path: "/privacy",
});

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="We collect only what we need to respond to you and to understand how the site is used. This page explains what that is and what you can do about it."
      sections={privacySections}
    />
  );
}

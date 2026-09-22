import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { JsonLd } from "@/components/JsonLd";
import { ProjectDialogProvider } from "@/components/ProjectDialog";
import { phoneHref, services, siteConfig } from "@/lib/data";

const title = `${siteConfig.name} | Social media and websites for ambitious brands`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  // Pages set their own `title`; the template appends the brand name.
  title: { default: title, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,

  verification: {
    google: "bhqUA3ZAcaJ47c67XrCspFuGtrvPiPUgicnRy1l_dic",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title,
    description: siteConfig.description,
    url: "/",
  },
  twitter: { card: "summary", title, description: siteConfig.description },
};

export const viewport: Viewport = {
  themeColor: "#171721",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Local business schema. Optional fields (phone, address, profiles) are only
// included once they are filled in on `siteConfig`.
const businessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteConfig.url}/#business`,
  name: siteConfig.legalName,
  alternateName: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  email: siteConfig.email,
  ...(phoneHref && { telephone: siteConfig.phone }),
  ...(siteConfig.address && {
    address: { "@type": "PostalAddress", ...siteConfig.address },
  }),
  ...(siteConfig.socials.length > 0 && {
    sameAs: siteConfig.socials.map((s) => s.href),
  }),
  makesOffer: services.map((s) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: s.title, description: s.summary },
  })),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-canvas text-ivory font-arcadia antialiased">
        <JsonLd data={businessSchema} />
        <ProjectDialogProvider>{children}</ProjectDialogProvider>
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { ZoomHero } from "@/components/ZoomHero";
import { Services } from "@/components/Services";
import { ServiceDiagram } from "@/components/ServiceDiagram";
import { TechStack } from "@/components/TechStack";
import { Process } from "@/components/Process";
import { Work } from "@/components/Work";
import { Faq } from "@/components/Faq";
import { ContactCta } from "@/components/ContactCta";
import { Footer } from "@/components/Footer";
import { MobileCta } from "@/components/MobileCta";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ZoomHero />
        <Services />
        <ServiceDiagram />
        <TechStack />
        <Process />
        <Work />
        <Faq />
        <ContactCta />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}

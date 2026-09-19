import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileCta } from "./MobileCta";

/** Frame for every page except the home page: navbar, content, footer, and the
 *  mobile sticky CTA. The navbar is fixed, so content is offset by its height. */
export function PageShell({
  children,
  stickyCta = true,
}: {
  children: React.ReactNode;
  stickyCta?: boolean;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[76px]">{children}</main>
      <Footer />
      {stickyCta && <MobileCta />}
    </>
  );
}

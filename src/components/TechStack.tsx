import {
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import LogoLoop from "./LogoLoop";
import { Reveal } from "./Reveal";

const stack = [
  { name: "React", Icon: SiReact, href: "https://react.dev" },
  { name: "Next.js", Icon: SiNextdotjs, href: "https://nextjs.org" },
  { name: "TypeScript", Icon: SiTypescript, href: "https://www.typescriptlang.org" },
  { name: "Tailwind CSS", Icon: SiTailwindcss, href: "https://tailwindcss.com" },
  { name: "Supabase", Icon: SiSupabase, href: "https://supabase.com" },
  { name: "Node.js", Icon: SiNodedotjs, href: "https://nodejs.org" },
];

const logos = stack.map(({ name, Icon, href }) => ({
  node: (
    <span className="inline-flex items-center gap-3 whitespace-nowrap text-ash">
      <Icon />
      <span className="text-[16px]">{name}</span>
    </span>
  ),
  title: name,
  href,
}));

/** Horizontal tech-stack roller (LogoLoop from React Bits). */
export function TechStack() {
  return (
    <section aria-label="Tech stack" className="bg-canvas py-10">
      <Reveal className="mx-auto max-w-[1200px] px-6">
        <p className="text-[13px] text-ash">Tech stack</p>
        <div className="mt-6">
          <LogoLoop
            logos={logos}
            speed={70}
            direction="left"
            logoHeight={32}
            gap={64}
            hoverSpeed={0}
            fadeOut
            fadeOutColor="var(--onyx-canvas)"
            ariaLabel="Tech stack"
          />
        </div>
      </Reveal>
    </section>
  );
}

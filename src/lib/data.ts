/** Single source of truth for contact details, used by the footer, contact
 *  section, mobile CTA and the local-business schema. Anything left empty is
 *  simply not rendered, so no placeholder ever ships. */
export const siteConfig = {
  name: "BrandUp",
  legalName: "BrandUp Studio",
  description:
    "BrandUp is a social media management and website studio that builds the presence ambitious brands need to grow, from daily content to full production websites.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://brandupstudio.com",
  email: "brandup.in01@gmail.com",
  /** Display format, e.g. "+91 98765 43210". Renders as a tap-to-call link. */
  phone: "",
  /** Add real profile URLs here, e.g. { label: "Instagram", href: "https://instagram.com/yourhandle" }. */
  socials: [] as { label: string; href: string }[],
  /** Postal address for the local-business schema, when there is one. */
  address: null as null | {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  },
  responseTime: "within one business day",
};

/** `tel:` href for the configured phone number, or null when none is set. */
export const phoneHref = siteConfig.phone
  ? `tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`
  : null;

export const nav = [
  { label: "Services", href: "/#services" },
  { label: "Process", href: "/#process" },
  { label: "Work", href: "/#work" },
];

export const services = [
  {
    title: "Social media management",
    summary:
      "Daily content, community replies, and a posting calendar built around what your audience actually watches.",
    points: [
      "Content strategy tied to a monthly growth goal",
      "Shoot-day planning, editing, and captions",
      "Community management across every platform you run",
      "Plain-language monthly reporting on the numbers that matter",
    ],
  },
  {
    title: "Website building",
    summary:
      "Production websites built to load fast, rank, and convert. Designed once, then handed over with a CMS your team can actually use.",
    points: [
      "A custom design system built around your brand",
      "Next.js builds tuned for Core Web Vitals",
      "Editable content blocks for your own team",
      "Analytics and search console wired in from day one",
    ],
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Discover",
    description:
      "A working session on your audience, competitors, and the number you're actually trying to move this quarter.",
  },
  {
    step: "02",
    title: "Plan",
    description:
      "A content calendar or sitemap, a scope, and a timeline, reviewed with you before anything ships.",
  },
  {
    step: "03",
    title: "Build",
    description:
      "Design and build run in parallel: content goes out while your site takes shape behind a shared staging link.",
  },
  {
    step: "04",
    title: "Launch",
    description:
      "Go live with tracking, redirects, and handover documentation in place. Nothing is left loose for later.",
  },
  {
    step: "05",
    title: "Grow",
    description:
      "Monthly reporting and a standing call to adjust the plan against what the data is actually telling us.",
  },
];

/** Which illustration a project uses (see ProjectArt.tsx). */
export type ProjectArtName = "coffee" | "birds" | "cooked" | "split";

export type CaseStudy = {
  slug: string;
  /** The live project's URL. Paste it in and a "Visit site" link appears on
   *  the card and the case-study page. While it is empty, no link renders. */
  href: string;
  client: string;
  /** Short description of what the project is, e.g. "Web app". */
  kind: string;
  art: ProjectArtName;
  /** One or two sentences: shown on the card and used as the meta description. */
  description: string;
  /** Every field below is optional: a section only renders when it is filled. */
  brief?: string;
  built?: string[];
  approach?: string;
  outcome?: string;
  stack?: string[];
};

/** Previous projects, shown as the card stack and as /work/[slug] pages.
 *
 *  EquiSplit is written from what is known about the build.
 *  Street Coffee, Luvbirds and Amicooked are first drafts written from the
 *  project names alone: replace the copy with what actually happened (the
 *  brief, what shipped, the stack, the result) before launch. No figures are
 *  included on purpose, so nothing here claims a result that was not
 *  measured. */
export const work: CaseStudy[] = [
  {
    slug: "street-coffee",
    href: "https://street-coffee-five.vercel.app/",
    client: "Street Coffee",
    kind: "Coffee brand website",
    art: "coffee",
    description:
      "A website for Street Coffee that puts the menu, the story and the way to find them in front of visitors first.",
    brief:
      "A coffee brand is judged in seconds: can a passer-by see what is on offer and where the door is? The site was designed around that first visit on a phone.",
    built: [
      "A menu that reads quickly on a small screen",
      "Location and opening details near the top of the page",
      "Type and colour taken from the brand rather than a template",
    ],
  },
  {
    slug: "luvbirds",
    href: "https://luvbirds.netlify.app/",
    client: "Luvbirds",
    kind: "Brand website",
    art: "birds",
    description:
      "A brand website for Luvbirds, designed so the look and feel of the brand carries from the first screen to the last.",
    brief:
      "Luvbirds needed a site that felt like the brand straight away, without a visitor having to scroll to find out what it was about.",
    built: [
      "A custom visual design built around the brand",
      "A responsive layout tuned for phones first",
      "Page titles, descriptions and sharing previews set for every page",
    ],
  },
  {
    slug: "amicooked",
    href: "https://ami-cooked.vercel.app/",
    client: "Amicooked",
    kind: "Web app",
    art: "cooked",
    description:
      "A web app built around the question in its name, with a light touch and a fast path to an answer.",
    brief:
      "The idea is simple and the interface should be too: one clear question, a quick way to answer it, and nothing in the way.",
    built: [
      "A single-purpose interface with one obvious action",
      "A layout that works one-handed on a phone",
      "A tone of voice that matches the name",
    ],
  },
  {
    slug: "equisplit",
    href: "https://equilsplit.netlify.app/",
    client: "EquiSplit",
    kind: "Expense-splitting web app",
    art: "split",
    description:
      "A web app for splitting costs across trips, groups and friends, with amounts shown in rupees and converted to dollars.",
    brief:
      "Shared costs on trips and in groups end up scattered across chats and spreadsheets. EquiSplit keeps each trip, group and friend balance in one place, so it is always clear who owes what.",
    built: [
      "Pages for trips, groups, friends and an activity feed",
      "A three-column desktop layout",
      "Receipt-style bottom sheets with zigzag edges, plus scrollable modals",
      "Amounts in rupees with the dollar conversion shown alongside",
    ],
    approach:
      "The interface was built in quick visual rounds: change the layout or a detail, look at it on screen, adjust again.",
    outcome:
      "The core flows across trips, groups, friends and activity are working. Google sign-in was deferred from this release.",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "React Router"],
  },
];

export const faqs = [
  {
    question: "Do you work with businesses outside a specific industry?",
    answer:
      "Most of our clients are consumer brands, studios, and local businesses, but the process holds for any team that needs consistent content and a site that keeps up with it.",
  },
  {
    question: "Can you take over an existing website instead of rebuilding it?",
    answer:
      "Often, yes. We start with an audit and tell you honestly whether a rebuild or a renovation gets you further for the budget.",
  },
  {
    question: "Who owns the content and code once we stop working together?",
    answer:
      "You do, in full. Source files, accounts, and credentials are handed over, and nothing is held back as leverage.",
  },
  {
    question: "How fast can a new site go live?",
    answer:
      "A standard marketing site ships in four to six weeks from the end of discovery. Larger builds are scoped individually.",
  },
  {
    question: "How soon will we hear back after getting in touch?",
    answer:
      "We reply within one business day with next steps, and no discovery call is needed to hear back.",
  },
];

# BrandUp — Social Media & Website Agency Site

A marketing site for a fictional agency ("BrandUp") that runs social media
management and website builds for clients. Built with Next.js (App Router),
React, TypeScript, Tailwind CSS v4, and a Node.js API route for form handling.

Visual design follows the supplied "Mercury" style reference: an onyx/graphite
dark palette, a single cobalt accent color, square-cornered controls, and a
serif display / grotesk body type pairing (Newsreader and Schibsted Grotesk,
self-hosted, no external font requests needed).

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** (design tokens defined in `src/app/globals.css` via `@theme`)
- **Formspree** — the contact section and the "Start a project" dialog both
  post to one Formspree form through `@formspree/react` (form ID in
  `src/lib/formspree.ts`, overridable with `NEXT_PUBLIC_FORMSPREE_ID`).
  `source` and `_subject` fields tell the two forms apart in the inbox.
- **Node.js API route** — `src/app/api/contact/route.ts` now only handles the
  hero "Get an audit" email box. It stores submissions in memory, so point it
  at Formspree or an email provider before using it in production.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
src/
  app/
    layout.tsx        Root layout, metadata, local-business schema, analytics
    work/[slug]/         Case-study pages (+ loading skeleton)
    privacy/, terms/      Legal pages (copy lives in src/lib/legal.ts)
    thank-you/            Post-submit page (noindex)
    not-found.tsx, error.tsx   404 and runtime-error pages
    robots.ts, sitemap.ts      robots.txt and sitemap.xml
    page.tsx           Assembles all landing-page sections
    globals.css         Design tokens (Mercury palette/type/radii) + Tailwind import
    api/contact/route.ts   Node.js API route for form submissions
  components/
    Navbar.tsx          Fixed nav with a solid background once scrolled
    Hero.tsx            Full-bleed hero with CSS gradient backdrop + email capture
    EmailCapture.tsx     Reusable pill email input + submit button
    Services.tsx         Two-column "graphite card" service breakdown
    Process.tsx           Five-step engagement process
    Work.tsx              "Previous projects" heading + scroll-driven card stack
    ProjectStack.tsx      Card stack adapted from Componentry's CaseStudyFlipStack
    ServiceDiagram.tsx    Product -> website / social -> engagement diagram section
    CircuitBoard.tsx      Componentry's CircuitBoard, adapted to the site palette
    LetterCascade.tsx     Componentry's LetterCascade (hover effect on "Start a project")
    SignaturePad.tsx      Draw / type / upload signature, used in the contact form
    Reveal.tsx            Scroll-in fade-and-lift used across the site
    TechStack.tsx         Horizontal tech-stack roller (LogoLoop)
    LogoLoop.tsx          React Bits roller, lightly adapted
    RubberSegment.tsx     React Bits segmented control, adapted as the navbar highlight
    Logo.tsx              Logo mark + wordmark, used by the navbar
    Faq.tsx                Accordion FAQ
    ContactCta.tsx          Contact section (Formspree), framed two-column layout
    ProjectDialog.tsx       "Start a project" dialog + provider, opened by StartProjectButton
    StartProjectButton.tsx  Button that opens the dialog instead of scrolling
    FormFields.tsx          Shared field styles for both forms
    ProjectArt.tsx          Line illustrations and position marks for the project cards
    Footer.tsx              Footer nav, contact details, legal links + disclaimer
    Button.tsx              Shared primary (cobalt) / ghost (outline) button
    PageShell.tsx           Navbar + footer frame for every non-home page
    MobileCta.tsx           Sticky "Start a project" bar on phones
    Breadcrumbs.tsx         Breadcrumb trail + BreadcrumbList schema
  lib/
    data.ts             All site copy/content as typed arrays — edit here to
                         change services, process, work, FAQs, etc.
```

## Customizing

- **Brand name, copy:** edit `src/lib/data.ts` and the text directly inside
  each component in `src/components/`.
- **Colors, radii, spacing:** edit the CSS variables at the top of
  `src/app/globals.css`.
- **Contact form destination:** change the form ID in `src/lib/formspree.ts`.
- **Case studies:** each entry in `work` (`src/lib/data.ts`) becomes a card and
  a `/work/[slug]` page. Optional fields only render when filled in.

## Configuration

Contact details, the phone number, social profiles and the postal address used
by the local-business schema all live in `siteConfig` at the top of
`src/lib/data.ts`. Anything left empty is simply not rendered.

| Environment variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for the sitemap, canonical URLs and schema. |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 measurement ID (`G-XXXXXXXXXX`). Analytics stays off when unset. |

## Before launch

- Connect the hero audit box (`/api/contact`) to an email or CRM provider.
- Street Coffee, Luvbirds and Amicooked in `src/lib/data.ts` are first drafts
  written from the project names: replace them with the real details.
- The case-study figures in `src/lib/data.ts` are sample content. Replace them
  with real client results.
- Have the privacy policy and terms in `src/lib/legal.ts` reviewed for your
  jurisdiction.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint

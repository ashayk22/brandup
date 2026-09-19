import { siteConfig } from "./data";

export type LegalSection = { heading: string; body: string[] };

export const LEGAL_UPDATED = "September 19, 2026";

const who = `${siteConfig.legalName} ("${siteConfig.name}", "we", "us")`;

export const privacySections: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      `This policy explains how ${who} handles personal information collected through this website. You can reach us at ${siteConfig.email}.`,
    ],
  },
  {
    heading: "What we collect",
    body: [
      "Information you send us: your name, email address, and the message you write when you use the contact form, and your email address when you request a free audit.",
      "Information collected automatically: when you visit, Google Analytics may record pages viewed, approximate location, device and browser details, and how you arrived on the site, using cookies or similar identifiers.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "We use what you send us to reply to your enquiry, prepare an audit you asked for, and follow up about your project. We use analytics data to understand how the site is used and to improve it. We may also use information where the law requires it.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "We do not sell personal information. We share it only with service providers that help us run the site and respond to you, such as hosting, email delivery, and analytics providers, and with authorities where we are legally required to.",
    ],
  },
  {
    heading: "Cookies and analytics",
    body: [
      "Google Analytics sets cookies to tell visits apart. You can block or delete cookies in your browser settings, or install Google's opt-out browser add-on, and the site will keep working.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep enquiry details for as long as we need them to respond and to manage any working relationship that follows, and delete them on request unless we are required to keep them.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      `You can ask us to show you the personal information we hold about you, correct it, or delete it by emailing ${siteConfig.email}. Depending on where you live, local data protection law may give you further rights, and we will honour them.`,
    ],
  },
  {
    heading: "Security and children",
    body: [
      "We take reasonable steps to protect the information we hold, though no method of transmission or storage is completely secure. This site is not directed at children.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      `If we change this policy we will post the new version here and update the date at the top.`,
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    heading: "Agreement",
    body: [
      `By using this website you agree to these terms. Work we carry out for clients is governed by a separate signed statement of work, which takes priority over these terms if the two differ. The site is operated by ${who}.`,
    ],
  },
  {
    heading: "About our services",
    body: [
      "This site summarises what we offer. Scope, fees, timelines, and deliverables for any project are set out in your statement of work. Anything shown here is a summary, not a binding quote.",
    ],
  },
  {
    heading: "Case studies and results",
    body: [
      "Figures shown in case studies reflect individual client results. They are not guaranteed for future engagements, because outcomes depend on many factors outside our control.",
    ],
  },
  {
    heading: "Intellectual property",
    body: [
      "The text, design, and code of this site belong to us or our licensors, and you may not copy or reuse them without permission. Ownership of deliverables we create for you is set out in your statement of work.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "Do not misuse the site: no attempts to disrupt it, gain unauthorised access, scrape it at scale, or submit false or unlawful content through our forms. Information you send us should be accurate and yours to share.",
    ],
  },
  {
    heading: "Third-party links",
    body: [
      "The site may link to other websites. We do not control them and are not responsible for their content or practices.",
    ],
  },
  {
    heading: "Disclaimer and liability",
    body: [
      "The site is provided as is, without warranties of any kind. To the extent the law allows, we are not liable for indirect or consequential loss arising from your use of the site. Nothing in these terms limits liability that cannot be limited by law.",
    ],
  },
  {
    heading: "Changes and contact",
    body: [
      `We may update these terms and will post the new version here with a new date. Questions about them can be sent to ${siteConfig.email}.`,
    ],
  },
];

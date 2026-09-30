import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/Primitives";
import { LegalBody } from "@/components/site/LegalBody";
import { contact } from "@/content/site";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — SYAN Media" },
      {
        name: "description",
        content: "How SYAN Media uses cookies and similar technologies on this website.",
      },
      { property: "og:title", content: "Cookie Policy — SYAN Media" },
      { property: "og:description", content: "Cookies and similar technologies on syanmedia.com." },
    ],
  }),
  component: Cookies,
});

function Cookies() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Legal" title="Cookie Policy" intro="Last updated: 27 August 2026" />
      <LegalBody
        sections={[
          {
            title: "1. What cookies are",
            paragraphs: [
              "Cookies are small text files placed on your device to help a site function, remember preferences and understand usage.",
            ],
          },
          {
            title: "2. Categories we use",
            paragraphs: [
              "Strictly necessary — required for the site and the SYAN Intelligence platform to load, authenticate and stay secure.",
              "Preference — remember interface choices such as selected project or date range.",
              "Analytics — aggregated measurement of page performance and traffic sources.",
            ],
          },
          {
            title: "3. Third parties",
            paragraphs: [
              "Where analytics or embedded media are used, those providers may set their own cookies under their own policies.",
            ],
          },
          {
            title: "4. Managing cookies",
            paragraphs: [
              "You can block or delete cookies in your browser settings. Blocking strictly necessary cookies may prevent parts of the platform from working.",
            ],
          },
          {
            title: "5. Contact",
            paragraphs: [`Questions about cookies: ${contact.email}.`],
          },
        ]}
      />
    </SiteLayout>
  );
}

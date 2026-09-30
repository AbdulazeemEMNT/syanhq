import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/Primitives";
import { LegalBody } from "@/components/site/LegalBody";
import { contact } from "@/content/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — SYAN Media" },
      {
        name: "description",
        content: "The terms governing use of the SYAN Media website and SYAN Intelligence platform.",
      },
      { property: "og:title", content: "Terms of Use — SYAN Media" },
      { property: "og:description", content: "Website and platform terms of use." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Legal" title="Terms of Use" intro="Last updated: 27 August 2026" />
      <LegalBody
        sections={[
          {
            title: "1. Acceptance",
            paragraphs: [
              "By accessing this website or the SYAN Intelligence platform, you agree to these terms. If you do not accept them, please do not use the site.",
            ],
          },
          {
            title: "2. Use of the site",
            paragraphs: [
              "You may view, download and print content for personal or internal business use. You may not republish, resell or systematically extract content without written permission.",
            ],
          },
          {
            title: "3. Intellectual property",
            paragraphs: [
              "All trademarks, copy, design systems and software on this site — including SYAN Intelligence™ — remain the property of SYAN Media or its licensors.",
            ],
          },
          {
            title: "4. Client work",
            paragraphs: [
              "Case studies are published with client permission or reference publicly available information. Engagement terms are governed by the signed contract, not this page.",
            ],
          },
          {
            title: "5. SYAN Intelligence",
            paragraphs: [
              "Intelligence outputs are analytical estimates derived from connected data providers. They are decision support, not guarantees. Coverage depends on the data sources licensed for your project.",
            ],
          },
          {
            title: "6. Liability",
            paragraphs: [
              "The site is provided on an “as is” basis. To the extent permitted by law, SYAN Media is not liable for indirect or consequential loss arising from use of the site.",
            ],
          },
          {
            title: "7. Governing law",
            paragraphs: ["These terms are governed by the laws of the Federal Republic of Nigeria."],
          },
          {
            title: "8. Contact",
            paragraphs: [`Questions about these terms: ${contact.email}.`],
          },
        ]}
      />
    </SiteLayout>
  );
}

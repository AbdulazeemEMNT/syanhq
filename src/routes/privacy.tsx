import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/Primitives";
import { LegalBody } from "@/components/site/LegalBody";
import { contact } from "@/content/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SYAN Media" },
      {
        name: "description",
        content: "How SYAN Media collects, uses, stores and protects personal data.",
      },
      { property: "og:title", content: "Privacy Policy — SYAN Media" },
      { property: "og:description", content: "Our approach to personal data and privacy." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Legal" title="Privacy Policy" intro="Last updated: 27 August 2026" />
      <LegalBody
        sections={[
          {
            title: "1. Who we are",
            paragraphs: [
              `SYAN Media is a communications, search authority and creative agency based in ${contact.location}. This policy explains how we handle personal data collected through our website, enquiries and client engagements.`,
            ],
          },
          {
            title: "2. Data we collect",
            paragraphs: [
              "Contact details you submit through enquiry forms (name, organisation, email address and the content of your message).",
              "Technical data such as browser type, device information and pages visited, used only to keep the site secure and improve performance.",
              "Client programme data supplied to us under a signed engagement, including monitoring keywords, competitor lists and reporting preferences.",
            ],
          },
          {
            title: "3. How we use it",
            paragraphs: [
              "To respond to enquiries and prepare proposals.",
              "To deliver contracted services, including media relations, search programmes and intelligence reporting.",
              "To meet legal, accounting and regulatory obligations.",
            ],
          },
          {
            title: "4. Legal basis",
            paragraphs: [
              "We process data on the basis of your consent, the performance of a contract, or our legitimate interest in operating and improving the agency.",
            ],
          },
          {
            title: "5. Sharing",
            paragraphs: [
              "We do not sell personal data. We share data only with service providers that support delivery (for example, hosting, analytics and monitoring data providers) under confidentiality obligations.",
            ],
          },
          {
            title: "6. Retention",
            paragraphs: [
              "Enquiry data is retained for up to 24 months. Client programme data is retained for the duration of the engagement and any statutory retention period afterwards.",
            ],
          },
          {
            title: "7. Your rights",
            paragraphs: [
              `You may request access, correction, deletion or export of your personal data by writing to ${contact.email}. We respond within 30 days.`,
            ],
          },
          {
            title: "8. Contact",
            paragraphs: [`Questions about this policy: ${contact.email}, ${contact.location}.`],
          },
        ]}
      />
    </SiteLayout>
  );
}

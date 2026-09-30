export type Bouquet = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  audience: string;
  featured?: boolean;
  highlights: string[];
};

export const bouquets: Bouquet[] = [
  {
    id: "micro-business",
    name: "Micro-Business",
    price: "₦100,000",
    cadence: "per month",
    audience: "Solo founders",
    highlights: [
      "2 core platforms (Instagram & Facebook)",
      "2 posts per week (8 posts/mo)",
      "Basic DM & comment monitoring",
      "Up to 5 static graphics/mo",
      "1 minor website text/image update",
      "Free basic monthly analytics summary",
    ],
  },
  {
    id: "starter-digital",
    name: "Starter Digital",
    price: "₦180,000",
    cadence: "per month",
    audience: "Early-stage micro-businesses",
    highlights: [
      "Up to 3 platforms (IG, FB, LinkedIn)",
      "3 posts per week (12 posts/mo)",
      "Community monitoring & basic engagement",
      "Up to 8 static graphics/mo",
      "Editing 1 short-form video/mo",
      "Free performance & growth report",
    ],
  },
  {
    id: "standard-growth",
    name: "Standard Growth",
    price: "₦300,000",
    cadence: "per month",
    audience: "Emerging SMEs",
    featured: true,
    highlights: [
      "Up to 3 platforms (IG, FB, LinkedIn/TikTok)",
      "4 posts per week (16 posts/mo)",
      "Active comment moderation & engagement",
      "Up to 12 static/carousel graphics/mo",
      "5 website content updates & basic SEO",
      "Free standard growth report",
    ],
  },
  {
    id: "growth-enterprise",
    name: "Growth Enterprise",
    price: "₦450,000",
    cadence: "per month",
    audience: "Scaling SMEs & growing brands",
    highlights: [
      "Up to 4 platforms, cross-platform mix",
      "5 posts per week (20 posts/mo)",
      "Inbox management & reputation monitoring",
      "3 branded short-form videos/mo",
      "Comprehensive site updates & SEO health",
      "Free detailed metrics & KPI tracking",
    ],
  },
  {
    id: "corporate-brand",
    name: "Corporate Brand",
    price: "₦1,200,000",
    cadence: "per month",
    audience: "Established corporate firms",
    highlights: [
      "Full cross-platform coverage",
      "Daily posting (30+ posts/mo)",
      "Real-time customer service & crisis escalation",
      "4 premium videos/mo (motion graphics/docu-style)",
      "Full website upkeep, SEO & speed optimisation",
      "Free executive audit & strategy session",
    ],
  },
];

export const matrixRows: { feature: string; values: string[] }[] = [
  {
    feature: "Target audience",
    values: [
      "Solo founders",
      "Early-stage micro-businesses",
      "Emerging SMEs",
      "Scaling SMEs & growing brands",
      "Established corporate firms",
    ],
  },
  {
    feature: "Social platforms managed",
    values: [
      "2 core platforms (IG & FB)",
      "Up to 3 platforms (IG, FB, LinkedIn)",
      "Up to 3 platforms (IG, FB, LinkedIn/TikTok)",
      "Up to 4 platforms (cross-platform mix)",
      "Full cross-platform (all core channels)",
    ],
  },
  {
    feature: "Posting frequency",
    values: [
      "2 posts / week (8 / mo)",
      "3 posts / week (12 / mo)",
      "4 posts / week (16 / mo)",
      "5 posts / week (20 / mo)",
      "Daily posting (30+ / mo)",
    ],
  },
  {
    feature: "Community management & DMs",
    values: [
      "Basic DM & comment monitoring",
      "Community monitoring & basic engagement",
      "Active comment moderation & engagement",
      "Active moderation, inbox management & reputation monitoring",
      "Real-time customer service & crisis escalation",
    ],
  },
  {
    feature: "Copywriting",
    values: [
      "Short-form captions & hashtags",
      "Captions & hashtag strategies",
      "Engaging captions, hooks & email text",
      "High-converting captions, ad copy & newsletters",
      "Advanced content copy, PR & thought leadership",
    ],
  },
  {
    feature: "Creative & graphics design",
    values: [
      "Up to 5 static graphics / mo",
      "Up to 8 static graphics / mo",
      "Up to 12 static/carousel graphics / mo",
      "Up to 15 graphics & carousel templates",
      "Up to 35 standard graphics & campaign assets",
    ],
  },
  {
    feature: "Video production & editing",
    values: [
      "—",
      "Editing 1 short-form video / mo (production cost exclusive)",
      "Editing 2 short-form videos / mo (production cost exclusive)",
      "3 branded short-form videos / mo (client footage/b-roll)",
      "4 premium videos / mo (motion graphics / docu-style)",
    ],
  },
  {
    feature: "Website management",
    values: [
      "1 minor text/image update on existing site",
      "2 text/image updates on existing site",
      "5 content updates & basic SEO",
      "Comprehensive updates, SEO health & layout tweaks",
      "Full website upkeep, SEO, speed optimisation & feature expansions",
    ],
  },
  {
    feature: "Monthly analytics reporting",
    values: [
      "Free — basic metrics summary",
      "Free — performance & growth summary",
      "Free — standard growth report",
      "Free — detailed metrics & KPI tracking",
      "Free — executive audit & strategy session",
    ],
  },
];

export const addOns = [
  {
    name: "Website design (new build)",
    scope:
      "Custom 5–7 page responsive corporate website with basic SEO setup and payment gateway integration.",
    price: "₦450,000 – ₦850,000 (one-off)",
  },
  {
    name: "Advanced e-commerce store",
    scope:
      "Full online store build, product upload (up to 50 items), inventory setup and secure checkout integration.",
    price: "₦900,000 – ₦1,500,000 (one-off)",
  },
  {
    name: "Standalone video production",
    scope:
      "On-location professional shoot (Lagos-based) with lighting, audio recording and directing.",
    price: "₦250,000 / day",
  },
  {
    name: "Explainer / motion graphic video",
    scope: "60-second 2D/3D animated product or corporate explainer video with voiceover.",
    price: "₦350,000 – ₦650,000 per video",
  },
  {
    name: "Paid ad campaign management",
    scope:
      "Meta (FB/IG) or Google Ads setup, audience targeting, creative testing and daily budget optimisation.",
    price: "15% of total ad spend (min. ₦75,000 fee)",
  },
];

export const pricingTerms = [
  {
    title: "Billing cycle",
    detail: "All monthly retainers are billed on a prepaid basis at the beginning of each billing month.",
  },
  {
    title: "Content approval",
    detail:
      "Monthly content calendars are submitted 10 business days before the active month for client review and sign-off.",
  },
  {
    title: "Exclusions",
    detail:
      "Third-party software subscriptions, premium plugins, paid stock media, news publication cost, hosting renewals and ad spend budgets are billed separately or covered directly by the client.",
  },
];

export type ServiceGroup = {
  id: string;
  title: string;
  blurb: string;
  services: Service[];
};

export type Service = {
  slug: string;
  name: string;
  summary: string;
  group: string;
  capabilities: { title: string; detail: string }[];
  outcomes: string[];
};

export const serviceGroups: ServiceGroup[] = [
  {
    id: "authority",
    title: "Reputation & Authority",
    blurb: "Earned influence in the rooms and pages that decide reputations.",
    services: [
      {
        slug: "public-relations-media-coverage",
        name: "Public Relations & Media Coverage",
        group: "Reputation & Authority",
        summary:
          "Editorial access to Nigeria's most respected newsrooms, engineered into sustained, credible coverage.",
        capabilities: [
          {
            title: "Executive Spotlight",
            detail:
              "Position your CEOs and founders as respected voices in national newspapers.",
          },
          {
            title: "Guaranteed Press Features",
            detail:
              "Get published in Nigeria's leading print, television, and online news outlets.",
          },
          {
            title: "Reputation Protection",
            detail:
              "Handle crises quickly and calmly to protect your brand's good name.",
          },
        ],
        outcomes: [
          "Front-page and business-desk placements",
          "Executive thought leadership programmes",
          "Rapid-response crisis communications",
        ],
      },
      {
        slug: "crisis-reputation-management",
        name: "Crisis & Reputation Management",
        group: "Reputation & Authority",
        summary:
          "Calm, fast, senior counsel when the narrative turns — and structured recovery afterwards.",
        capabilities: [
          {
            title: "Rapid Response",
            detail:
              "Holding statements, media handling and stakeholder briefings within hours, not days.",
          },
          {
            title: "Narrative Recovery",
            detail:
              "Rebuild trust with a sequenced programme of proof, coverage and third-party validation.",
          },
          {
            title: "Preparedness",
            detail:
              "Scenario planning, spokesperson training and escalation protocols before you need them.",
          },
        ],
        outcomes: [
          "Contained exposure during sensitive events",
          "Aligned internal and external messaging",
          "Documented crisis playbooks",
        ],
      },
    ],
  },
  {
    id: "discovery",
    title: "Search & AI Discovery",
    blurb: "Be the answer when customers — and machines — go looking.",
    services: [
      {
        slug: "google-ai-search-ranking",
        name: "Google & AI Search Ranking",
        group: "Search & AI Discovery",
        summary:
          "Own page one and the AI answer layer where buying decisions now begin.",
        capabilities: [
          {
            title: "AI Search Prominence",
            detail:
              "Make sure AI tools like ChatGPT, Gemini, and Perplexity recommend your business.",
          },
          {
            title: "Top Google Ranking",
            detail:
              "Get your business found on page 1 when people search for what you sell.",
          },
          {
            title: "Verified Online Profile",
            detail:
              "Set up and manage your official Google Knowledge Panel and digital assets.",
          },
        ],
        outcomes: [
          "Page-one rankings on commercial keywords",
          "Consistent citation inside AI answers",
          "Verified, controlled brand entity data",
        ],
      },
      {
        slug: "wikipedia-page-development",
        name: "Wikipedia Page Development",
        group: "Search & AI Discovery",
        summary:
          "Compliant, sourced encyclopaedia presence that cements global authority.",
        capabilities: [
          {
            title: "Notability Assessment",
            detail:
              "Honest review of whether the subject meets Wikipedia's notability standards.",
          },
          {
            title: "Research & Drafting",
            detail:
              "Research, draft, and publish compliant Wikipedia pages for notable executives, companies, and public institutions.",
          },
          {
            title: "Ongoing Stewardship",
            detail:
              "Monitor edits, correct inaccuracies and maintain sourcing integrity.",
          },
        ],
        outcomes: [
          "Encyclopaedia-grade authority signals",
          "Stronger Knowledge Panel and AI citation",
          "Durable, source-backed reputation record",
        ],
      },
    ],
  },
  {
    id: "growth",
    title: "Growth & Demand",
    blurb: "Attention converted into pipeline, customers and revenue.",
    services: [
      {
        slug: "digital-marketing-product-launches",
        name: "Digital Marketing & Product Launches",
        group: "Growth & Demand",
        summary:
          "Turnkey campaigns that move products, apps and branches off the launch pad.",
        capabilities: [
          {
            title: "Customer Acquisition",
            detail:
              "Run high-converting online ads on Meta, Google, and Instagram to win paying clients.",
          },
          {
            title: "Launch Playbooks",
            detail:
              "Turnkey marketing campaigns to launch new apps, retail products, or branch openings.",
          },
          {
            title: "Customer Retention",
            detail:
              "Send smart email and SMS messages that keep customers coming back.",
          },
        ],
        outcomes: [
          "Measured cost per acquisition",
          "Launch-day market saturation",
          "Repeat purchase and retention lift",
        ],
      },
    ],
  },
  {
    id: "creative",
    title: "Creative & Content Studio",
    blurb: "The craft layer: identity, film, copy and digital experience.",
    services: [
      {
        slug: "creative-studio-content-web",
        name: "Creative Studio, Content & Web Solutions",
        group: "Creative & Content Studio",
        summary:
          "Design, film, copy and web built to command authority and convert attention.",
        capabilities: [
          {
            title: "Graphics Design & Branding",
            detail:
              "Craft memorable logos, brand identity guides, corporate profiles, and pitch decks that command authority.",
          },
          {
            title: "Video Production & Editing",
            detail:
              "Produce high-impact promotional videos, social reels, documentaries, and commercials that turn viewers into paying clients.",
          },
          {
            title: "High-Converting Copywriting",
            detail:
              "Write sharp, persuasive sales copy, press releases, website content, and email campaigns that drive action.",
          },
          {
            title: "Website Design & Management",
            detail:
              "Build fast, mobile-friendly websites and provide hands-on management to keep your business running smoothly.",
          },
        ],
        outcomes: [
          "A coherent, premium brand system",
          "Content engineered for conversion",
          "Fast, maintained digital estate",
        ],
      },
    ],
  },
  {
    id: "intelligence",
    title: "Intelligence",
    blurb: "Measure the influence you build.",
    services: [
      {
        slug: "media-reputation-intelligence",
        name: "Media & Reputation Intelligence",
        group: "Intelligence",
        summary:
          "SYAN Intelligence™ — monitoring, sentiment, narrative and AI visibility as a managed service.",
        capabilities: [
          {
            title: "Media Listening",
            detail: "Monitor brand mentions, reach and engagement across connected sources.",
          },
          {
            title: "Narrative Intelligence",
            detail: "Track emerging topics, narrative shifts and audience concerns.",
          },
          {
            title: "AI Visibility",
            detail:
              "Understand how your organisation appears across AI-powered discovery platforms.",
          },
        ],
        outcomes: [
          "Weekly and monthly intelligence reporting",
          "Early warning on reputation risk",
          "Competitor share-of-voice benchmarks",
        ],
      },
    ],
  },
];

export const services: Service[] = serviceGroups.flatMap((g) => g.services);

export const getService = (slug: string) => services.find((s) => s.slug === slug);

export type CaseStudy = {
  slug: string;
  client: string;
  sector: string;
  headline: string;
  summary: string;
  challenge: string;
  approach: string[];
  results: string[];
  services: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "ethica-microfinance-bank",
    client: "Ethica Microfinance Bank",
    sector: "Banking, Finance & Fintech",
    headline: "A digital banking launch carried by the national press",
    summary:
      "Managed the official digital banking app launch, national media rollout, and ongoing corporate communications.",
    challenge:
      "A regional microfinance bank needed national credibility for a digital banking product entering a crowded market.",
    approach: [
      "Positioning and message architecture for the app launch",
      "Coordinated national press rollout across business desks",
      "Ongoing corporate communications and executive visibility",
    ],
    results: [
      "National launch coverage across leading outlets",
      "Sustained corporate communications programme",
      "Clear category positioning for the digital product",
    ],
    services: ["Public Relations & Media Coverage", "Digital Marketing & Product Launches"],
  },
  {
    slug: "go54-rebrand",
    client: "GO54 (formerly Whogohost)",
    sector: "Technology & Cloud Services",
    headline: "Announcing a rebrand without losing equity",
    summary:
      "Managed the public announcement and media strategy for the company's major rebrand.",
    challenge:
      "Transitioning a well-known technology brand to a new identity while retaining trust and search authority.",
    approach: [
      "Rebrand narrative and stakeholder message hierarchy",
      "Embargoed media strategy and announcement sequencing",
      "Search and entity continuity across digital properties",
    ],
    results: [
      "Coordinated national announcement moment",
      "Brand equity carried into the new identity",
      "Consistent coverage across technology press",
    ],
    services: ["Public Relations & Media Coverage", "Google & AI Search Ranking"],
  },
  {
    slug: "bua-foods",
    client: "BUA Foods Plc / BUA Group",
    sector: "Corporate Giants & Energy",
    headline: "Corporate storytelling at national scale",
    summary:
      "Delivered top-tier national news coverage and major corporate brand storytelling.",
    challenge:
      "Translating large-scale corporate activity into narratives that resonate beyond the financial pages.",
    approach: [
      "Corporate narrative development for group-level milestones",
      "Top-tier editorial engagement",
      "Long-form brand storytelling assets",
    ],
    results: [
      "Consistent top-tier national coverage",
      "Elevated corporate narrative across desks",
      "Reinforced group-level authority",
    ],
    services: ["Public Relations & Media Coverage"],
  },
  {
    slug: "ecoflow-nigeria",
    client: "EcoFlow",
    sector: "Energy",
    headline: "Clean energy, launched into a sceptical market",
    summary:
      "Led clean energy product launch campaigns and media reviews across Nigeria.",
    challenge:
      "Introducing premium clean energy hardware to a market conditioned by price sensitivity and product scepticism.",
    approach: [
      "Product launch playbook and reviewer programme",
      "Media reviews across lifestyle and technology press",
      "Performance campaigns to convert interest into orders",
    ],
    results: [
      "Nationwide launch coverage and reviews",
      "Credible third-party product validation",
      "Direct demand generation alongside PR",
    ],
    services: ["Digital Marketing & Product Launches", "Public Relations & Media Coverage"],
  },
  {
    slug: "tingo-group-crisis",
    client: "Tingo Group",
    sector: "Finance & Agriculture",
    headline: "Crisis communications under national scrutiny",
    summary:
      "Delivered strategic crisis management and rapid public communications across finance and agriculture.",
    challenge:
      "High-intensity public scrutiny requiring disciplined, rapid and consistent communications.",
    approach: [
      "Crisis command structure and escalation protocol",
      "Rapid public statements and media handling",
      "Stakeholder-specific communications tracks",
    ],
    results: [
      "Controlled, consistent public messaging",
      "Reduced narrative fragmentation",
      "Structured post-crisis recovery plan",
    ],
    services: ["Crisis & Reputation Management"],
  },
  {
    slug: "islamic-witness-nigeria",
    client: "Islamic Witness Nigeria",
    sector: "Faith-Based & Community",
    headline: "Rebuilt for search, rewarded with readership",
    summary:
      "Upgraded website structure, improved Google search ranking, and grew online readership.",
    challenge:
      "A content-rich organisation invisible in search, with a site structure working against it.",
    approach: [
      "Information architecture and technical rebuild",
      "Search-led content structuring",
      "Ongoing ranking and readership optimisation",
    ],
    results: [
      "Improved Google search ranking",
      "Growth in organic online readership",
      "Durable, maintainable site structure",
    ],
    services: ["Google & AI Search Ranking", "Creative Studio, Content & Web Solutions"],
  },
];

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);

export type Insight = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readingTime: string;
  excerpt: string;
  body: string[];
};

export const insights: Insight[] = [
  {
    slug: "ai-search-is-the-new-front-page",
    title: "AI search is the new front page",
    category: "AI Visibility",
    date: "2026-07-14",
    readingTime: "6 min read",
    excerpt:
      "When buyers ask a model instead of a search box, citation becomes the new ranking. Here is how brands earn it.",
    body: [
      "For two decades, discovery meant ten blue links. That era is closing. A growing share of commercial questions now ends inside an AI answer, where a single synthesised response replaces the page of options.",
      "The mechanics are unfamiliar but the logic is old: models cite sources they can verify. Encyclopaedic references, national press coverage, structured entity data and consistent naming all raise the probability that your organisation is the one quoted.",
      "This is why we treat public relations, search and entity management as one discipline rather than three. Coverage creates the citable record; structure makes it machine-legible; measurement tells you whether the models actually picked it up.",
      "The practical test is simple. Ask the models what they say about you today, record it, and treat the gap between that answer and your intended narrative as a strategic problem — because it is.",
    ],
  },
  {
    slug: "the-first-six-hours-of-a-crisis",
    title: "The first six hours of a crisis",
    category: "Reputation",
    date: "2026-06-02",
    readingTime: "5 min read",
    excerpt:
      "Most reputational damage is decided before the first statement is drafted. A field guide to the opening window.",
    body: [
      "Crises are rarely lost on the facts. They are lost on tempo — the hours between the first signal and the first credible response, during which other people write your story for you.",
      "The opening window has three jobs: establish what is verifiably true, establish who speaks, and establish the cadence of updates. Everything else can wait.",
      "Organisations that survive scrutiny well tend to have rehearsed this. They have a named decision-maker, a pre-cleared holding statement, and a monitoring feed that tells them where the conversation is actually happening.",
      "That last point is why detection matters as much as drafting. A spike you notice on day three is a different, more expensive problem than one you noticed in hour one.",
    ],
  },
  {
    slug: "share-of-voice-is-not-vanity",
    title: "Share of voice is not vanity — when you measure it properly",
    category: "Intelligence",
    date: "2026-05-09",
    readingTime: "7 min read",
    excerpt:
      "Mention counts flatter. Weighted, competitor-relative share of voice tells you whether you are actually winning the conversation.",
    body: [
      "Raw mention volume is the easiest number to grow and the least useful to own. Ten thousand low-authority mentions can coexist with total invisibility in the outlets your buyers, regulators and investors actually read.",
      "Weighted share of voice fixes this by scoring mentions against outlet authority, audience reach and sentiment, then expressing the result relative to a defined competitive set.",
      "The competitive set is the discipline. Choose three named competitors, hold them constant, and track the delta over quarters rather than weeks.",
      "Done properly, share of voice stops being a slide in a monthly report and becomes a decision input: where to push, where to defend, and where the market is being conceded quietly.",
    ],
  },
  {
    slug: "storytelling-that-sells",
    title: "Storytelling that sells: from coverage to commercial result",
    category: "Strategy",
    date: "2026-03-21",
    readingTime: "5 min read",
    excerpt:
      "Coverage is a means, not an outcome. The bridge between a headline and a signed customer is engineered, not hoped for.",
    body: [
      "Too many agencies focus on vanity mentions that never bring in a single customer or investor. The clipping arrives, the team celebrates, and the pipeline does not move.",
      "The bridge is deliberate: coverage lands, search captures the resulting interest, the site converts it, and retention keeps it. Break any link and the value leaks.",
      "In practice this means planning the landing page before the press release, the retargeting audience before the launch, and the follow-up sequence before the campaign closes.",
      "Narrative engineered, authority institutionalised — and revenue attributable.",
    ],
  },
];

export const getInsight = (slug: string) => insights.find((i) => i.slug === slug);

export type TeamMember = {
  name: string;
  role: string;
  focus: string;
  initials: string;
};

export const team: TeamMember[] = [
  {
    name: "Adebiyi Abdulazeem",
    role: "Founder & Principal Strategist",
    focus: "Narrative strategy, executive positioning, editorial relationships",
    initials: "AA",
  },
  {
    name: "Media Relations Desk",
    role: "Press & Editorial",
    focus: "National print, broadcast and online placements",
    initials: "MR",
  },
  {
    name: "Search & AI Discovery Unit",
    role: "Search Authority",
    focus: "Ranking, entity management and AI citation",
    initials: "SD",
  },
  {
    name: "Creative Studio",
    role: "Design, Film & Copy",
    focus: "Identity systems, video production and conversion copy",
    initials: "CS",
  },
  {
    name: "Intelligence Unit",
    role: "Monitoring & Analysis",
    focus: "Media listening, sentiment, narrative and risk reporting",
    initials: "IU",
  },
  {
    name: "Client Growth",
    role: "Performance & Accounts",
    focus: "Acquisition campaigns, retention and reporting",
    initials: "CG",
  },
];

export const clientSectors = [
  {
    sector: "Banking, Finance & Fintech",
    clients: [
      "Ethica Microfinance Bank",
      "Whitecrust Group",
      "Payvantage",
      "Novacrust",
      "Africa Stablecoin Network",
    ],
  },
  {
    sector: "Technology & Cloud Services",
    clients: ["GO54 (formerly Whogohost)", "Cloudvantage", "SendChamp", "Beebahtics", "Zulfah Academy"],
  },
  {
    sector: "Corporate Giants, Energy & Motors",
    clients: ["BUA Foods Plc / BUA Group", "CIG Motors", "EcoFlow", "Tingo Group"],
  },
  {
    sector: "Food, Beauty, Retail & Agencies",
    clients: [
      "Moppet",
      "M3 Flawless",
      "NurryTreats SuperMarts",
      "Erismart Confectioneries",
      "Sooyah Bistro",
      "Ideas Origin Media (IOM)",
      "Dentsu Nigeria",
    ],
  },
  {
    sector: "Faith-Based & Community Organisations",
    clients: [
      "Muslim Students' Society of Nigeria (MSSN), Lagos",
      "MISFAT Islamic Organisation",
      "Gospel Icon Africa",
      "Islamic Witness Nigeria",
    ],
  },
  {
    sector: "Government & Education",
    clients: [
      "Lagos State Ministry of Education",
      "First Class Muslim Foundation (M-First Series)",
      "Stella Academy",
      "Graceland & Ogudu CDAs",
    ],
  },
];

export const contact = {
  email: "hello@syanmedia.com",
  location: "Lagos, Nigeria",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/syanmedia" },
    { label: "X (Twitter)", href: "https://x.com/syanmedia" },
    { label: "Instagram", href: "https://www.instagram.com/syanmedia" },
    { label: "Facebook", href: "https://www.facebook.com/syanmedia" },
  ],
};

export const process = [
  {
    step: "Step 1",
    title: "Discover & Position",
    what: "We study your business, your market, and what makes you better than competitors.",
    get: "A clear, compelling message that grabs attention immediately.",
  },
  {
    step: "Step 2",
    title: "Launch & Distribute",
    what: "We share your story across major media outlets, run targeted ads, and optimise your web search.",
    get: "Maximum market visibility with zero wasted budget.",
  },
  {
    step: "Step 3",
    title: "Refine & Scale",
    what: "We track feedback, improve your rankings, and optimise campaigns for more inquiries.",
    get: "A rock-solid reputation and steady flow of business opportunities.",
  },
];

export const careers = [
  {
    slug: "senior-media-relations-manager",
    title: "Senior Media Relations Manager",
    type: "Full-time",
    location: "Lagos, Nigeria",
    detail:
      "Own editorial relationships across national business desks and lead placement strategy for flagship accounts.",
  },
  {
    slug: "search-authority-strategist",
    title: "Search & AI Visibility Strategist",
    type: "Full-time",
    location: "Lagos / Hybrid",
    detail:
      "Lead ranking, entity and AI citation programmes across banking, technology and corporate clients.",
  },
  {
    slug: "intelligence-analyst",
    title: "Intelligence Analyst",
    type: "Full-time",
    location: "Lagos / Remote",
    detail:
      "Run monitoring projects inside SYAN Intelligence and turn signal into weekly strategic recommendations.",
  },
  {
    slug: "video-producer",
    title: "Video Producer & Editor",
    type: "Contract",
    location: "Lagos, Nigeria",
    detail:
      "Produce commercials, documentaries and social films for national brand campaigns.",
  },
];

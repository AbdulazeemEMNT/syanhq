export type Capability = {
  id: string;
  number: string;
  name: string;
  promise: string;
  detail: string;
  points: string[];
};

export const capabilities: Capability[] = [
  {
    id: "media-listening",
    number: "01",
    name: "Media Listening",
    promise: "Monitor brand mentions across connected sources.",
    detail:
      "Every licensed source feeds one normalised mention stream, so volume, reach and engagement can be compared across channels rather than read in isolation.",
    points: [
      "Mentions",
      "Reach",
      "Engagement",
      "Sources",
      "Influential authors",
      "Media outlets",
      "Trending mentions",
    ],
  },
  {
    id: "sentiment-intelligence",
    number: "02",
    name: "Sentiment Intelligence",
    promise: "Classify every mention as positive, neutral or negative.",
    detail:
      "Sentiment is scored at mention level and then rolled up by channel and by topic, so you can see where negativity actually concentrates.",
    points: [
      "Sentiment trend",
      "Sentiment by channel",
      "Sentiment by topic",
      "Negative mention alerts",
    ],
  },
  {
    id: "narrative-intelligence",
    number: "03",
    name: "Narrative & Topic Intelligence",
    promise: "See the conversation forming before it hardens.",
    detail:
      "Clustering surfaces emerging topics, recurring themes and narrative shifts, with movement tracked against the previous period.",
    points: [
      "Emerging topics",
      "Major conversations",
      "Narrative shifts",
      "Audience concerns",
      "Recurring themes",
      "Trending subjects",
    ],
  },
  {
    id: "reputation-alerts",
    number: "04",
    name: "Reputation Alerts",
    promise: "Anomaly detection that explains itself.",
    detail:
      "Baselines are learned per project. When volume, reach or sentiment breaks the expected band, an alert is raised with a structured explanation rather than a raw number.",
    points: [
      "Sudden mention spikes",
      "Sudden reach spikes",
      "Rapid negative sentiment",
      "Viral conversations",
      "Competitor activity",
      "Emerging reputation risks",
    ],
  },
  {
    id: "ai-visibility",
    number: "05",
    name: "AI Visibility",
    promise: "Know how AI systems describe you.",
    detail:
      "Tracked prompts are run against supported AI discovery platforms to record whether — and how — your organisation is represented and cited.",
    points: [
      "Brand visibility",
      "AI share of voice",
      "Competitor comparison",
      "Prompts",
      "Brand mentions",
      "Citations and sources",
      "Position and appearance",
      "Visibility trend",
    ],
  },
];

export const alertAnatomy = [
  { label: "What happened", detail: "The measured deviation, with the window it occurred in." },
  { label: "Why it matters", detail: "Exposure, audience and reputational consequence." },
  { label: "What changed", detail: "Comparison against the learned baseline and prior period." },
  { label: "Recommended action", detail: "The communications move, ranked by urgency." },
];

export const aiPlatforms = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Perplexity",
  "Google AI experiences",
  "Other supported AI systems",
];

export const assistantPrompts = [
  "Why did our brand mentions spike this week?",
  "What are people saying about our new campaign?",
  "Which competitors are gaining share of voice?",
  "What are the biggest reputation risks right now?",
  "What topics are emerging in our industry?",
  "Which media outlets are driving the conversation?",
  "What should our communications team prioritise today?",
];

export const architecture = [
  { layer: "Data Provider", detail: "Licensed media, web and social data partners." },
  { layer: "Ingestion Layer", detail: "Scheduled and streaming collection per connected provider." },
  { layer: "Normalisation", detail: "One mention schema: source, author, reach, language, market." },
  { layer: "Analytics Engine", detail: "Volume, reach, share of voice, sentiment and baselines." },
  { layer: "AI Intelligence Layer", detail: "Summarisation, clustering, anomaly explanation." },
  { layer: "SYAN Intelligence API", detail: "A single contract for dashboards and reports." },
  { layer: "Dashboard", detail: "The analyst and client surface." },
];

export const roadmap = [
  {
    phase: "Phase 1",
    status: "Foundation",
    items: ["Brand monitoring", "Sentiment", "Topics", "AI summaries", "Alerts", "Dashboard"],
  },
  {
    phase: "Phase 2",
    status: "Comparative",
    items: ["Competitor intelligence", "Advanced reports", "AI assistant", "Campaign analysis"],
  },
  {
    phase: "Phase 3",
    status: "AI discovery",
    items: ["AI visibility", "LLM monitoring", "Citation analysis", "AI share of voice"],
  },
  {
    phase: "Phase 4",
    status: "Predictive",
    items: [
      "Predictive intelligence",
      "Risk prediction",
      "Narrative forecasting",
      "Strategic recommendations",
    ],
  },
];

export const kpis = [
  { key: "brand-health", label: "Brand Health", unit: "index" },
  { key: "media-reach", label: "Media Reach", unit: "people" },
  { key: "share-of-voice", label: "Share of Voice", unit: "%" },
  { key: "sentiment", label: "Sentiment", unit: "net" },
  { key: "ai-visibility", label: "AI Visibility", unit: "score" },
  { key: "reputation-risk", label: "Reputation Risk", unit: "level" },
];

export const riskLevels = ["Critical", "High", "Medium", "Low"] as const;

export const reportTypes = [
  "Weekly report",
  "Monthly report",
  "Campaign report",
  "Reputation report",
  "Competitor report",
  "AI visibility report",
];

export const adminSections = [
  { name: "Projects", detail: "Create and configure client intelligence projects." },
  { name: "Monitoring Keywords", detail: "Brand, product and executive terms per project." },
  { name: "Competitors", detail: "Named competitive set held constant for benchmarking." },
  { name: "Sources", detail: "Licensed providers, outlets and channels in scope." },
  { name: "Alerts", detail: "Thresholds, baselines and escalation recipients." },
  { name: "Reports", detail: "Scheduled and ad-hoc report generation." },
  { name: "AI Settings", detail: "Summarisation, classification and assistant behaviour." },
  { name: "Integrations", detail: "Provider connections and credential status." },
  { name: "API Connections", detail: "Outbound API keys and consumer applications." },
  { name: "Users", detail: "Staff and client access per project." },
];

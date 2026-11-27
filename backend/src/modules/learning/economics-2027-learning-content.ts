/**
 * Video-first CFA Level I Economics lesson records. Each public video is mapped
 * to its matching 2026 curriculum module; written lesson notes remain pending.
 */
const videos = {
  firms: {
    id: "27rnAR8RaPo",
    title: "Firms and Market Structure - Module 1 – Economics – CFA Level I 2026",
    channel: "FinQuiz Pro",
    language: "English",
  },
  cycles: {
    id: "R1PHRsWMEB8",
    title: "Understanding Business Cycle - Module 2 – Economics – CFA Level I 2026",
    channel: "FinQuiz Pro",
    language: "English",
  },
  fiscal: {
    id: "GTrY8QWZ_Cg",
    title: "Fiscal Policy for CFA Level 1 Hindi | Easy Explanation",
    channel: "BISP Solutions",
    language: "Hindi",
  },
  monetary: {
    id: "xVVPn5ETShg",
    title: "Monetary Policy – Module 4 – Economics – CFA Level I 2026",
    channel: "FinQuiz Pro",
    language: "English",
  },
  geopolitics: {
    id: "rIvNm4Mz8cE",
    title: "Introduction to Geopolitics – Module 5 – Economics – CFA Level I 2026",
    channel: "FinQuiz Pro",
    language: "English",
  },
  trade: {
    id: "sMg0IMb0qg4",
    title: "International Trade – Module 6 – Economics – CFA Level I 2026",
    channel: "FinQuiz Pro",
    language: "English",
  },
  capitalFlows: {
    id: "P-d0NQ8aANo",
    title: "Currency Exchange Rates - Module 7 – Economics – CFA Level I 2026",
    channel: "FinQuiz Pro",
    language: "English",
  },
  exchangeRates: {
    id: "BnmzfQcOZBk",
    title: "Exchange Rate Calculations - Module 8 – Economics – CFA Level I 2026",
    channel: "FinQuiz Pro",
    language: "English",
  },
} as const;

export const economics2027LearningContent = [
  { moduleSlug: "the-firm-and-market-structures", lessonTitle: "How firms compete and choose output", lessonSlug: "firms-market-structures", learningObjectives: ["Compare competitive market structures and explain how they shape pricing and output.", "Apply break-even and shutdown reasoning to a simple firm."], video: videos.firms },
  { moduleSlug: "understanding-business-cycles", lessonTitle: "Reading business and credit cycles", lessonSlug: "business-and-credit-cycles", learningObjectives: ["Describe the phases of a business cycle and how activity indicators behave.", "Explain how credit conditions can amplify economic swings."], video: videos.cycles },
  { moduleSlug: "fiscal-policy", lessonTitle: "How governments use fiscal policy", lessonSlug: "government-fiscal-policy", learningObjectives: ["Compare fiscal and monetary policy goals.", "Explain fiscal tools, debt considerations, and implementation lags."], video: videos.fiscal },
  { moduleSlug: "monetary-policy", lessonTitle: "How central banks influence the economy", lessonSlug: "central-bank-monetary-policy", learningObjectives: ["Describe central-bank tools and how policy changes reach output, inflation, rates, and currencies.", "Distinguish expansionary from contractionary policy and recognize its limits."], video: videos.monetary },
  { moduleSlug: "introduction-to-geopolitics", lessonTitle: "Geopolitics, globalization, and investment risk", lessonSlug: "geopolitics-and-investment-risk", learningObjectives: ["Explain cooperation and competition between countries and the role of international institutions.", "Identify geopolitical tools and assess how geopolitical risk can affect investments."], video: videos.geopolitics },
  { moduleSlug: "international-trade", lessonTitle: "Trade, restrictions, and regional agreements", lessonSlug: "trade-restrictions-and-agreements", learningObjectives: ["Assess gains and costs from international trade.", "Compare tariffs, quotas, subsidies, and regional trade arrangements."], video: videos.trade },
  { moduleSlug: "capital-flows-and-the-fx-market", lessonTitle: "Foreign exchange markets and capital flows", lessonSlug: "fx-markets-and-capital-flows", learningObjectives: ["Explain FX market participants, currency quotations, and exchange-rate regimes.", "Connect currency movements with trade, capital flows, and government restrictions."], video: videos.capitalFlows },
  { moduleSlug: "exchange-rate-calculations", lessonTitle: "Cross-rates and forward exchange rates", lessonSlug: "cross-and-forward-rates", learningObjectives: ["Calculate currency cross-rates and interpret the quote direction.", "Use interest-rate parity to calculate forward rates and identify premiums or discounts."], video: videos.exchangeRates },
].map((item) => ({
  ...item,
  subtopicTitle: "Module overview",
  video: {
    ...item.video,
    sourceUrl: `https://www.youtube.com/watch?v=${item.video.id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${item.video.id}?controls=1&playsinline=1`,
  },
}));

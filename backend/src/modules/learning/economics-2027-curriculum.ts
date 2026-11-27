/** CFA Institute's official 2027 Level I Economics module titles and paraphrased outcomes. */
export const economics2027Curriculum = {
  program: "CFA",
  level: "LEVEL_I" as const,
  curriculumYear: 2027,
  status: "PUBLISHED" as const,
  sourceUrl: "https://www.cfainstitute.org/sites/default/files/2027levelitopicoutline_online.pdf",
  subject: {
    name: "Economics",
    slug: "economics",
    description: "CFA Level I 2027 Economics modules. Lessons and linked videos remain drafts pending review.",
    order: 2,
    status: "PUBLISHED" as const,
  },
  modules: [
    { title: "The Firm and Market Structures", slug: "the-firm-and-market-structures", learningOutcomes: ["Analyze firm break-even and shutdown decisions, scale effects, market structures, pricing, and concentration measures."] },
    { title: "Understanding Business Cycles", slug: "understanding-business-cycles", learningOutcomes: ["Explain business and credit cycles and how economic activity and indicators change across cycle phases."] },
    { title: "Fiscal Policy", slug: "fiscal-policy", learningOutcomes: ["Compare fiscal and monetary policy; explain fiscal objectives, tools, debt, implementation, and policy stance."] },
    { title: "Monetary Policy", slug: "monetary-policy", learningOutcomes: ["Explain central-bank roles, policy tools and transmission, policy targets and limits, and fiscal-policy interactions."] },
    { title: "Introduction to Geopolitics", slug: "introduction-to-geopolitics", learningOutcomes: ["Explain geopolitical cooperation, competition, globalization, institutions, tools, risk, and investment effects."] },
    { title: "International Trade", slug: "international-trade", learningOutcomes: ["Assess trade benefits and costs, restrictions, and regional trade arrangements."] },
    { title: "Capital Flows and the FX Market", slug: "capital-flows-and-the-fx-market", learningOutcomes: ["Explain FX markets and regimes, interpret currency changes, connect exchange rates with trade and capital flows, and describe capital restrictions."] },
    { title: "Exchange Rate Calculations", slug: "exchange-rate-calculations", learningOutcomes: ["Calculate currency cross-rates and forward rates and explain their no-arbitrage links to spot rates and interest rates."] },
  ].map((module, index) => ({ ...module, order: index + 1, status: "PUBLISHED" as const })),
} as const;

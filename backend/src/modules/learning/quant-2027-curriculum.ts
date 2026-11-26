export const quant2027Curriculum = {
  program: "CFA",
  level: "LEVEL_I" as const,
  curriculumYear: 2027,
  status: "PUBLISHED" as const,
  sourceUrl: "https://www.cfainstitute.org/sites/default/files/2027levelitopicoutline_online.pdf",
  subject: {
    name: "Quantitative Methods",
    slug: "quantitative-methods",
    description: "CFA Level I quantitative methods curriculum.",
    order: 1,
    status: "PUBLISHED" as const,
  },
  modules: [
    {
      title: "Returns of Financial Assets and Instruments",
      slug: "returns-of-financial-assets-and-instruments",
      learningOutcomes: ["Describe and interpret investment returns, required returns, risk-free rates, risk premia, and inflation."],
    },
    {
      title: "Types of Financial Returns",
      slug: "types-of-financial-returns",
      learningOutcomes: ["Calculate and compare return measures for financial assets, instruments, and indicators."],
    },
    {
      title: "Benchmarking Returns",
      slug: "benchmarking-returns",
      learningOutcomes: ["Compare money-weighted and time-weighted returns and explain weighting choices in index construction."],
    },
    {
      title: "The Time Value of Money in Finance",
      slug: "time-value-of-money-in-finance",
      learningOutcomes: ["Value fixed-income and equity cash flows and explain how cash-flow additivity supports forward rates and option values."],
    },
    {
      title: "Statistical Characteristics of Asset Returns",
      slug: "statistical-characteristics-of-asset-returns",
      learningOutcomes: ["Evaluate central tendency, dispersion, distribution shape, covariance, correlation, semi-deviation, and coefficient of variation."],
    },
    {
      title: "Statistical Distributions for Financial Asset Prices and Returns",
      slug: "statistical-distributions-for-financial-asset-prices-and-returns",
      learningOutcomes: ["Work with unconditional and conditional moments of financial distributions and apply Bayesian updating to investment problems."],
    },
    {
      title: "Estimation and Hypothesis Testing",
      slug: "estimation-and-hypothesis-testing",
      learningOutcomes: ["Explain sampling, confidence intervals, test errors, statistical power, and the selection and interpretation of parametric and non-parametric tests."],
    },
    {
      title: "The Return and Risk of a Financial Portfolio",
      slug: "return-and-risk-of-a-financial-portfolio",
      learningOutcomes: ["Evaluate portfolio return and risk, minimum-variance and efficient portfolios, and optimal allocations for risk preferences."],
    },
    {
      title: "Simulation of Financial Asset Prices and Returns",
      slug: "simulation-of-financial-asset-prices-and-returns",
      learningOutcomes: ["Explain historical simulation, bootstrap resampling, and Monte Carlo simulation in investment analysis."],
    },
    {
      title: "Applications of Simple Linear Regression in Finance",
      slug: "applications-of-simple-linear-regression-in-finance",
      learningOutcomes: ["Estimate and assess simple regressions, interpret residuals and fit, make predictions, and estimate CAPM variables."],
    },
    {
      title: "Introduction to Financial Data Science",
      slug: "introduction-to-financial-data-science",
      learningOutcomes: ["Describe how data-intensive methods, machine learning, and AI are used in financial analysis and investment management."],
    },
  ].map((item, index) => ({ ...item, order: index + 1, status: "PUBLISHED" as const })),
};

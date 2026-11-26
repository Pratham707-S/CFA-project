import { Subject, ResourceItem, RelatedTopicItem, ExampleProblem, PracticeQuestion } from "./types";

export const cfaSubjects: Subject[] = [
  {
    id: "quant",
    name: "Quantitative Methods",
    iconType: "quant",
    completedTopics: 3,
    totalTopics: 12,
    topics: [
      {
        id: "tvm",
        title: "Time Value of Money",
        completed: false,
        lessons: [
          {
            id: "tvm-1",
            title: "Time Value of Money",
            duration: "18 min",
            completed: false,
            videoUrl: "",
            keyConcepts: [
              "Present Value (PV) and Future Value (FV)",
              "Compounding and discounting",
              "Ordinary and annuity due",
              "Perpetuities",
              "Applications in valuation and capital budgeting",
            ],
            quickNote:
              "The time value of money means that a dollar today is worth more than a dollar in the future due to its earning potential.",
          },
        ],
      },
      { id: "stat-concepts", title: "Statistical Concepts", completed: false },
      { id: "probability", title: "Probability", completed: false },
      { id: "sampling", title: "Sampling and Estimation", completed: false },
      { id: "hypothesis", title: "Hypothesis Testing", completed: false },
      { id: "regression", title: "Regression Analysis", completed: false },
      { id: "timeseries", title: "Time Series", completed: false },
      { id: "other-quant", title: "Other Topics", completed: false },
    ],
  },
  {
    id: "econ",
    name: "Economics",
    iconType: "econ",
    completedTopics: 0,
    totalTopics: 10,
    topics: [
      { id: "econ-1", title: "Demand and Supply Analysis", completed: false },
      { id: "econ-2", title: "Consumer and Firm Behavior", completed: false },
      { id: "econ-3", title: "Market Structures", completed: false },
      { id: "econ-4", title: "Aggregate Output & Income", completed: false },
      { id: "econ-5", title: "Monetary and Fiscal Policy", completed: false },
      { id: "econ-6", title: "International Trade & Capital Flows", completed: false },
    ],
  },
  {
    id: "fsa",
    name: "Financial Statement Analysis",
    iconType: "fsa",
    completedTopics: 0,
    totalTopics: 14,
    topics: [
      { id: "fsa-1", title: "Financial Reporting Standards", completed: false },
      { id: "fsa-2", title: "Understanding Income Statements", completed: false },
      { id: "fsa-3", title: "Understanding Balance Sheets", completed: false },
      { id: "fsa-4", title: "Understanding Cash Flow Statements", completed: false },
      { id: "fsa-5", title: "Financial Analysis Techniques", completed: false },
      { id: "fsa-6", title: "Inventories", completed: false },
      { id: "fsa-7", title: "Long-Lived Assets", completed: false },
      { id: "fsa-8", title: "Income Taxes", completed: false },
    ],
  },
  {
    id: "corp",
    name: "Corporate Issuers",
    iconType: "corp",
    completedTopics: 0,
    totalTopics: 9,
    topics: [
      { id: "corp-1", title: "Corporate Governance & ESG", completed: false },
      { id: "corp-2", title: "Capital Investment Decisions", completed: false },
      { id: "corp-3", title: "Cost of Capital", completed: false },
      { id: "corp-4", title: "Working Capital Management", completed: false },
    ],
  },
  {
    id: "equity",
    name: "Equity Investments",
    iconType: "equity",
    completedTopics: 0,
    totalTopics: 12,
    topics: [
      { id: "equity-1", title: "Market Organization and Structure", completed: false },
      { id: "equity-2", title: "Security Market Indices", completed: false },
      { id: "equity-3", title: "Market Efficiency", completed: false },
      { id: "equity-4", title: "Overview of Equity Securities", completed: false },
      { id: "equity-5", title: "Industry and Company Analysis", completed: false },
      { id: "equity-6", title: "Equity Valuation: Concepts and Basic Models", completed: false },
    ],
  },
  {
    id: "fixed",
    name: "Fixed Income",
    iconType: "fixed",
    completedTopics: 0,
    totalTopics: 11,
    topics: [
      { id: "fixed-1", title: "Fixed-Income Securities: Defining Elements", completed: false },
      { id: "fixed-2", title: "Fixed-Income Markets: Issuance and Trading", completed: false },
      { id: "fixed-3", title: "Introduction to Fixed-Income Valuation", completed: false },
      { id: "fixed-4", title: "Yield and Spread Measures", completed: false },
      { id: "fixed-5", title: "Asset-Backed Securities (ABS)", completed: false },
      { id: "fixed-6", title: "Credit Analysis Fundamentals", completed: false },
    ],
  },
  {
    id: "deriv",
    name: "Derivatives",
    iconType: "deriv",
    completedTopics: 0,
    totalTopics: 6,
    topics: [
      { id: "deriv-1", title: "Derivative Markets and Instruments", completed: false },
      { id: "deriv-2", title: "Basics of Derivative Pricing and Valuation", completed: false },
      { id: "deriv-3", title: "Pricing and Valuation of Forward Commitments", completed: false },
      { id: "deriv-4", title: "Valuation of Contingent Claims", completed: false },
    ],
  },
  {
    id: "alt",
    name: "Alternative Investments",
    iconType: "alt",
    completedTopics: 0,
    totalTopics: 6,
    topics: [
      { id: "alt-1", title: "Overview of Alternative Investments", completed: false },
      { id: "alt-2", title: "Real Estate and Infrastructure", completed: false },
      { id: "alt-3", title: "Private Capital and Private Debt", completed: false },
      { id: "alt-4", title: "Hedge Funds and Commodities", completed: false },
    ],
  },
  {
    id: "port",
    name: "Portfolio Management",
    iconType: "port",
    completedTopics: 0,
    totalTopics: 8,
    topics: [
      { id: "port-1", title: "Portfolio Management: An Overview", completed: false },
      { id: "port-2", title: "Portfolio Risk and Return: Part I", completed: false },
      { id: "port-3", title: "Portfolio Risk and Return: Part II", completed: false },
      { id: "port-4", title: "Basics of Portfolio Planning and Construction", completed: false },
    ],
  },
  {
    id: "ethics",
    name: "Ethics",
    iconType: "ethics",
    completedTopics: 0,
    totalTopics: 10,
    topics: [
      { id: "ethics-1", title: "Ethics and Trust in the Investment Profession", completed: false },
      { id: "ethics-2", title: "Code of Ethics and Standards of Professional Conduct", completed: false },
      { id: "ethics-3", title: "Guidance for Standards I-VII", completed: false },
      { id: "ethics-4", title: "Introduction to the Global Investment Performance Standards (GIPS)", completed: false },
    ],
  },
];

export const lessonResources: ResourceItem[] = [
  {
    id: "res-1",
    title: "Formula Sheet",
    subtitle: "TVM formulas",
    fileType: "pdf",
    color: "#ef4444", // Red badge
  },
  {
    id: "res-2",
    title: "Summary Notes",
    subtitle: "Key takeaways",
    fileType: "doc",
    color: "#3b82f6", // Blue badge
  },
  {
    id: "res-3",
    title: "Practice Questions",
    subtitle: "20 questions",
    fileType: "doc",
    color: "#10b981", // Green badge
  },
  {
    id: "res-4",
    title: "Real World Examples",
    subtitle: "Applications in finance",
    fileType: "sheet",
    color: "#f59e0b", // Amber/yellow badge
  },
];

export const relatedTopics: RelatedTopicItem[] = [
  { id: "rel-1", title: "Annuities" },
  { id: "rel-2", title: "Perpetuities" },
  { id: "rel-3", title: "Bond Valuation Basics" },
  { id: "rel-4", title: "Capital Budgeting" },
  { id: "rel-5", title: "NPV and IRR" },
];

export const exampleProblems: ExampleProblem[] = [
  {
    id: "ex-1",
    title: "Example 1: Future Value of a Lump Sum",
    problem:
      "An investor deposits $10,000 into an account paying 6.0% annual compound interest. How much will be in the account after 5 years?",
    formula: "FV = PV × (1 + r)^n",
    solutionSteps: [
      "Identify the variables: PV = $10,000, r = 0.06, n = 5 years.",
      "Calculate the compound factor: (1 + 0.06)^5 = 1.338225.",
      "Multiply by the principal: FV = $10,000 × 1.338225 = $13,382.25.",
    ],
    finalAnswer: "$13,382.25",
  },
  {
    id: "ex-2",
    title: "Example 2: Present Value of an Ordinary Annuity",
    problem:
      "An individual will receive $2,500 at the end of each year for the next 4 years. The applicable discount rate is 8.0%. What is the present value of this annuity stream?",
    formula: "PV_annuity = PMT × [ 1 - (1 + r)^(-n) ] / r",
    solutionSteps: [
      "Identify the variables: PMT = $2,500, r = 0.08, n = 4.",
      "Calculate discount factor: [1 - (1.08)^(-4)] / 0.08 = [1 - 0.73503] / 0.08 = 3.31213.",
      "Multiply by PMT: PV = $2,500 × 3.31213 = $8,280.32.",
    ],
    finalAnswer: "$8,280.32",
  },
  {
    id: "ex-3",
    title: "Example 3: Valuing a Growing Perpetuity",
    problem:
      "A preferred stock is expected to pay an initial dividend of $4.00 next year (D1). Dividends are projected to grow at a constant rate of 2.5% indefinitely. The required rate of return is 9.0%. Calculate the intrinsic value of the share today.",
    formula: "PV_perpetuity = D_1 / (r - g)",
    solutionSteps: [
      "Identify variables: D_1 = $4.00, r = 0.09, g = 0.025.",
      "Ensure condition r > g holds: 0.09 > 0.025 (satisfied).",
      "Calculate net discount rate: r - g = 0.09 - 0.025 = 0.065.",
      "Divide: PV = $4.00 / 0.065 = $61.54.",
    ],
    finalAnswer: "$61.54",
  },
];

export const practiceQuestions: PracticeQuestion[] = [
  {
    id: "q-1",
    question:
      "An analyst calculates the present value of a 5-year annuity due paying $5,000 annually at a discount rate of 7%. Compared to an identical ordinary annuity, the value of the annuity due is:",
    options: [
      { id: "A", label: "A", text: "Equal to the ordinary annuity." },
      { id: "B", label: "B", text: "Greater by a factor of (1 + 0.07)." },
      { id: "C", label: "C", text: "Lower by a factor of (1 + 0.07)." },
    ],
    correctOptionId: "B",
    explanation:
      "An annuity due has payments occurring at the beginning of each period rather than at the end. Because each cash flow is received one period sooner, every cash flow is discounted by one less period, making the present value of an annuity due equal to PV(ordinary annuity) × (1 + r).",
  },
  {
    id: "q-2",
    question:
      "An investor is evaluating an investment that promises to pay $1,200 per year in perpetuity starting one year from today. If the investor's required rate of return is 8.0%, what is the maximum price they should be willing to pay?",
    options: [
      { id: "A", label: "A", text: "$12,000" },
      { id: "B", label: "B", text: "$15,000" },
      { id: "C", label: "C", text: "$16,200" },
    ],
    correctOptionId: "B",
    explanation:
      "For a level perpetuity, PV = PMT / r. Here PMT = $1,200 and r = 0.08. PV = 1,200 / 0.08 = $15,000.",
  },
  {
    id: "q-3",
    question:
      "Which of the following compounding frequencies produces the highest effective annual rate (EAR) for a given stated annual nominal rate of 10%?",
    options: [
      { id: "A", label: "A", text: "Quarterly compounding" },
      { id: "B", label: "B", text: "Monthly compounding" },
      { id: "C", label: "C", text: "Continuous compounding" },
    ],
    correctOptionId: "C",
    explanation:
      "As the compounding frequency increases, the interest earned on interest compounds more frequently. Continuous compounding represents the mathematical upper bound where EAR = e^r - 1, producing the highest yield.",
  },
];


```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to get user input
function getUserInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

// Function to calculate compound interest
function calculateCompoundInterest(principal, rate, time, compoundingFrequency) {
  const amount =
    principal * Math.pow(1 + rate / (100 * compoundingFrequency), compoundingFrequency * time);
  const interest = amount - principal;
  return {
    principal: Number(principal.toFixed(2)),
    finalAmount: Number(amount.toFixed(2)),
    totalInterest: Number(interest.toFixed(2)),
    rate: rate,
    time: time,
    frequency: compoundingFrequency,
  };
}

// Tool definitions for Claude
const tools = [
  {
    name: "calculate_compound_interest",
    description:
      "Calculate compound interest for an investment. Returns the final amount and total interest earned.",
    input_schema: {
      type: "object",
      properties: {
        principal: {
          type: "number",
          description: "Initial investment amount in dollars",
        },
        annual_rate: {
          type: "number",
          description: "Annual interest rate as a percentage (e.g., 5 for 5%)",
        },
        years: {
          type: "number",
          description: "Investment period in years",
        },
        compounding_frequency: {
          type: "number",
          description: "How many times per year interest is compounded (1=annually, 2=semi-annually, 4=quarterly, 12=monthly)",
        },
      },
      required: ["principal", "annual_rate", "years", "compounding_frequency"],
    },
  },
  {
    name: "compare_investments",
    description:
      "Compare two different investment scenarios to see which one yields better returns",
    input_schema: {
      type: "object",
      properties: {
        investment1_principal: {
          type: "number",
          description: "Initial amount for first investment",
        },
        investment1_rate: {
          type: "number",
          description: "Annual rate for first investment",
        },
        investment1_years: {
          type: "number",
          description: "Investment period for first investment in years",
        },
        investment1_frequency: {
          type: "number",
          description: "Compounding frequency for first investment",
        },
        investment2_principal: {
          type: "number",
          description: "Initial amount for second investment",
        },
        investment2_rate: {
          type: "number",
          description: "Annual rate for second investment",
        },
        investment2_years: {
          type: "number",
          description: "Investment period for second investment in years",
        },
        investment2_frequency: {
          type: "number",
          description: "Compounding frequency for second investment",
        },
      },
      required: [
        "investment1_principal",
        "investment1_rate",
        "investment1_years",
        "investment1_frequency",
        "investment2_principal",
        "investment2_rate",
        "investment2_years",
        "investment2_frequency",
      ],
    },
  },
];

// Process tool calls
function processToolCall(toolName, toolInput) {
  if (toolName === "calculate_compound_interest") {
    const result = calculateCompoundInterest(
      toolInput.principal,
      toolInput.annual_rate,
      toolInput.years,
      toolInput.compounding_frequency,
    );
    return JSON.stringify(result);
  } else if (toolName === "compare_investments") {
    const inv1 = calculateCompoundInterest(
      toolInput.investment1_principal,
      toolInput.investment1_rate,
      toolInput.investment1_years,
      toolInput.investment1_frequency,
    );
    const inv2 = calculateCompoundInterest(
      toolInput.investment2_principal,
      toolInput.investment2_rate,
      toolInput.investment2_years,
      toolInput.investment2_frequency,
    );
    const comparison = {
      investment1: inv1,
      investment2: inv2,
      betterInvestment: inv1.finalAmount > inv2.finalAmount ? "Investment 1" : "Investment 2",
      differenceFinal: Number(Math.abs(inv1.finalAmount - inv2.finalAmount).toFixed(2)),
      differenceInterest: Number(Math.abs(inv1.totalInterest - inv2.totalInterest).toFixed(2)),
    };
    return JSON.stringify(comparison);
  }
  return JSON.stringify({ error: "Unknown tool" });
}

async function runCompoundInterestCalculator() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║    Compound Interest Calculator for Long-Term Investments   ║");
  console.log("║                  Powered by Claude AI                       ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const conversationHistory = [];

  // Initial system message
  const systemMessage = `You are an expert financial advisor specializing in compound interest calculations and long-term investment strategies. 
Your role is to help users understand how their investments grow over time using compound interest.

When users ask about investments, guide them through the calculation process:
1. Ask for the principal amount (initial investment)
2. Ask for the annual interest rate
3. Ask for the investment period in years
4. Ask for the compounding frequency (annual, semi-annual, quarterly, or monthly)
5. Use the calculate_compound_interest tool to
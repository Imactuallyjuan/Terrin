import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface ProjectData {
  title: string;
  description: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  location: string;
}

interface CostEstimate {
  totalCostMin: string;
  totalCostMax: string;
  timeline: string;
  materialsCostMin: string;
  materialsCostMax: string;
  laborCostMin: string;
  laborCostMax: string;
  permitsCostMin: string;
  permitsCostMax: string;
  contingencyCostMin: string;
  contingencyCostMax: string;
  analysis: any;
}

export async function generateCostEstimate(projectData: ProjectData): Promise<CostEstimate> {
  try {
    const prompt = `
As a construction cost estimation expert, analyze the following project and provide a detailed cost breakdown in JSON format.

Project Details:
- Title: ${projectData.title}
- Type: ${projectData.projectType}
- Description: ${projectData.description}
- Budget Range: ${projectData.budgetRange}
- Timeline: ${projectData.timeline}
- Location: ${projectData.location}

Please provide cost estimates in USD with the following structure:
{
  "totalCostMin": "minimum total cost as string number",
  "totalCostMax": "maximum total cost as string number",
  "timeline": "realistic timeline description",
  "materialsCostMin": "minimum materials cost as string number",
  "materialsCostMax": "maximum materials cost as string number",
  "laborCostMin": "minimum labor cost as string number",
  "laborCostMax": "maximum labor cost as string number",
  "permitsCostMin": "minimum permits and fees cost as string number",
  "permitsCostMax": "maximum permits and fees cost as string number",
  "contingencyCostMin": "minimum contingency (10%) as string number",
  "contingencyCostMax": "maximum contingency (10%) as string number",
  "analysis": {
    "factors": ["list of cost factors considered"],
    "assumptions": ["key assumptions made"],
    "recommendations": ["recommendations for the project"],
    "riskFactors": ["potential risk factors that could affect cost"]
  }
}

Consider current market rates, regional pricing variations, material costs, labor availability, permit requirements, and project complexity. Ensure the contingency is calculated as 10% of the subtotal (materials + labor + permits).
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert construction cost estimator with 20+ years of experience. Provide accurate, detailed cost estimates based on current market conditions and industry standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate the response has all required fields
    const requiredFields = [
      'totalCostMin', 'totalCostMax', 'timeline', 'materialsCostMin', 
      'materialsCostMax', 'laborCostMin', 'laborCostMax', 'permitsCostMin', 
      'permitsCostMax', 'contingencyCostMin', 'contingencyCostMax', 'analysis'
    ];

    for (const field of requiredFields) {
      if (!result[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return result as CostEstimate;
  } catch (error) {
    console.error("Error generating cost estimate:", error);
    throw new Error("Failed to generate cost estimate: " + (error as Error).message);
  }
}

export async function analyzeProjectComplexity(projectData: ProjectData): Promise<{
  complexity: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
}> {
  try {
    const prompt = `
Analyze the complexity of this construction project and provide recommendations:

Project: ${projectData.title}
Type: ${projectData.projectType}
Description: ${projectData.description}
Timeline: ${projectData.timeline}
Location: ${projectData.location}

Respond with JSON in this format:
{
  "complexity": "low/medium/high",
  "factors": ["factors affecting complexity"],
  "recommendations": ["specific recommendations for this project"]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a construction project manager expert. Analyze project complexity and provide actionable recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error analyzing project complexity:", error);
    throw new Error("Failed to analyze project complexity: " + (error as Error).message);
  }
}

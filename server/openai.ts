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
    console.log("Generating cost estimate for project:", projectData.title);
    
    const prompt = `
You are a construction cost estimation expert with 20+ years of experience. Analyze the following project and provide a detailed cost breakdown in JSON format.

Project Details:
- Title: ${projectData.title}
- Type: ${projectData.projectType}
- Description: ${projectData.description}
- Budget Range: ${projectData.budgetRange}
- Timeline: ${projectData.timeline}
- Location: ${projectData.location}

Provide accurate cost estimates in USD with this exact JSON structure:
{
  "totalCostMin": "25000",
  "totalCostMax": "45000",
  "timeline": "8-12 weeks",
  "materialsCostMin": "15000",
  "materialsCostMax": "25000",
  "laborCostMin": "8000",
  "laborCostMax": "15000",
  "permitsCostMin": "500",
  "permitsCostMax": "2000",
  "contingencyCostMin": "1500",
  "contingencyCostMax": "3000",
  "analysis": {
    "factors": ["Current market rates", "Regional pricing", "Project complexity"],
    "assumptions": ["Standard materials quality", "Licensed contractor rates"],
    "recommendations": ["Get multiple quotes", "Consider material timing"],
    "riskFactors": ["Material price fluctuations", "Permit delays"]
  }
}

Important: Return ONLY valid JSON. All cost values must be numeric strings without dollar signs or commas.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert construction cost estimator. Provide accurate, realistic estimates based on current market conditions. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    console.log("OpenAI response received, parsing...");
    const result = JSON.parse(content);
    
    // Validate and ensure all required fields exist
    const requiredFields = [
      'totalCostMin', 'totalCostMax', 'timeline', 'materialsCostMin', 
      'materialsCostMax', 'laborCostMin', 'laborCostMax', 'permitsCostMin', 
      'permitsCostMax', 'contingencyCostMin', 'contingencyCostMax'
    ];

    const estimate: CostEstimate = {
      totalCostMin: result.totalCostMin || "20000",
      totalCostMax: result.totalCostMax || "40000",
      timeline: result.timeline || "6-10 weeks",
      materialsCostMin: result.materialsCostMin || "12000",
      materialsCostMax: result.materialsCostMax || "22000",
      laborCostMin: result.laborCostMin || "6000",
      laborCostMax: result.laborCostMax || "15000",
      permitsCostMin: result.permitsCostMin || "500",
      permitsCostMax: result.permitsCostMax || "1500",
      contingencyCostMin: result.contingencyCostMin || "1500",
      contingencyCostMax: result.contingencyCostMax || "2500",
      analysis: result.analysis || {
        factors: ["Project scope", "Material costs", "Labor rates"],
        assumptions: ["Standard quality materials", "Normal market conditions"],
        recommendations: ["Get detailed quotes", "Plan for contingencies"],
        riskFactors: ["Material availability", "Weather delays"]
      }
    };

    console.log("Cost estimate generated successfully");
    return estimate;
  } catch (error) {
    console.error("Error generating cost estimate:", error);
    throw new Error("Failed to generate cost estimate. Please check your project details and try again.");
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

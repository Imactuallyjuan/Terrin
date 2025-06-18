import OpenAI from "openai";

// Using gpt-4o-mini for cost-effective AI estimates as requested by user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
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
You are a construction cost estimation expert with 20+ years of experience. Analyze the following project carefully and provide realistic, project-specific cost estimates.

CRITICAL: Each project type has vastly different costs. Provide accurate estimates based on the actual project scope:
- New home construction: $200,000-$500,000+
- Large additions/major remodels: $50,000-$200,000
- Garage additions: $15,000-$40,000
- Kitchen remodels: $25,000-$75,000
- Bathroom remodels: $8,000-$25,000
- Small renovations: $3,000-$15,000

Project Details:
- Title: ${projectData.title}
- Type: ${projectData.projectType}
- Description: ${projectData.description}
- Budget Range: ${projectData.budgetRange}
- Timeline: ${projectData.timeline}
- Location: ${projectData.location}

Based on the project type "${projectData.projectType}" and description "${projectData.description}", provide realistic cost estimates that reflect the actual scope of work.

Return this exact JSON structure with realistic values for the project scope:
{
  "totalCostMin": "realistic_minimum_cost",
  "totalCostMax": "realistic_maximum_cost", 
  "timeline": "realistic_timeline",
  "materialsCostMin": "materials_cost_min",
  "materialsCostMax": "materials_cost_max",
  "laborCostMin": "labor_cost_min",
  "laborCostMax": "labor_cost_max",
  "permitsCostMin": "permits_cost_min",
  "permitsCostMax": "permits_cost_max",
  "contingencyCostMin": "contingency_cost_min",
  "contingencyCostMax": "contingency_cost_max",
  "analysis": {
    "factors": ["project-specific cost factors"],
    "assumptions": ["project-specific assumptions"],
    "recommendations": ["project-specific recommendations"],
    "riskFactors": ["project-specific risks"]
  }
}

IMPORTANT: Return ONLY valid JSON. All cost values must be numeric strings without dollar signs or commas. Make sure costs accurately reflect the specific project type and description provided.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    console.log("Raw OpenAI response:", content);
    
    const result = JSON.parse(content);
    console.log("Parsed OpenAI result:", result);
    
    // Validate that we have actual values from AI, not just defaults
    if (!result.totalCostMin || !result.totalCostMax) {
      throw new Error("OpenAI did not provide valid cost estimates");
    }

    const estimate: CostEstimate = {
      totalCostMin: result.totalCostMin,
      totalCostMax: result.totalCostMax,
      timeline: result.timeline,
      materialsCostMin: result.materialsCostMin,
      materialsCostMax: result.materialsCostMax,
      laborCostMin: result.laborCostMin,
      laborCostMax: result.laborCostMax,
      permitsCostMin: result.permitsCostMin,
      permitsCostMax: result.permitsCostMax,
      contingencyCostMin: result.contingencyCostMin,
      contingencyCostMax: result.contingencyCostMax,
      analysis: result.analysis
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
      model: "gpt-4o-mini",
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

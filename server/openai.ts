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
  tradeBreakdowns: {
    carpentry?: { min: string; max: string; };
    electrical?: { min: string; max: string; };
    plumbing?: { min: string; max: string; };
    hvac?: { min: string; max: string; };
    flooring?: { min: string; max: string; };
    painting?: { min: string; max: string; };
    roofing?: { min: string; max: string; };
    concrete?: { min: string; max: string; };
    landscaping?: { min: string; max: string; };
  };
  analysis: any;
}

export async function generateCostEstimate(projectData: ProjectData): Promise<CostEstimate> {
  try {
    console.log("Generating cost estimate for project:", projectData.title);
    
    const prompt = `
You are a construction cost estimation expert with 20+ years of experience. Analyze the following project carefully and provide realistic, project-specific cost estimates.

CRITICAL: Each project type has vastly different costs AND location significantly affects pricing. Consider both project scope and regional cost variations:

Project Type Base Ranges:
- New home construction: $200,000-$500,000+
- Large additions/major remodels: $50,000-$200,000
- Garage additions: $15,000-$40,000
- Kitchen remodels: $25,000-$75,000
- Bathroom remodels: $8,000-$25,000
- Small renovations: $3,000-$15,000

Regional Cost Multipliers (adjust base ranges accordingly):
- High-cost areas (CA, NY, WA, MA): 1.3-2.0x base costs
- Medium-cost areas (TX, FL, CO, NC): 0.9-1.2x base costs
- Lower-cost areas (AL, MS, OK, WV): 0.6-0.9x base costs
- Rural vs Urban: Rural typically 15-25% less than urban areas

Project Details:
- Title: ${projectData.title}
- Type: ${projectData.projectType}
- Description: ${projectData.description}
- Budget Range: ${projectData.budgetRange}
- Timeline: ${projectData.timeline}
- Location: ${projectData.location}

Based on the project type "${projectData.projectType}", description "${projectData.description}", and location "${projectData.location}", provide realistic cost estimates that reflect both the actual scope of work AND the regional pricing for this specific location.

TRADE BREAKDOWN ANALYSIS: Only include trades that are actually required for this specific project. Analyze the project type and description to determine which trades are needed:
- Garage addition: typically needs carpentry, electrical, concrete, roofing (skip plumbing unless utilities required)
- Concrete slab/driveway: concrete work only
- Electrical rewiring: electrical work and permits only  
- Kitchen remodel: carpentry, electrical, plumbing, flooring, painting
- Bathroom remodel: plumbing, electrical, flooring, painting
- Roof replacement: roofing only
- HVAC installation: HVAC only
- Basement finishing: carpentry, electrical, flooring, painting (plumbing if bathroom added)
- Deck/patio: carpentry, concrete (if applicable)

LOCATION ANALYSIS REQUIRED: Consider the cost of living, labor rates, material costs, and permit fees specific to "${projectData.location}". Factor in whether this is an urban or rural area, and apply appropriate regional multipliers to the base project costs.

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
  "tradeBreakdowns": {
    // ONLY include trades that are actually required for this specific project
    // Examples by project type:
    // - Garage addition: carpentry, electrical, concrete, roofing (skip plumbing if no utilities)
    // - Concrete slab: concrete only
    // - Electrical rewiring: electrical only
    // - Kitchen remodel: carpentry, electrical, plumbing, flooring, painting
    // - Bathroom remodel: plumbing, electrical, flooring, painting
    // Format: "tradeName": {"min": "cost_min", "max": "cost_max"}
  },
  "analysis": {
    "factors": ["project-specific cost factors"],
    "assumptions": ["project-specific assumptions"],
    "recommendations": ["project-specific recommendations"],
    "riskFactors": ["project-specific risks"]
  }
}

IMPORTANT: 
- Return ONLY valid JSON. All cost values must be numeric strings without dollar signs or commas. 
- Make sure costs accurately reflect the specific project type and description provided.
- In tradeBreakdowns, ONLY include trades that are actually needed for this specific project. Do not include all possible trades.
- If a project only needs one trade (like "concrete driveway" = concrete only), only include that trade.
- If a project doesn't need a particular trade (like "garage addition without plumbing"), don't include that trade.
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
      tradeBreakdowns: result.tradeBreakdowns || {},
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

interface ProjectMilestone {
  title: string;
  description: string;
  order: number;
  estimatedDays: number;
  progressWeight: number;
  dependencies?: string[];
}

interface TimelineData {
  milestones: ProjectMilestone[];
  totalDuration: number;
  criticalPath: string[];
  phases: {
    name: string;
    milestones: string[];
    duration: number;
  }[];
}

export async function generateProjectTimeline(projectData: ProjectData): Promise<TimelineData> {
  try {
    console.log("Generating timeline for project:", projectData.title);
    
    const prompt = `
You are a construction project management expert with 25+ years of experience. Analyze the following project and create a comprehensive, realistic timeline with milestones.

PROJECT DETAILS:
- Title: ${projectData.title}
- Description: ${projectData.description}
- Project Type: ${projectData.projectType}
- Location: ${projectData.location}
- Timeline: ${projectData.timeline}
- Budget: ${projectData.budgetRange}

CRITICAL REQUIREMENTS:
1. Create project-specific milestones based on the actual work described
2. Consider logical dependencies (foundation before framing, plumbing rough-in before drywall, etc.)
3. Assign realistic durations in days for each milestone
4. Weight milestones by complexity (simple tasks 5-10%, major phases 15-25%)
5. Include only necessary trades/phases for this specific project
6. Consider weather, permits, inspections, and material delivery delays

EXAMPLES OF PROJECT-SPECIFIC MILESTONES:

Kitchen Renovation:
- Design & Permits (7 days, 5%)
- Demolition (3 days, 10%)
- Electrical Rough-in (2 days, 8%)
- Plumbing Rough-in (2 days, 8%)
- Drywall & Paint (5 days, 15%)
- Cabinet Installation (4 days, 20%)
- Countertop Installation (2 days, 10%)
- Flooring (3 days, 12%)
- Final Fixtures & Cleanup (2 days, 12%)

House Construction:
- Site Preparation (5 days, 5%)
- Foundation (10 days, 15%)
- Framing (14 days, 20%)
- Roofing (7 days, 12%)
- Electrical Rough-in (5 days, 8%)
- Plumbing Rough-in (4 days, 8%)
- Insulation (3 days, 5%)
- Drywall (8 days, 10%)
- Flooring (6 days, 8%)
- Final Fixtures (4 days, 5%)
- Exterior Finish (5 days, 4%)

Bathroom Renovation:
- Design & Permits (5 days, 8%)
- Demolition (2 days, 12%)
- Plumbing Rough-in (2 days, 15%)
- Electrical Rough-in (1 day, 8%)
- Waterproofing (1 day, 10%)
- Tile Work (4 days, 20%)
- Vanity & Fixtures (2 days, 15%)
- Final Plumbing (1 day, 12%)

Return ONLY valid JSON in this format:
{
  "milestones": [
    {
      "title": "milestone_name",
      "description": "detailed description of work",
      "order": 1,
      "estimatedDays": 5,
      "progressWeight": 15,
      "dependencies": ["previous_milestone_titles"]
    }
  ],
  "totalDuration": 45,
  "criticalPath": ["milestone_titles_on_critical_path"],
  "phases": [
    {
      "name": "phase_name",
      "milestones": ["milestone_titles_in_phase"],
      "duration": 20
    }
  ]
}

IMPORTANT:
- All progressWeight values must sum to 100%
- estimatedDays should be realistic for the scope
- Include dependencies for proper sequencing
- Only include milestones actually needed for THIS project
- Consider permit requirements, inspections, and material lead times
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert construction project manager. Create realistic, project-specific timelines with proper dependencies and sequencing. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    console.log("Timeline response received, parsing...");
    console.log("Raw timeline response:", content);

    const timelineData: TimelineData = JSON.parse(content);
    
    console.log("Parsed timeline result:", timelineData);
    console.log("Timeline generated successfully");

    return timelineData;
  } catch (error) {
    console.error("Error generating timeline:", error);
    throw new Error(`Failed to generate project timeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

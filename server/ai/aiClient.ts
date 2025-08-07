import OpenAI from "openai";

// Initialize OpenAI client with API key from environment
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default model from environment or fallback to gpt-4o
const DEFAULT_MODEL = process.env.AI_MODEL || "gpt-4o";

export interface ChatCompletionRequest {
  systemPrompt?: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatCompletionResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

/**
 * Generate a chat completion using OpenAI's API
 * @param request - The chat completion request parameters
 * @returns Promise<ChatCompletionResponse> - The AI response with usage stats
 */
export async function generateChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    // Add system message if provided
    if (request.systemPrompt) {
      messages.push({
        role: "system",
        content: request.systemPrompt,
      });
    }

    // Add user message
    messages.push({
      role: "user",
      content: request.userPrompt,
    });

    const completion = await openai.chat.completions.create({
      model: request.model || DEFAULT_MODEL,
      messages,
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
    });

    const choice = completion.choices[0];
    if (!choice?.message?.content) {
      throw new Error("No content received from OpenAI");
    }

    return {
      content: choice.message.content,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
      model: completion.model,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(
      `Failed to generate AI response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate structured responses for construction-specific tasks
 */
export class ConstructionAI {
  /**
   * Generate project scope suggestions based on project description
   */
  static async generateProjectScope(projectDescription: string): Promise<ChatCompletionResponse> {
    const systemPrompt = `You are an expert construction project manager. Given a project description, provide a detailed scope of work including:
1. Major work phases
2. Materials needed
3. Estimated timeline
4. Key considerations
5. Potential challenges

Format your response as clear, actionable bullet points.`;

    return generateChatCompletion({
      systemPrompt,
      userPrompt: `Project: ${projectDescription}`,
      temperature: 0.3, // Lower temperature for more consistent, professional responses
    });
  }

  /**
   * Generate change order analysis and recommendations
   */
  static async analyzeChangeOrder(
    originalScope: string,
    requestedChange: string
  ): Promise<ChatCompletionResponse> {
    const systemPrompt = `You are a construction project analyst. Analyze change orders and provide:
1. Impact on timeline
2. Impact on budget (percentage estimate)
3. Required additional materials/labor
4. Dependencies on other work
5. Recommendations (approve/modify/reject with reasoning)

Be specific and practical in your analysis.`;

    return generateChatCompletion({
      systemPrompt,
      userPrompt: `Original Scope: ${originalScope}\n\nRequested Change: ${requestedChange}`,
      temperature: 0.2,
    });
  }

  /**
   * Generate cost estimation breakdown
   */
  static async generateCostEstimate(
    projectDescription: string,
    location?: string
  ): Promise<ChatCompletionResponse> {
    const systemPrompt = `You are a construction cost estimator. Provide detailed cost breakdowns including:
1. Materials costs (itemized)
2. Labor costs (by trade)
3. Permit and inspection fees
4. Contingency recommendations
5. Total project cost range

${location ? `Consider regional pricing for ${location}.` : "Use national average pricing."}
Provide realistic market rates and explain your assumptions.`;

    return generateChatCompletion({
      systemPrompt,
      userPrompt: `Estimate costs for: ${projectDescription}`,
      temperature: 0.1, // Very low temperature for consistent cost estimates
    });
  }
}

export default openai;
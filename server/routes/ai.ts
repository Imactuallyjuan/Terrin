import { Router } from "express";
import { generateChatCompletion, ConstructionAI, type ChatCompletionRequest } from "../ai/aiClient";

const router = Router();

/**
 * General AI chat completion endpoint
 * POST /api/ai
 * Body: { systemPrompt?: string, userPrompt: string, model?: string, maxTokens?: number, temperature?: number }
 */
router.post("/", async (req, res) => {
  try {
    const { systemPrompt, userPrompt, model, maxTokens, temperature }: ChatCompletionRequest = req.body;

    // Validate required fields
    if (!userPrompt || typeof userPrompt !== "string") {
      return res.status(400).json({
        error: "userPrompt is required and must be a string",
      });
    }

    // Validate optional fields
    if (systemPrompt && typeof systemPrompt !== "string") {
      return res.status(400).json({
        error: "systemPrompt must be a string if provided",
      });
    }

    const response = await generateChatCompletion({
      systemPrompt,
      userPrompt,
      model,
      maxTokens,
      temperature,
    });

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("AI route error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * Construction-specific AI endpoints
 */

/**
 * Generate project scope
 * POST /api/ai/project-scope
 * Body: { projectDescription: string }
 */
router.post("/project-scope", async (req, res) => {
  try {
    const { projectDescription } = req.body;

    if (!projectDescription || typeof projectDescription !== "string") {
      return res.status(400).json({
        error: "projectDescription is required and must be a string",
      });
    }

    const response = await ConstructionAI.generateProjectScope(projectDescription);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Project scope generation error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate project scope",
    });
  }
});

/**
 * Analyze change order
 * POST /api/ai/change-order
 * Body: { originalScope: string, requestedChange: string }
 */
router.post("/change-order", async (req, res) => {
  try {
    const { originalScope, requestedChange } = req.body;

    if (!originalScope || typeof originalScope !== "string") {
      return res.status(400).json({
        error: "originalScope is required and must be a string",
      });
    }

    if (!requestedChange || typeof requestedChange !== "string") {
      return res.status(400).json({
        error: "requestedChange is required and must be a string",
      });
    }

    const response = await ConstructionAI.analyzeChangeOrder(originalScope, requestedChange);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Change order analysis error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to analyze change order",
    });
  }
});

/**
 * Generate cost estimate
 * POST /api/ai/cost-estimate
 * Body: { projectDescription: string, location?: string }
 */
router.post("/cost-estimate", async (req, res) => {
  try {
    const { projectDescription, location } = req.body;

    if (!projectDescription || typeof projectDescription !== "string") {
      return res.status(400).json({
        error: "projectDescription is required and must be a string",
      });
    }

    const response = await ConstructionAI.generateCostEstimate(projectDescription, location);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Cost estimate generation error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate cost estimate",
    });
  }
});

export default router;
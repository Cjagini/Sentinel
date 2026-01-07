import { NextRequest } from "next/server";
import { AlertService } from "@/services/alert.service";
import { AIService } from "@/services/ai.service";
import { successResponse, errorResponse, toHttpResponse } from "@/lib/api-response";

/**
 * POST /api/alert-rules
 * Create a new alert rule for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { userId, category, threshold } = body;

    if (!userId || !category || threshold === undefined) {
      const response = errorResponse(
        "Missing required fields: userId, category, threshold",
        400
      );
      return toHttpResponse(response);
    }

    // Validate category
    if (!AIService.isValidCategory(category)) {
      const response = errorResponse(
        `Invalid category. Allowed categories: ${AIService.getAllowedCategories().join(", ")}`,
        400
      );
      return toHttpResponse(response);
    }

    // Validate threshold
    if (typeof threshold !== "number" || threshold <= 0) {
      const response = errorResponse("Threshold must be a positive number", 400);
      return toHttpResponse(response);
    }

    // Create alert rule
    const alertRule = await AlertService.createAlertRule({
      userId,
      category,
      threshold,
    });

    const response = successResponse(alertRule, 201, "Alert rule created successfully");
    return toHttpResponse(response);
  } catch (error) {
    console.error("[POST /api/alert-rules] Error:", error);
    const response = errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
    return toHttpResponse(response);
  }
}

/**
 * GET /api/alert-rules
 * Get all alert rules for a user (query param: userId)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      const response = errorResponse("Missing required query parameter: userId", 400);
      return toHttpResponse(response);
    }

    const alertRules = await AlertService.getUserAlertRules(userId);

    const response = successResponse(
      alertRules,
      200,
      `Retrieved ${alertRules.length} alert rule(s)`
    );
    return toHttpResponse(response);
  } catch (error) {
    console.error("[GET /api/alert-rules] Error:", error);
    const response = errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
    return toHttpResponse(response);
  }
}

import { NextRequest } from "next/server";
import { TransactionService } from "@/services/transaction.service";
import { successResponse, errorResponse, toHttpResponse } from "@/lib/api-response";

/**
 * GET /api/spending
 * Get spending summary by category for a user (query param: userId)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      const response = errorResponse("Missing required query parameter: userId", 400);
      return toHttpResponse(response);
    }

    const summary = await TransactionService.getSpendingSummary(userId);

    const response = successResponse(
      summary,
      200,
      "Spending summary retrieved successfully"
    );
    return toHttpResponse(response);
  } catch (error) {
    console.error("[GET /api/spending] Error:", error);
    const response = errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
    return toHttpResponse(response);
  }
}

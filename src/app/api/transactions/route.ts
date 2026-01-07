import { NextRequest } from "next/server";
import { TransactionService } from "@/services/transaction.service";
import { successResponse, errorResponse, toHttpResponse } from "@/lib/api-response";

/**
 * POST /api/transactions
 * Create a new transaction with AI classification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { userId, description, amount } = body;

    if (!userId || !description || amount === undefined) {
      const response = errorResponse(
        "Missing required fields: userId, description, amount",
        400
      );
      return toHttpResponse(response);
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      const response = errorResponse("Amount must be a positive number", 400);
      return toHttpResponse(response);
    }

    // Create transaction with AI classification
    const transaction = await TransactionService.createTransaction({
      userId,
      description,
      amount,
    });

    const response = successResponse(transaction, 201, "Transaction created successfully");
    return toHttpResponse(response);
  } catch (error) {
    console.error("[POST /api/transactions] Error:", error);
    const response = errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
    return toHttpResponse(response);
  }
}

/**
 * GET /api/transactions
 * Get all transactions for a user (query param: userId)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const category = request.nextUrl.searchParams.get("category");

    if (!userId) {
      const response = errorResponse("Missing required query parameter: userId", 400);
      return toHttpResponse(response);
    }

    let transactions;

    if (category) {
      transactions = await TransactionService.getTransactionsByCategory(
        userId,
        category
      );
    } else {
      transactions = await TransactionService.getUserTransactions(userId);
    }

    const response = successResponse(
      transactions,
      200,
      `Retrieved ${transactions.length} transaction(s)`
    );
    return toHttpResponse(response);
  } catch (error) {
    console.error("[GET /api/transactions] Error:", error);
    const response = errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
    return toHttpResponse(response);
  }
}

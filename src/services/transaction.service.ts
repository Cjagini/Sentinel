import { TransactionRepository } from "@/repositories/transaction.repository";
import { AIService } from "@/services/ai.service";
import { TransactionInput, TransactionOutput } from "@/types";
import { alertQueue } from "@/services/queue.service";

/**
 * Transaction Service - Business logic for transaction operations
 * Coordinates between repositories, AI, and queue systems
 */
export class TransactionService {
  /**
   * Create a new transaction with AI classification
   * @param data - Transaction input
   * @returns Created transaction with classification
   */
  static async createTransaction(
    data: TransactionInput
  ): Promise<TransactionOutput> {
    try {
      // Step 1: Classify the transaction using AI
      const classification = await AIService.classifyTransaction(data.description);

      // Step 2: Save to database (user auto-created in repository if needed)
      const transaction = await TransactionRepository.create({
        ...data,
        category: classification.category,
        confidence: classification.confidence,
      });

      // Step 3: Enqueue a job to check alert rules
      await alertQueue.add(
        "new-transaction",
        {
          userId: data.userId,
          transactionId: transaction.id,
          category: transaction.category,
          amount: transaction.amount,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        }
      );

      return transaction;
    } catch (error) {
      console.error("[TransactionService.createTransaction] Error:", error);
      throw error;
    }
  }

  /**
   * Get all transactions for a user
   * @param userId - User ID
   * @returns Array of transactions
   */
  static async getUserTransactions(userId: string): Promise<TransactionOutput[]> {
    try {
      return await TransactionRepository.findByUserId(userId);
    } catch (error) {
      console.error("[TransactionService.getUserTransactions] Error:", error);
      throw error;
    }
  }

  /**
   * Get transactions by category
   * @param userId - User ID
   * @param category - Category name
   * @returns Array of transactions
   */
  static async getTransactionsByCategory(
    userId: string,
    category: string
  ): Promise<TransactionOutput[]> {
    try {
      // Validate category
      if (!AIService.isValidCategory(category)) {
        throw new Error(`Invalid category: ${category}`);
      }

      return await TransactionRepository.findByCategory(userId, category);
    } catch (error) {
      console.error("[TransactionService.getTransactionsByCategory] Error:", error);
      throw error;
    }
  }

  /**
   * Get spending summary by category
   * @param userId - User ID
   * @returns Object with category totals
   */
  static async getSpendingSummary(userId: string): Promise<Record<string, number>> {
    try {
      const summary: Record<string, number> = {};

      for (const category of AIService.getAllowedCategories()) {
        summary[category] = await TransactionRepository.getTotalByCategory(
          userId,
          category
        );
      }

      return summary;
    } catch (error) {
      console.error("[TransactionService.getSpendingSummary] Error:", error);
      throw error;
    }
  }

  /**
   * Delete a transaction
   * @param transactionId - Transaction ID
   * @param userId - User ID (for verification)
   * @returns Deleted transaction
   */
  static async deleteTransaction(
    transactionId: string,
    userId: string
  ): Promise<TransactionOutput> {
    try {
      // Verify the transaction belongs to the user
      const transaction = await TransactionRepository.findById(transactionId);
      if (!transaction || transaction.userId !== userId) {
        throw new Error("Transaction not found or unauthorized");
      }

      return await TransactionRepository.delete(transactionId);
    } catch (error) {
      console.error("[TransactionService.deleteTransaction] Error:", error);
      throw error;
    }
  }
}

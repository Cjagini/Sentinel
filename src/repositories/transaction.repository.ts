import { prisma } from "@/lib/prisma";
import { TransactionInput, TransactionOutput } from "@/types";

/**
 * Transaction Repository - Handles all database operations for transactions
 * Follows the Repository pattern for clean data access layer
 */
export class TransactionRepository {
  /**
   * Create a new transaction
   * @param data - Transaction input data
   * @returns Created transaction
   */
  static async create(data: TransactionInput & { category: string; confidence: number }): Promise<TransactionOutput> {
    try {
      // Ensure user exists before creating transaction
      try {
        await prisma.user.findUniqueOrThrow({
          where: { id: data.userId },
        });
      } catch {
        // User doesn't exist, create it with a default email
        await prisma.user.create({
          data: { 
            id: data.userId,
            email: `${data.userId}@sentinel.local`
          },
        });
      }

      return await prisma.transaction.create({
        data: {
          userId: data.userId,
          description: data.description,
          amount: data.amount,
          category: data.category,
          confidence: data.confidence,
        },
      });
    } catch (error) {
      console.error("[TransactionRepository.create] Error:", error);
      throw error;
    }
  }

  /**
   * Get all transactions for a user
   * @param userId - User ID
   * @returns Array of transactions
   */
  static async findByUserId(userId: string): Promise<TransactionOutput[]> {
    try {
      return await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("[TransactionRepository.findByUserId] Error:", error);
      throw error;
    }
  }

  /**
   * Get transactions by category for a user
   * @param userId - User ID
   * @param category - Category name
   * @returns Array of transactions
   */
  static async findByCategory(userId: string, category: string): Promise<TransactionOutput[]> {
    try {
      return await prisma.transaction.findMany({
        where: { userId, category },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("[TransactionRepository.findByCategory] Error:", error);
      throw error;
    }
  }

  /**
   * Get total spent in a category for a user
   * @param userId - User ID
   * @param category - Category name
   * @returns Total amount spent
   */
  static async getTotalByCategory(userId: string, category: string): Promise<number> {
    try {
      const result = await prisma.transaction.aggregate({
        where: { userId, category },
        _sum: {
          amount: true,
        },
      });
      return result._sum.amount || 0;
    } catch (error) {
      console.error("[TransactionRepository.getTotalByCategory] Error:", error);
      throw error;
    }
  }

  /**
   * Get a transaction by ID
   * @param id - Transaction ID
   * @returns Transaction or null
   */
  static async findById(id: string): Promise<TransactionOutput | null> {
    try {
      return await prisma.transaction.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error("[TransactionRepository.findById] Error:", error);
      throw error;
    }
  }

  /**
   * Delete a transaction
   * @param id - Transaction ID
   * @returns Deleted transaction
   */
  static async delete(id: string): Promise<TransactionOutput> {
    try {
      return await prisma.transaction.delete({
        where: { id },
      });
    } catch (error) {
      console.error("[TransactionRepository.delete] Error:", error);
      throw error;
    }
  }
}

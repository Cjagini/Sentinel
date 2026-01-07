import { prisma } from "@/lib/prisma";
import { AlertRuleInput, AlertRuleOutput } from "@/types";

/**
 * AlertRule Repository - Handles all database operations for alert rules
 * Follows the Repository pattern for clean data access layer
 */
export class AlertRuleRepository {
  /**
   * Create a new alert rule
   * @param data - Alert rule input data
   * @returns Created alert rule
   */
  static async create(data: AlertRuleInput): Promise<AlertRuleOutput> {
    try {
      return await prisma.alertRule.create({
        data: {
          userId: data.userId,
          category: data.category,
          threshold: data.threshold,
        },
      });
    } catch (error) {
      console.error("[AlertRuleRepository.create] Error:", error);
      throw error;
    }
  }

  /**
   * Get all alert rules for a user
   * @param userId - User ID
   * @returns Array of alert rules
   */
  static async findByUserId(userId: string): Promise<AlertRuleOutput[]> {
    try {
      return await prisma.alertRule.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("[AlertRuleRepository.findByUserId] Error:", error);
      throw error;
    }
  }

  /**
   * Get alert rule by user and category
   * @param userId - User ID
   * @param category - Category name
   * @returns Alert rule or null
   */
  static async findByUserAndCategory(
    userId: string,
    category: string
  ): Promise<AlertRuleOutput | null> {
    try {
      return await prisma.alertRule.findUnique({
        where: {
          userId_category: {
            userId,
            category,
          },
        },
      });
    } catch (error) {
      console.error("[AlertRuleRepository.findByUserAndCategory] Error:", error);
      throw error;
    }
  }

  /**
   * Update an alert rule
   * @param id - Alert rule ID
   * @param data - Partial alert rule data
   * @returns Updated alert rule
   */
  static async update(
    id: string,
    data: Partial<AlertRuleInput>
  ): Promise<AlertRuleOutput> {
    try {
      return await prisma.alertRule.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error("[AlertRuleRepository.update] Error:", error);
      throw error;
    }
  }

  /**
   * Delete an alert rule
   * @param id - Alert rule ID
   * @returns Deleted alert rule
   */
  static async delete(id: string): Promise<AlertRuleOutput> {
    try {
      return await prisma.alertRule.delete({
        where: { id },
      });
    } catch (error) {
      console.error("[AlertRuleRepository.delete] Error:", error);
      throw error;
    }
  }

  /**
   * Get all active alert rules for a user
   * @param userId - User ID
   * @returns Array of active alert rules
   */
  static async findActiveByUserId(userId: string): Promise<AlertRuleOutput[]> {
    try {
      return await prisma.alertRule.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("[AlertRuleRepository.findActiveByUserId] Error:", error);
      throw error;
    }
  }
}

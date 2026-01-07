import { AlertRuleRepository } from "@/repositories/alert-rule.repository";
import { TransactionRepository } from "@/repositories/transaction.repository";
import { AlertRuleInput, AlertRuleOutput, AlertEvent } from "@/types";

/**
 * Alert Service - Business logic for alert rule operations and alert triggering
 */
export class AlertService {
  /**
   * Create a new alert rule
   * @param data - Alert rule input
   * @returns Created alert rule
   */
  static async createAlertRule(data: AlertRuleInput): Promise<AlertRuleOutput> {
    try {
      return await AlertRuleRepository.create(data);
    } catch (error) {
      console.error("[AlertService.createAlertRule] Error:", error);
      throw error;
    }
  }

  /**
   * Get all alert rules for a user
   * @param userId - User ID
   * @returns Array of alert rules
   */
  static async getUserAlertRules(userId: string): Promise<AlertRuleOutput[]> {
    try {
      return await AlertRuleRepository.findByUserId(userId);
    } catch (error) {
      console.error("[AlertService.getUserAlertRules] Error:", error);
      throw error;
    }
  }

  /**
   * Check if an alert should be triggered for a transaction
   * This is called by the background worker
   * @param userId - User ID
   * @param category - Transaction category
   * @returns Alert event if threshold exceeded, null otherwise
   */
  static async checkAndTriggerAlert(
    userId: string,
    category: string
  ): Promise<AlertEvent | null> {
    try {
      // Step 1: Get the alert rule for this user and category
      const alertRule = await AlertRuleRepository.findByUserAndCategory(userId, category);

      if (!alertRule || !alertRule.isActive) {
        console.log(`[AlertService.checkAndTriggerAlert] No active alert rule for ${category}`);
        return null;
      }

      // Step 2: Calculate total spent in this category
      const totalSpent = await TransactionRepository.getTotalByCategory(userId, category);

      // Step 3: Check if threshold is exceeded
      if (totalSpent > alertRule.threshold) {
        const alertEvent: AlertEvent = {
          userId,
          category,
          threshold: alertRule.threshold,
          totalSpent,
          message: `Alert: You've exceeded your ${category} budget! Spent: $${totalSpent.toFixed(2)}, Limit: $${alertRule.threshold.toFixed(2)}`,
          triggeredAt: new Date(),
        };

        // Log the alert (future: integrate with Telegram/Email)
        console.log("[AlertService.checkAndTriggerAlert] Triggering alert:", alertEvent);

        return alertEvent;
      }

      return null;
    } catch (error) {
      console.error("[AlertService.checkAndTriggerAlert] Error:", error);
      throw error;
    }
  }

  /**
   * Update an alert rule
   * @param id - Alert rule ID
   * @param data - Partial alert rule data
   * @returns Updated alert rule
   */
  static async updateAlertRule(
    id: string,
    data: Partial<AlertRuleInput>
  ): Promise<AlertRuleOutput> {
    try {
      return await AlertRuleRepository.update(id, data);
    } catch (error) {
      console.error("[AlertService.updateAlertRule] Error:", error);
      throw error;
    }
  }

  /**
   * Delete an alert rule
   * @param id - Alert rule ID
   * @returns Deleted alert rule
   */
  static async deleteAlertRule(id: string): Promise<AlertRuleOutput> {
    try {
      return await AlertRuleRepository.delete(id);
    } catch (error) {
      console.error("[AlertService.deleteAlertRule] Error:", error);
      throw error;
    }
  }

  /**
   * Toggle alert rule active status
   * @param id - Alert rule ID
   * @param isActive - New active status
   * @returns Updated alert rule
   */
  static async toggleAlertRule(id: string, isActive: boolean): Promise<AlertRuleOutput> {
    try {
      const updateData: { isActive: boolean } = { isActive };
      return await AlertRuleRepository.update(id, updateData as Partial<AlertRuleInput>);
    } catch (error) {
      console.error("[AlertService.toggleAlertRule] Error:", error);
      throw error;
    }
  }
}

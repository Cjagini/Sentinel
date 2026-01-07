import { Worker, Job } from "bullmq";
import { AlertService } from "@/services/alert.service";
import { AlertQueueJob } from "@/services/queue.service";

const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
};

/**
 * BullMQ Worker - Processes background jobs for alert checking
 * Listens for "new-transaction" jobs and checks alert rules
 */
export const alertWorker = new Worker(
  "alert-queue",
  async (job: Job<AlertQueueJob>) => {
    try {
      console.log(`[Alert Worker] Processing job ${job.id}:`, job.data);

      const { userId, transactionId, category } = job.data;

      // Check if alert should be triggered
      const alertEvent = await AlertService.checkAndTriggerAlert(userId, category);

      if (alertEvent) {
        console.log(`[Alert Worker] Alert triggered for user ${userId}:`, alertEvent);
        // TODO: Integrate with Telegram/Email notification service
        // For now, just log the event
        return {
          success: true,
          alertTriggered: true,
          message: alertEvent.message,
        };
      }

      console.log(
        `[Alert Worker] No alert triggered for transaction ${transactionId}`
      );
      return {
        success: true,
        alertTriggered: false,
      };
    } catch (error) {
      console.error(`[Alert Worker] Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 jobs concurrently
  }
);

// Worker event listeners
alertWorker.on("completed", (job) => {
  console.log(`[Alert Worker] Job ${job.id} completed successfully`);
});

alertWorker.on("failed", (job, error) => {
  console.error(`[Alert Worker] Job ${job?.id} failed:`, error.message);
});

alertWorker.on("error", (error) => {
  console.error("[Alert Worker] Worker error:", error);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Alert Worker] Received SIGTERM, shutting down gracefully...");
  await alertWorker.close();
  process.exit(0);
});

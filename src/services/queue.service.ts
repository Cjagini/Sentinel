import { Queue } from "bullmq";

// Initialize Redis connection
const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
};

/**
 * Type definition for alert queue jobs
 */
export interface AlertQueueJob {
  userId: string;
  transactionId: string;
  category: string;
  amount: number;
}

/**
 * BullMQ Alert Queue - Handles background job processing for alert rules      
 * Jobs are queued when new transactions are created
 */
export const alertQueue = new Queue<AlertQueueJob>("alert-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Queue event listeners
alertQueue.on("error", (error) => {
  console.error("[Alert Queue] Queue error:", error);
});

export default alertQueue;

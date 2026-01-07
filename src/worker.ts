/**
 * Worker Entry Point - Start this in a separate process
 * Usage: npm run worker
 *
 * This script initializes the BullMQ worker that listens for
 * "new-transaction" jobs and triggers alerts when thresholds are exceeded.
 */

import { alertWorker } from "@/workers/alert.worker";

console.log("[Alert Worker] Starting worker...");
console.log(`[Alert Worker] Worker name: ${alertWorker.name}`);
console.log(`[Alert Worker] Concurrency: ${alertWorker.opts.concurrency}`);

// Keep the worker process alive
process.on("exit", (code) => {
  console.log(`[Alert Worker] Exiting with code ${code}`);
});

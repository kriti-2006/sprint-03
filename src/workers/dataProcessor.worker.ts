/**
 * Data Processor Web Worker (Phase 3).
 *
 * Runs OFF the main thread. Receives the full processing dataset plus the
 * user's search/category/sort criteria, runs the processing pipeline from
 * ./processing (filter → sort → statistics) and posts the result back.
 *
 * The main thread does NONE of this — it only sends raw data and renders the
 * result. Communication uses the explicit protocol in ./workerProtocol.
 *
 * Message flow:
 *   onmessage  ← { type: "PROCESS_PRODUCTS", requestId, payload }
 *   postMessage → { type: "PROCESS_COMPLETE", requestId, payload }
 *   postMessage → { type: "PROCESS_ERROR",    requestId, payload }  (on failure)
 */

/// <reference lib="webworker" />

import { processProducts } from "./processing";
import type {
  ProcessComplete,
  ProcessError,
  WorkerRequest,
} from "./workerProtocol";

// Typed worker global so postMessage is correctly checked.
const ctx = self as unknown as DedicatedWorkerGlobalScope;

function postError(requestId: number, message: string): void {
  const response: ProcessError = {
    type: "PROCESS_ERROR",
    requestId,
    payload: { message },
  };
  ctx.postMessage(response);
}

ctx.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;

  // Guard against unknown message shapes.
  if (!message || message.type !== "PROCESS_PRODUCTS") {
    postError(
      (message as { requestId?: number })?.requestId ?? -1,
      "Unknown message type received by worker.",
    );
    return;
  }

  const { requestId } = message;

  try {
    const start = performance.now();
    const { products, searchTerm, category, sortBy } = message.payload;

    const output = processProducts(products, { searchTerm, category, sortBy });

    const response: ProcessComplete = {
      type: "PROCESS_COMPLETE",
      requestId,
      payload: {
        ...output,
        durationMs: performance.now() - start,
      },
    };

    ctx.postMessage(response);
  } catch (error) {
    postError(
      requestId,
      error instanceof Error
        ? error.message
        : "Unexpected error while processing data.",
    );
  }
});

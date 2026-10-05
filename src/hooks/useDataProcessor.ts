/**
 * useDataProcessor — Web Worker lifecycle hook (Phase 3).
 *
 * Responsibilities:
 *   - create ONE worker for the component's lifetime (no repeated creation)
 *   - send processing requests via postMessage
 *   - receive results via onmessage, ignoring stale ones via requestId
 *   - surface a "processing" flag so the UI can show the live indicator
 *   - handle worker-level errors (onerror) and PROCESS_ERROR messages
 *   - terminate the worker + remove listeners on unmount
 *
 * The heavy filtering/sorting/stats all happen inside the worker; this hook is
 * only the bridge. The Vite-recommended `new Worker(new URL(...), { type })`
 * form is used so the worker is bundled and hashed correctly for production.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product, ProcessOptions, ProductStatistics } from "../types/product";
import type {
  ProcessRequest,
  WorkerResponse,
} from "../workers/workerProtocol";

export interface ProcessedResult {
  products: Product[];
  total: number;
  filtered: number;
  statistics: ProductStatistics;
  durationMs: number;
}

export type ProcessorStatus = "idle" | "processing" | "done" | "error";

interface UseDataProcessorResult {
  status: ProcessorStatus;
  result: ProcessedResult | null;
  errorMessage: string | null;
  /** Send a dataset + criteria to the worker for processing. */
  process: (products: Product[], options: ProcessOptions) => void;
}

export function useDataProcessor(): UseDataProcessorResult {
  const [status, setStatus] = useState<ProcessorStatus>("idle");
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  // Monotonic request id; only the latest response is applied.
  const requestIdRef = useRef(0);
  const latestAppliedRef = useRef(0);

  // Create the worker exactly once.
  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/dataProcessor.worker.ts", import.meta.url),
      { type: "module" },
    );
    workerRef.current = worker;

    const handleMessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;

      // Drop stale responses (a newer request has since been sent).
      if (message.requestId < latestAppliedRef.current) return;
      latestAppliedRef.current = message.requestId;

      if (message.type === "PROCESS_COMPLETE") {
        setResult(message.payload);
        setErrorMessage(null);
        setStatus("done");
      } else if (message.type === "PROCESS_ERROR") {
        setErrorMessage(message.payload.message);
        setStatus("error");
      }
    };

    // Worker-level failure (e.g. an uncaught throw or load error).
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      setErrorMessage(
        event.message || "The background worker encountered an error.",
      );
      setStatus("error");
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError);

    // Cleanup: remove listeners and terminate on unmount.
    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const process = useCallback(
    (products: Product[], options: ProcessOptions) => {
      const worker = workerRef.current;
      if (!worker) return;

      const requestId = ++requestIdRef.current;
      setStatus("processing");

      const request: ProcessRequest = {
        type: "PROCESS_PRODUCTS",
        requestId,
        payload: {
          products,
          searchTerm: options.searchTerm,
          category: options.category,
          sortBy: options.sortBy,
        },
      };

      worker.postMessage(request);
    },
    [],
  );

  return { status, result, errorMessage, process };
}

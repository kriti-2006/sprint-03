/**
 * Web Worker message contract (requirement #17).
 *
 * A single, explicit protocol shared by the main thread and the worker so both
 * sides agree on message shapes at compile time.
 *
 *   Main → Worker:  ProcessRequest  { type: "PROCESS_PRODUCTS", payload }
 *   Worker → Main:  ProcessComplete { type: "PROCESS_COMPLETE", payload }
 *   Worker → Main:  ProcessError    { type: "PROCESS_ERROR",    payload }
 *
 * The main thread never filters/sorts the dataset itself; it only sends raw
 * records + criteria and renders whatever the worker returns.
 */

import type { Product, ProductStatistics, SortBy } from "../types/product";

/* ---- Main → Worker ---- */

export interface ProcessRequest {
  type: "PROCESS_PRODUCTS";
  /** Correlates a response with its request; guards against stale results. */
  requestId: number;
  payload: {
    products: Product[];
    searchTerm: string;
    category: string;
    sortBy: SortBy;
  };
}

/* ---- Worker → Main ---- */

export interface ProcessComplete {
  type: "PROCESS_COMPLETE";
  requestId: number;
  payload: {
    products: Product[];
    /** Size of the dataset the worker received (the processing dataset). */
    total: number;
    /** Number of records remaining after filtering. */
    filtered: number;
    statistics: ProductStatistics;
    /** Wall-clock processing time in ms, for the demo panel. */
    durationMs: number;
  };
}

export interface ProcessError {
  type: "PROCESS_ERROR";
  requestId: number;
  payload: {
    message: string;
  };
}

/** Union of every message the worker can post back to the main thread. */
export type WorkerResponse = ProcessComplete | ProcessError;

/** Union of every message the main thread can post to the worker. */
export type WorkerRequest = ProcessRequest;

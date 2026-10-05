/**
 * Data Processor Web Worker (Phase 3).
 *
 * Runs OFF the main thread. Receives the full processing dataset plus the
 * user's search/category/sort criteria, then performs the expensive work:
 *   1. filter by search term (title + category match)
 *   2. filter by category
 *   3. sort by the chosen strategy
 *   4. compute aggregate statistics
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

import type { Product, ProductStatistics, SortBy } from "../types/product";
import type {
  ProcessComplete,
  ProcessError,
  WorkerRequest,
} from "./workerProtocol";

// Typed worker global so postMessage is correctly checked.
const ctx = self as unknown as DedicatedWorkerGlobalScope;

function filterProducts(
  products: Product[],
  searchTerm: string,
  category: string,
): Product[] {
  const term = searchTerm.trim().toLowerCase();
  const byCategory = category && category !== "all";

  if (!term && !byCategory) return products;

  return products.filter((p) => {
    if (byCategory && p.category !== category) return false;
    if (term) {
      const haystack = `${p.title} ${p.category}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

function sortProducts(products: Product[], sortBy: SortBy): Product[] {
  // Copy before sorting so we never mutate the received array in place.
  const sorted = products.slice();
  switch (sortBy) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "title-asc":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "relevance":
    default:
      // Keep incoming order for "relevance".
      break;
  }
  return sorted;
}

function computeStatistics(products: Product[]): ProductStatistics {
  if (products.length === 0) {
    return {
      count: 0,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      averageRating: 0,
      categories: 0,
    };
  }

  let priceSum = 0;
  let ratingSum = 0;
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  const categorySet = new Set<string>();

  for (const p of products) {
    priceSum += p.price;
    ratingSum += p.rating;
    if (p.price < minPrice) minPrice = p.price;
    if (p.price > maxPrice) maxPrice = p.price;
    categorySet.add(p.category);
  }

  return {
    count: products.length,
    averagePrice: priceSum / products.length,
    minPrice,
    maxPrice,
    averageRating: ratingSum / products.length,
    categories: categorySet.size,
  };
}

ctx.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;

  // Guard against unknown message shapes.
  if (!message || message.type !== "PROCESS_PRODUCTS") {
    const err: ProcessError = {
      type: "PROCESS_ERROR",
      requestId: (message as { requestId?: number })?.requestId ?? -1,
      payload: { message: "Unknown message type received by worker." },
    };
    ctx.postMessage(err);
    return;
  }

  const { requestId } = message;

  try {
    const start = performance.now();
    const { products, searchTerm, category, sortBy } = message.payload;

    const filtered = filterProducts(products, searchTerm, category);
    const sorted = sortProducts(filtered, sortBy);
    const statistics = computeStatistics(sorted);

    const durationMs = performance.now() - start;

    const response: ProcessComplete = {
      type: "PROCESS_COMPLETE",
      requestId,
      payload: {
        products: sorted,
        total: products.length,
        filtered: sorted.length,
        statistics,
        durationMs,
      },
    };

    ctx.postMessage(response);
  } catch (error) {
    const response: ProcessError = {
      type: "PROCESS_ERROR",
      requestId,
      payload: {
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error while processing data.",
      },
    };
    ctx.postMessage(response);
  }
});

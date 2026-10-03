/**
 * API service layer (Phase 1 — Asynchronous Integration).
 *
 * All low-level fetch logic lives here so UI/hooks never touch fetch directly.
 * `fetchProducts` receives an AbortSignal, performs the request, checks the
 * HTTP status, parses and validates the JSON, and throws typed, meaningful
 * errors that the UI can map to distinct states.
 */

import type { Product } from "../types/product";

const API_URL = "https://dummyjson.com/products?limit=100";

/**
 * Discriminated error type so the hook can tell *why* a request failed and
 * render the correct state (network vs. HTTP vs. malformed), instead of a
 * single generic "something went wrong".
 */
export type ApiErrorKind = "network" | "http" | "malformed";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

/** Minimal shape validation — enough to trust the payload without over-coupling. */
function isRawProduct(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "number" &&
    typeof v.title === "string" &&
    typeof v.price === "number"
  );
}

/** Normalize a raw API record into our stable `Product` contract. */
function normalize(raw: Record<string, unknown>): Product {
  return {
    id: raw.id as number,
    title: raw.title as string,
    category: typeof raw.category === "string" ? raw.category : "uncategorized",
    price: raw.price as number,
    rating: typeof raw.rating === "number" ? raw.rating : 0,
    thumbnail: typeof raw.thumbnail === "string" ? raw.thumbnail : "",
  };
}

/**
 * Fetch products from the public API.
 *
 * @param signal AbortSignal used for both the 5s timeout and component-cancel.
 * @returns A validated, normalized array of products.
 * @throws {ApiError} on network failure, non-2xx status, or malformed payload.
 *         AbortErrors are re-thrown untouched so the caller can classify the
 *         reason for the abort (timeout vs. cancel).
 */
export async function fetchProducts(signal: AbortSignal): Promise<Product[]> {
  let response: Response;

  try {
    response = await fetch(API_URL, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    // Re-throw aborts unchanged — the hook decides timeout vs. cancel.
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    // TypeError from fetch == network-level failure (offline, DNS, CORS, etc.)
    throw new ApiError(
      "network",
      "Network request failed. Please check your connection.",
    );
  }

  // HTTP-level error: server responded, but not with a success status.
  if (!response.ok) {
    throw new ApiError(
      "http",
      `Request failed with status ${response.status} (${response.statusText}).`,
      response.status,
    );
  }

  // Parse JSON defensively.
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ApiError("malformed", "The server returned an invalid response.");
  }

  // Validate the envelope: dummyjson returns { products: [...] }.
  if (
    typeof json !== "object" ||
    json === null ||
    !Array.isArray((json as { products?: unknown }).products)
  ) {
    throw new ApiError(
      "malformed",
      "The server response did not contain a product list.",
    );
  }

  const rawProducts = (json as { products: unknown[] }).products;
  const products = rawProducts.filter(isRawProduct).map(normalize);

  // If the payload had items but none were valid, treat as malformed.
  if (rawProducts.length > 0 && products.length === 0) {
    throw new ApiError(
      "malformed",
      "The product data was in an unexpected format.",
    );
  }

  return products;
}

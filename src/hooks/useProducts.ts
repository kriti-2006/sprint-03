/**
 * useProducts — data-fetching hook (Phase 1).
 *
 * Owns the request lifecycle:
 *   - calls the API service (never fetch directly)
 *   - creates an AbortController per request so an unmount or refetch cancels
 *     the in-flight request instead of setting state on a stale component
 *   - maps typed API errors to a discriminated status the UI can render
 */

import { useCallback, useEffect, useState } from "react";
import { fetchProducts, ApiError } from "../services/api";
import type { Product } from "../types/product";

export type FetchStatus =
  | "idle"
  | "loading"
  | "success"
  | "error-network"
  | "error-http"
  | "error-malformed";

interface UseProductsResult {
  status: FetchStatus;
  products: Product[];
  /** Human-readable detail for error states. */
  errorMessage: string | null;
  /** HTTP status code when status is "error-http". */
  httpStatus: number | null;
  /** Imperatively (re)start a fetch — used by Retry buttons. */
  reload: () => void;
}

export function useProducts(): UseProductsResult {
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [products, setProducts] = useState<Product[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);

  // Bump to trigger a re-fetch without changing other deps.
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    setStatus("loading");
    setErrorMessage(null);
    setHttpStatus(null);

    (async () => {
      try {
        const data = await fetchProducts(controller.signal);
        setProducts(data);
        setStatus("success");
      } catch (error) {
        // Aborted by cleanup (unmount/refetch) — nothing to show.
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        // Typed API errors → specific states.
        if (error instanceof ApiError) {
          if (error.kind === "network") {
            setStatus("error-network");
          } else if (error.kind === "http") {
            setStatus("error-http");
            setHttpStatus(error.status ?? null);
          } else {
            setStatus("error-malformed");
          }
          setErrorMessage(error.message);
          return;
        }

        // Anything unexpected → treat as a network-class failure, but visible.
        setStatus("error-network");
        setErrorMessage(
          error instanceof Error ? error.message : "An unexpected error occurred.",
        );
      }
    })();

    // Cleanup: cancel the in-flight request on unmount or before a re-fetch.
    return () => {
      controller.abort();
    };
  }, [reloadToken]);

  return { status, products, errorMessage, httpStatus, reload };
}

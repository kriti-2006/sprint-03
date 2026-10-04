/**
 * useProducts — data-fetching hook (Phase 1 + Phase 2 timeout).
 *
 * Owns the request lifecycle:
 *   - calls the API service (never fetch directly)
 *   - enforces a hard 5000ms timeout via AbortController
 *   - distinguishes a TIMEOUT abort from a COMPONENT-CANCEL abort, so we never
 *     show "Request Timed Out" for an ordinary unmount/refetch (requirement #16)
 *   - cleans up the timer and controller in every exit path
 *
 * Exposes a discriminated status the UI maps to distinct states.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProducts, ApiError } from "../services/api";
import type { Product } from "../types/product";

export const REQUEST_TIMEOUT_MS = 5000;

export type FetchStatus =
  | "idle"
  | "loading"
  | "success"
  | "error-network"
  | "error-http"
  | "error-malformed"
  | "error-timeout";

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

  // Tracks the currently in-flight controller so cleanup can cancel it.
  const activeControllerRef = useRef<AbortController | null>(null);

  const reload = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    activeControllerRef.current = controller;

    // Distinguishes *why* the request was aborted. Only a timeout should show
    // the timeout UI; a component-cancel is silent.
    let timedOut = false;
    let cancelledByCleanup = false;

    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    setStatus("loading");
    setErrorMessage(null);
    setHttpStatus(null);

    (async () => {
      try {
        const data = await fetchProducts(controller.signal);
        setProducts(data);
        setStatus("success");
      } catch (error) {
        // Abort path: classify the reason.
        if (error instanceof DOMException && error.name === "AbortError") {
          if (timedOut) {
            setStatus("error-timeout");
            setErrorMessage(
              "The server took too long to respond. Please try again.",
            );
          }
          // If cancelled by cleanup, do nothing — component is gone/refetching.
          if (cancelledByCleanup) return;
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
      } finally {
        window.clearTimeout(timeoutId);
      }
    })();

    // Cleanup: cancel in-flight request on unmount or before a re-fetch.
    return () => {
      cancelledByCleanup = true;
      window.clearTimeout(timeoutId);
      if (!controller.signal.aborted) {
        controller.abort();
      }
      activeControllerRef.current = null;
    };
  }, [reloadToken]);

  return { status, products, errorMessage, httpStatus, reload };
}

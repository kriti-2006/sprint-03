/**
 * App — composition root and orchestration.
 *
 * Data flow:
 *   1. useProducts fetches the API (async/await, AbortController 5s timeout).
 *   2. Once the records arrive they are handed to the Web Worker via
 *      postMessage together with the processing criteria.
 *   3. The worker filters/sorts/aggregates OFF the main thread and posts back.
 *   4. React renders the processed result.
 *
 * The main thread never performs the heavy filtering/sorting itself.
 */

import { useEffect } from "react";
import { Header } from "./components/Header";
import { ProcessingIndicator } from "./components/ProcessingIndicator";
import { ProductGrid } from "./components/ProductGrid";
import { ErrorState } from "./components/ErrorState";
import { TimeoutState } from "./components/TimeoutState";
import { WorkerErrorState } from "./components/WorkerErrorState";
import { useProducts } from "./hooks/useProducts";
import { useDataProcessor } from "./hooks/useDataProcessor";
import type { ProcessOptions } from "./types/product";

/** Default criteria until the search/filter controls are added. */
const DEFAULT_OPTIONS: ProcessOptions = {
  searchTerm: "",
  category: "all",
  sortBy: "relevance",
};

export default function App() {
  const { status, products, errorMessage, httpStatus, reload } = useProducts();
  const {
    status: processorStatus,
    result,
    errorMessage: workerError,
    process,
  } = useDataProcessor();

  // Hand the fetched records to the worker as soon as they arrive.
  useEffect(() => {
    if (status !== "success" || products.length === 0) return;
    process(products, DEFAULT_OPTIONS);
  }, [status, products, process]);

  // ----- Decide what to render in the main content region -----
  const renderContent = () => {
    if (status === "loading") {
      return <ProductGrid products={[]} loading skeletonCount={8} />;
    }
    if (status === "error-timeout") {
      return <TimeoutState onRetry={reload} />;
    }
    if (
      status === "error-network" ||
      status === "error-http" ||
      status === "error-malformed"
    ) {
      return (
        <ErrorState
          status={status}
          detail={errorMessage}
          httpStatus={httpStatus}
          onRetry={reload}
        />
      );
    }

    // status === "success" from here on.
    if (processorStatus === "error") {
      return (
        <WorkerErrorState
          detail={workerError}
          onRetry={() => process(products, DEFAULT_OPTIONS)}
        />
      );
    }

    // First processing pass before any result → keep skeletons (stable layout).
    if (!result && processorStatus === "processing") {
      return <ProductGrid products={[]} loading skeletonCount={8} />;
    }

    return (
      <ProductGrid
        products={result ? result.products : []}
        loading={false}
      />
    );
  };

  return (
    <div className="app">
      <Header fetchStatus={status} />

      <main className="app__main">
        <ProcessingIndicator
          status={processorStatus}
          durationMs={result ? result.durationMs : null}
          processedCount={result ? result.filtered : null}
        />

        <section className="content" aria-label="Products">
          {renderContent()}
        </section>
      </main>

      <footer className="app__footer">
        <p>
          Sprint 03 — API Infrastructure Pipeline · Data from{" "}
          <a
            href="https://dummyjson.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            dummyjson.com
          </a>
        </p>
      </footer>
    </div>
  );
}

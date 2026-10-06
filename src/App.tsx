/**
 * App — composition root and orchestration.
 *
 * Data flow:
 *   1. useProducts fetches the API (async/await, AbortController 5s timeout).
 *   2. Whenever the products or the (debounced) filter/sort criteria change,
 *      the records + criteria are handed to the Web Worker via postMessage.
 *   3. The worker filters/sorts/aggregates OFF the main thread and posts back.
 *   4. React renders the processed result.
 *
 * The main thread never performs the heavy filtering/sorting itself.
 */

import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { SearchControls } from "./components/SearchControls";
import { ProcessingIndicator } from "./components/ProcessingIndicator";
import { ProductGrid } from "./components/ProductGrid";
import { ErrorState } from "./components/ErrorState";
import { TimeoutState } from "./components/TimeoutState";
import { EmptyState } from "./components/EmptyState";
import { WorkerErrorState } from "./components/WorkerErrorState";
import { useProducts } from "./hooks/useProducts";
import { useDataProcessor } from "./hooks/useDataProcessor";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import type { SortBy } from "./types/product";

const SEARCH_DEBOUNCE_MS = 250;

export default function App() {
  const { status, products, errorMessage, httpStatus, reload } = useProducts();
  const {
    status: processorStatus,
    result,
    errorMessage: workerError,
    process,
  } = useDataProcessor();

  // Filter/sort state (owned here; the worker does the actual work).
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>("relevance");

  const debouncedSearch = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);

  // Real categories come from the genuine API records only.
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set).sort();
  }, [products]);

  // Dispatch work to the worker whenever the data or criteria change.
  useEffect(() => {
    if (status !== "success" || products.length === 0) return;
    process(products, {
      searchTerm: debouncedSearch,
      category,
      sortBy,
    });
  }, [status, products, debouncedSearch, category, sortBy, process]);

  const handleReset = () => {
    setSearchTerm("");
    setCategory("all");
    setSortBy("relevance");
  };

  const controlsDisabled = status !== "success";

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
          onRetry={() =>
            process(products, {
              searchTerm: debouncedSearch,
              category,
              sortBy,
            })
          }
        />
      );
    }

    // First processing pass before any result → keep skeletons (stable layout).
    if (!result && processorStatus === "processing") {
      return <ProductGrid products={[]} loading skeletonCount={8} />;
    }

    if (result && result.filtered === 0) {
      return <EmptyState onReset={handleReset} />;
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
        <div className="toolbar">
          <SearchControls
            searchTerm={searchTerm}
            category={category}
            sortBy={sortBy}
            categories={categories}
            resultsCount={result ? result.filtered : 0}
            disabled={controlsDisabled}
            onSearchChange={setSearchTerm}
            onCategoryChange={setCategory}
            onSortChange={setSortBy}
            onReset={handleReset}
          />
        </div>

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

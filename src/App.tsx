/**
 * App — composition root and orchestration.
 *
 * Data flow (the whole point of the sprint):
 *   1. useProducts fetches the API (async/await, AbortController 5s timeout).
 *   2. The real records are expanded into a larger in-memory processing dataset.
 *   3. Whenever the dataset or the (debounced) filter/sort criteria change, the
 *      dataset + criteria are handed to the Web Worker via postMessage.
 *   4. The worker filters/sorts/aggregates OFF the main thread and posts back.
 *   5. React renders the processed result.
 *
 * The main thread never performs the heavy filtering/sorting itself.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Stats } from "./components/Stats";
import { SearchControls } from "./components/SearchControls";
import { DatasetControl } from "./components/DatasetControl";
import { ProcessingIndicator } from "./components/ProcessingIndicator";
import { ProductGrid } from "./components/ProductGrid";
import { ArchitecturePanel } from "./components/ArchitecturePanel";
import { ErrorState } from "./components/ErrorState";
import { TimeoutState } from "./components/TimeoutState";
import { EmptyState } from "./components/EmptyState";
import { WorkerErrorState } from "./components/WorkerErrorState";
import { useProducts } from "./hooks/useProducts";
import { useDataProcessor } from "./hooks/useDataProcessor";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { expandDataset } from "./utils/expandDataset";
import type { ProcessOptions, SortBy } from "./types/product";

const DATASET_OPTIONS = [1000, 5000, 10000, 25000];
const DEFAULT_DATASET_SIZE = 10000;
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
  const [datasetSize, setDatasetSize] = useState(DEFAULT_DATASET_SIZE);

  const debouncedSearch = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);

  // Real categories come from the genuine API records only.
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set).sort();
  }, [products]);

  // Expand the genuine records into the processing dataset (memoized).
  const processingDataset = useMemo(
    () => expandDataset(products, datasetSize),
    [products, datasetSize],
  );

  // The criteria handed to the worker (search uses the debounced value).
  const processOptions = useMemo<ProcessOptions>(
    () => ({ searchTerm: debouncedSearch, category, sortBy }),
    [debouncedSearch, category, sortBy],
  );

  // Single entry point for dispatching work — used by the effect and Retry.
  const runProcessing = useCallback(() => {
    if (status !== "success" || processingDataset.length === 0) return;
    process(processingDataset, processOptions);
  }, [status, processingDataset, processOptions, process]);

  // Dispatch work to the worker whenever the dataset or criteria change.
  useEffect(() => {
    runProcessing();
  }, [runProcessing]);

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
      return <WorkerErrorState detail={workerError} onRetry={runProcessing} />;
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
        <Stats
          apiRecords={products.length}
          processingRecords={
            status === "success" ? processingDataset.length : 0
          }
          filteredRecords={result ? result.filtered : 0}
          processorStatus={processorStatus}
          statistics={result ? result.statistics : null}
        />

        <ArchitecturePanel
          processorStatus={processorStatus}
          lastDurationMs={result ? result.durationMs : null}
        />

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
          <DatasetControl
            value={datasetSize}
            options={DATASET_OPTIONS}
            apiRecords={products.length}
            disabled={controlsDisabled}
            onChange={setDatasetSize}
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

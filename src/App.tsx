/**
 * App — composition root and orchestration.
 *
 * Data flow:
 *   1. useProducts fetches the API (async/await, AbortController 5s timeout).
 *   2. React renders the products, or a distinct state for each failure.
 */

import { Header } from "./components/Header";
import { ProductGrid } from "./components/ProductGrid";
import { ErrorState } from "./components/ErrorState";
import { StateMessage } from "./components/StateMessage";
import { TimeoutState } from "./components/TimeoutState";
import { useProducts } from "./hooks/useProducts";

export default function App() {
  const { status, products, errorMessage, httpStatus, reload } = useProducts();

  // ----- Decide what to render in the main content region -----
  const renderContent = () => {
    if (status === "loading" || status === "idle") {
      return (
        <StateMessage
          icon="⏳"
          title="Loading products…"
          description="Fetching the latest data from the API."
        />
      );
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

    return <ProductGrid products={products} />;
  };

  return (
    <div className="app">
      <Header fetchStatus={status} />

      <main className="app__main">
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

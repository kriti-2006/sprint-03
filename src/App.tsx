/**
 * App — composition root.
 *
 * Day 1: the application shell only (header, main region, footer). The data
 * layer, loading states and Web Worker pipeline are added on top of this.
 */

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header__brand">
          <div className="header__logo" aria-hidden="true">
            ⬡
          </div>
          <div>
            <h1 className="header__title">API Infrastructure Pipeline</h1>
            <p className="header__subtitle">Async · Latency · Web Worker</p>
          </div>
          <span className="badge badge--sprint">Sprint 03</span>
        </div>
      </header>

      <main className="app__main">
        <p>Project scaffold is running. The product dashboard is built next.</p>
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

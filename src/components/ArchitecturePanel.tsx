/**
 * ArchitecturePanel — a professional technical panel that visualizes the data
 * pipeline (API Layer → Main Thread → postMessage → Web Worker) and reflects
 * the live processing status. Supports the QA-video explanation (reqs #7, #10).
 */

import type { ProcessorStatus } from "../hooks/useDataProcessor";

interface ArchitecturePanelProps {
  processorStatus: ProcessorStatus;
  lastDurationMs: number | null;
}

export function ArchitecturePanel({
  processorStatus,
  lastDurationMs,
}: ArchitecturePanelProps) {
  const workerActive = processorStatus === "processing";

  return (
    <section className="architecture" aria-label="Technical architecture">
      <div className="architecture__header">
        <h2 className="architecture__title">Technical Architecture</h2>
        <p className="architecture__subtitle">
          Expensive filtering, sorting &amp; statistics run off the main thread.
        </p>
      </div>

      <ol className="pipeline">
        <li className="pipeline__node">
          <span className="pipeline__badge">API Layer</span>
          <span className="pipeline__desc">fetch · abort · validate</span>
        </li>
        <li className="pipeline__arrow" aria-hidden="true">
          →
        </li>
        <li className="pipeline__node">
          <span className="pipeline__badge">Main Thread</span>
          <span className="pipeline__desc">React render · UI state</span>
        </li>
        <li className="pipeline__arrow" aria-hidden="true">
          <code>postMessage</code>
        </li>
        <li
          className={`pipeline__node pipeline__node--worker ${
            workerActive ? "pipeline__node--active" : ""
          }`}
        >
          <span className="pipeline__badge">Web Worker</span>
          <span className="pipeline__desc">filter · sort · stats</span>
          {workerActive && (
            <span className="pipeline__pulse" aria-hidden="true" />
          )}
        </li>
        <li className="pipeline__arrow" aria-hidden="true">
          <code>onmessage</code>
        </li>
        <li className="pipeline__node">
          <span className="pipeline__badge">Render</span>
          <span className="pipeline__desc">processed dataset</span>
        </li>
      </ol>

      <dl className="architecture__facts">
        <div>
          <dt>Processing location</dt>
          <dd>Dedicated Web Worker (separate thread)</dd>
        </div>
        <div>
          <dt>Message protocol</dt>
          <dd>
            <code>PROCESS_PRODUCTS</code> / <code>PROCESS_COMPLETE</code> /{" "}
            <code>PROCESS_ERROR</code>
          </dd>
        </div>
        <div>
          <dt>Last run</dt>
          <dd>
            {lastDurationMs != null
              ? `${lastDurationMs.toFixed(1)} ms`
              : "—"}
          </dd>
        </div>
      </dl>
    </section>
  );
}

/**
 * ProcessingIndicator — the small live banner that makes the Web Worker
 * demonstrable in the QA video (requirement #7).
 *
 *   processing → "Processing data in background worker…"
 *   done       → "Processed by Web Worker" (+ timing on the last run)
 */

import type { ProcessorStatus } from "../hooks/useDataProcessor";

interface ProcessingIndicatorProps {
  status: ProcessorStatus;
  durationMs: number | null;
  processedCount: number | null;
}

export function ProcessingIndicator({
  status,
  durationMs,
  processedCount,
}: ProcessingIndicatorProps) {
  if (status === "idle") return null;

  if (status === "processing") {
    return (
      <div className="worker-banner worker-banner--busy" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <span>Processing data in background worker…</span>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="worker-banner worker-banner--done" role="status" aria-live="polite">
        <span className="worker-banner__check" aria-hidden="true">
          ✓
        </span>
        <span>
          Processed by Web Worker
          {processedCount != null && durationMs != null && (
            <span className="worker-banner__detail">
              {" "}
              · {processedCount.toLocaleString()} records in{" "}
              {durationMs.toFixed(1)} ms
            </span>
          )}
        </span>
      </div>
    );
  }

  return null;
}

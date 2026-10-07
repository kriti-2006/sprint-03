/**
 * Stats — the dashboard KPI row.
 *
 * Clearly separates "API Records" (genuine) from "Processing Dataset"
 * (expanded, synthetic) and shows filtered count + live processing status,
 * satisfying requirements #8 and #10.
 */

import { formatNumber, formatPrice } from "../utils/format";
import type { ProcessorStatus } from "../hooks/useDataProcessor";
import type { ProductStatistics } from "../types/product";

interface StatsProps {
  apiRecords: number;
  processingRecords: number;
  filteredRecords: number;
  processorStatus: ProcessorStatus;
  statistics: ProductStatistics | null;
}

function processingLabel(status: ProcessorStatus): string {
  switch (status) {
    case "processing":
      return "Processing…";
    case "done":
      return "Idle";
    case "error":
      return "Error";
    default:
      return "Waiting";
  }
}

export function Stats({
  apiRecords,
  processingRecords,
  filteredRecords,
  processorStatus,
  statistics,
}: StatsProps) {
  return (
    <section className="stats" aria-label="Dataset statistics">
      <article className="stat-card">
        <span className="stat-card__label">API Records</span>
        <span className="stat-card__value">{formatNumber(apiRecords)}</span>
        <span className="stat-card__hint">Fetched from the live API</span>
      </article>

      <article className="stat-card">
        <span className="stat-card__label">Processing Dataset</span>
        <span className="stat-card__value">
          {formatNumber(processingRecords)}
        </span>
        <span className="stat-card__hint">Expanded in memory for the worker</span>
      </article>

      <article className="stat-card">
        <span className="stat-card__label">Filtered Records</span>
        <span className="stat-card__value">{formatNumber(filteredRecords)}</span>
        <span className="stat-card__hint">
          {statistics && statistics.count > 0
            ? `Avg ${formatPrice(statistics.averagePrice)} · ${statistics.categories} categories`
            : "After search & filters"}
        </span>
      </article>

      <article
        className={`stat-card stat-card--status stat-card--${processorStatus}`}
      >
        <span className="stat-card__label">Worker Status</span>
        <span className="stat-card__value stat-card__value--status">
          {processorStatus === "processing" && (
            <span className="spinner" aria-hidden="true" />
          )}
          {processingLabel(processorStatus)}
        </span>
        <span className="stat-card__hint">Background thread</span>
      </article>
    </section>
  );
}

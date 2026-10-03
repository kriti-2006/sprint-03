/**
 * ErrorState — network / HTTP / malformed failures (Phase 1 fallback UI).
 * Distinct copy per failure kind, plus a Retry button.
 */

import { StateMessage } from "./StateMessage";
import type { FetchStatus } from "../hooks/useProducts";

interface ErrorStateProps {
  status: Extract<
    FetchStatus,
    "error-network" | "error-http" | "error-malformed"
  >;
  detail: string | null;
  httpStatus: number | null;
  onRetry: () => void;
}

function copyFor(
  status: ErrorStateProps["status"],
  httpStatus: number | null,
): { icon: string; title: string; description: string } {
  switch (status) {
    case "error-http":
      return {
        icon: "⚠",
        title: "Service Unavailable",
        description: `Unable to load products${
          httpStatus ? ` (HTTP ${httpStatus})` : ""
        }. Please try again.`,
      };
    case "error-malformed":
      return {
        icon: "⚠",
        title: "Unexpected Response",
        description:
          "The server returned data we couldn't read. Please try again.",
      };
    case "error-network":
    default:
      return {
        icon: "⚠",
        title: "Service Unavailable",
        description: "Unable to load products. Please try again.",
      };
  }
}

export function ErrorState({
  status,
  detail,
  httpStatus,
  onRetry,
}: ErrorStateProps) {
  const { icon, title, description } = copyFor(status, httpStatus);

  return (
    <StateMessage icon={icon} title={title} description={description} tone="error">
      {detail && <p className="state__detail">{detail}</p>}
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Try again
      </button>
    </StateMessage>
  );
}

/**
 * Header — application title, Sprint 03 badge, and live API status indicator.
 */

import type { FetchStatus } from "../hooks/useProducts";

interface HeaderProps {
  fetchStatus: FetchStatus;
}

function apiStatusLabel(status: FetchStatus): { label: string; tone: string } {
  switch (status) {
    case "loading":
      return { label: "Connecting", tone: "pending" };
    case "success":
      return { label: "Online", tone: "online" };
    case "error-timeout":
      return { label: "Timed out", tone: "offline" };
    case "idle":
      return { label: "Idle", tone: "pending" };
    default:
      return { label: "Unavailable", tone: "offline" };
  }
}

export function Header({ fetchStatus }: HeaderProps) {
  const { label, tone } = apiStatusLabel(fetchStatus);

  return (
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

      <div
        className={`api-status api-status--${tone}`}
        role="status"
        aria-live="polite"
      >
        <span className="api-status__dot" aria-hidden="true" />
        <span className="api-status__label">
          API: <strong>{label}</strong>
        </span>
      </div>
    </header>
  );
}

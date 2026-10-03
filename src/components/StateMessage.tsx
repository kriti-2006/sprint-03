/**
 * StateMessage — shared presentational shell for full-panel states
 * (error, timeout, empty, worker error). Keeps markup + a11y consistent.
 */

import type { ReactNode } from "react";

interface StateMessageProps {
  icon: string;
  title: string;
  description: string;
  tone?: "neutral" | "error" | "warning";
  children?: ReactNode;
}

export function StateMessage({
  icon,
  title,
  description,
  tone = "neutral",
  children,
}: StateMessageProps) {
  return (
    <div
      className={`state state--${tone}`}
      role={tone === "error" || tone === "warning" ? "alert" : "status"}
    >
      <div className="state__icon" aria-hidden="true">
        {icon}
      </div>
      <h2 className="state__title">{title}</h2>
      <p className="state__description">{description}</p>
      {children && <div className="state__actions">{children}</div>}
    </div>
  );
}

/**
 * EmptyState — shown when processing succeeds but no records match the filters.
 */

import { StateMessage } from "./StateMessage";

interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <StateMessage
      icon="🔍"
      title="No matching products"
      description="No products match your current search and filters. Try broadening your criteria."
      tone="neutral"
    >
      <button type="button" className="btn btn--ghost" onClick={onReset}>
        Reset filters
      </button>
    </StateMessage>
  );
}

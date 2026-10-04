/**
 * TimeoutState — dedicated UI shown ONLY when the 5s AbortController timeout
 * fires (Phase 2). Deliberately separate from ErrorState so a timeout is never
 * confused with a generic network error.
 */

import { StateMessage } from "./StateMessage";

interface TimeoutStateProps {
  onRetry: () => void;
}

export function TimeoutState({ onRetry }: TimeoutStateProps) {
  return (
    <StateMessage
      icon="⏱"
      title="Request Timed Out"
      description="The server took too long to respond. Please try again."
      tone="warning"
    >
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Retry
      </button>
    </StateMessage>
  );
}

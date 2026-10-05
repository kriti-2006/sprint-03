/**
 * WorkerErrorState — graceful fallback if the Web Worker crashes or posts an
 * invalid message (requirement #12). The app never shows a blank broken page.
 */

import { StateMessage } from "./StateMessage";

interface WorkerErrorStateProps {
  detail: string | null;
  onRetry: () => void;
}

export function WorkerErrorState({ detail, onRetry }: WorkerErrorStateProps) {
  return (
    <StateMessage
      icon="🧵"
      title="Processing Failed"
      description="The background worker could not process the dataset. Your data is safe — you can try again."
      tone="error"
    >
      {detail && <p className="state__detail">{detail}</p>}
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Reprocess
      </button>
    </StateMessage>
  );
}

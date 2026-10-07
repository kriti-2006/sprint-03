/**
 * DatasetControl — lets the presenter choose how large the in-memory processing
 * dataset should be, so the Web Worker's off-thread work is demonstrable at
 * different scales without ever misrepresenting the real API record count.
 */

interface DatasetControlProps {
  value: number;
  options: number[];
  apiRecords: number;
  disabled: boolean;
  onChange: (value: number) => void;
}

export function DatasetControl({
  value,
  options,
  apiRecords,
  disabled,
  onChange,
}: DatasetControlProps) {
  return (
    <div className="dataset-control">
      <label htmlFor="dataset-size" className="controls__label">
        Processing dataset size
      </label>
      <div className="dataset-control__row">
        <select
          id="dataset-size"
          className="controls__input"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt.toLocaleString()} records
            </option>
          ))}
        </select>
        <p className="dataset-control__hint">
          {apiRecords.toLocaleString()} real API records, expanded in memory for
          worker stress-testing.
        </p>
      </div>
    </div>
  );
}

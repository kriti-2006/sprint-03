/**
 * SearchControls — search input, category dropdown, sort dropdown, reset.
 *
 * A controlled, accessible form. All inputs have associated <label>s and the
 * whole group is a labelled region. The component is presentational: it reports
 * changes upward; the parent owns state and hands criteria to the worker.
 */

import type { SortBy } from "../types/product";

interface SearchControlsProps {
  searchTerm: string;
  category: string;
  sortBy: SortBy;
  categories: string[];
  resultsCount: number;
  disabled: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: SortBy) => void;
  onReset: () => void;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Rating: High to Low" },
  { value: "title-asc", label: "Title: A–Z" },
];

function prettyCategory(value: string): string {
  return value
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function SearchControls({
  searchTerm,
  category,
  sortBy,
  categories,
  resultsCount,
  disabled,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onReset,
}: SearchControlsProps) {
  const isDefault =
    searchTerm === "" && category === "all" && sortBy === "relevance";

  return (
    <section className="controls" aria-label="Search and filter controls">
      <div className="controls__field controls__field--search">
        <label htmlFor="search-input" className="controls__label">
          Search
        </label>
        <input
          id="search-input"
          type="search"
          className="controls__input"
          placeholder="Search by title or category…"
          value={searchTerm}
          disabled={disabled}
          autoComplete="off"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="controls__field">
        <label htmlFor="category-select" className="controls__label">
          Category
        </label>
        <select
          id="category-select"
          className="controls__input"
          value={category}
          disabled={disabled}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {prettyCategory(c)}
            </option>
          ))}
        </select>
      </div>

      <div className="controls__field">
        <label htmlFor="sort-select" className="controls__label">
          Sort by
        </label>
        <select
          id="sort-select"
          className="controls__input"
          value={sortBy}
          disabled={disabled}
          onChange={(e) => onSortChange(e.target.value as SortBy)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="controls__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onReset}
          disabled={disabled || isDefault}
        >
          Reset filters
        </button>
        <p className="controls__count" aria-live="polite">
          <strong>{resultsCount.toLocaleString()}</strong> result
          {resultsCount === 1 ? "" : "s"}
        </p>
      </div>
    </section>
  );
}

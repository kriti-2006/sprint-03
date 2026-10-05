/**
 * Domain types for the API Data Dashboard.
 *
 * `Product` is the normalized shape the UI renders. The raw dummyjson response
 * carries many more fields; `fetchProducts` narrows the payload to just what we
 * need so the rest of the app depends on a small, stable contract.
 */

export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  thumbnail: string;
}

/** Aggregate statistics computed by the Web Worker over the processed dataset. */
export interface ProductStatistics {
  count: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  averageRating: number;
  categories: number;
}

/** Fields the user can sort by. Values map to worker sort strategies. */
export type SortBy =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "title-asc";

/** The filter/sort criteria the UI collects and hands to the worker. */
export interface ProcessOptions {
  searchTerm: string;
  category: string; // "all" means no category filter
  sortBy: SortBy;
}

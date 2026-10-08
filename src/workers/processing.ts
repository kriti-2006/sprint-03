/**
 * Pure data-processing functions used by the Web Worker.
 *
 * Kept free of any worker globals (`self`, `postMessage`) so the exact logic
 * the worker runs can be imported and unit-tested in isolation. The worker
 * file is now only a thin message-handling shell around these functions.
 */

import type {
  Product,
  ProductStatistics,
  ProcessOptions,
  SortBy,
} from "../types/product";

/** Filter by search term (title + category match) and by category. */
export function filterProducts(
  products: Product[],
  searchTerm: string,
  category: string,
): Product[] {
  const term = searchTerm.trim().toLowerCase();
  const byCategory = category !== "" && category !== "all";

  if (!term && !byCategory) return products;

  return products.filter((p) => {
    if (byCategory && p.category !== category) return false;
    if (term) {
      const haystack = `${p.title} ${p.category}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

/** Sort by the chosen strategy. Never mutates the input array. */
export function sortProducts(products: Product[], sortBy: SortBy): Product[] {
  const sorted = products.slice();
  switch (sortBy) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "title-asc":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "relevance":
    default:
      // Keep incoming order for "relevance".
      break;
  }
  return sorted;
}

/** Aggregate statistics over a list of products in a single pass. */
export function computeStatistics(products: Product[]): ProductStatistics {
  if (products.length === 0) {
    return {
      count: 0,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      averageRating: 0,
      categories: 0,
    };
  }

  let priceSum = 0;
  let ratingSum = 0;
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  const categorySet = new Set<string>();

  for (const p of products) {
    priceSum += p.price;
    ratingSum += p.rating;
    if (p.price < minPrice) minPrice = p.price;
    if (p.price > maxPrice) maxPrice = p.price;
    categorySet.add(p.category);
  }

  return {
    count: products.length,
    averagePrice: priceSum / products.length,
    minPrice,
    maxPrice,
    averageRating: ratingSum / products.length,
    categories: categorySet.size,
  };
}

export interface ProcessingOutput {
  products: Product[];
  total: number;
  filtered: number;
  statistics: ProductStatistics;
}

/** Full pipeline: filter → sort → statistics. */
export function processProducts(
  products: Product[],
  options: ProcessOptions,
): ProcessingOutput {
  const filtered = filterProducts(products, options.searchTerm, options.category);
  const sorted = sortProducts(filtered, options.sortBy);
  const statistics = computeStatistics(sorted);

  return {
    products: sorted,
    total: products.length,
    filtered: sorted.length,
    statistics,
  };
}

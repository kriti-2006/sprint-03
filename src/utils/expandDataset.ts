/**
 * Large-dataset demonstration helper (requirement #8).
 *
 * The public API returns only ~100 records — not enough for a Web Worker to do
 * visibly meaningful work. This safely expands the *real* API records into a
 * larger in-memory "processing dataset" for stress-testing the worker.
 *
 * The expansion is honest: every duplicated record is marked `synthetic: true`
 * and given a unique id, so the UI can clearly distinguish "API Records" from
 * "Processing Dataset" and never pretend copies came from the API.
 */

import type { Product } from "../types/product";

/**
 * @param apiProducts The genuine records returned by the API.
 * @param targetSize  Desired size of the processing dataset.
 * @returns A dataset of length ~`targetSize`. The first N entries are the
 *          untouched API records; the remainder are marked-synthetic copies.
 */
export function expandDataset(
  apiProducts: Product[],
  targetSize: number,
): Product[] {
  if (apiProducts.length === 0) return [];
  if (targetSize <= apiProducts.length) return apiProducts.slice();

  const result: Product[] = apiProducts.slice();
  let nextId = Math.max(...apiProducts.map((p) => p.id)) + 1;

  let i = 0;
  while (result.length < targetSize) {
    const base = apiProducts[i % apiProducts.length];
    result.push({
      ...base,
      id: nextId++,
      synthetic: true,
    });
    i++;
  }

  return result;
}

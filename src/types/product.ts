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
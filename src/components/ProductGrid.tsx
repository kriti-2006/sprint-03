/**
 * ProductGrid — renders either skeleton cards (loading) or product cards.
 *
 * When loading, it shows a fixed number of SkeletonCards so the layout does not
 * jump when real data arrives. For large processed datasets it caps how many
 * cards are actually painted (the full dataset still flows through the worker;
 * this only limits DOM nodes to keep the page performant — requirement #18).
 */

import { SkeletonCard } from "./SkeletonCard";
import { ProductCard } from "./ProductCard";
import type { Product } from "../types/product";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  skeletonCount?: number;
  renderLimit?: number;
}

export function ProductGrid({
  products,
  loading,
  skeletonCount = 8,
  renderLimit = 60,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="product-grid" aria-busy="true" aria-label="Loading products">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const visible = products.slice(0, renderLimit);
  const hidden = products.length - visible.length;

  return (
    <>
      <div className="product-grid" aria-label="Products">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hidden > 0 && (
        <p className="product-grid__more">
          Showing {visible.length.toLocaleString()} of{" "}
          {products.length.toLocaleString()} processed records ·{" "}
          {hidden.toLocaleString()} more not rendered for performance
        </p>
      )}
    </>
  );
}

/**
 * ProductGrid — renders the product cards.
 *
 * For large lists it caps how many cards are actually painted, which keeps the
 * number of DOM nodes (and therefore layout/paint cost) bounded.
 */

import { ProductCard } from "./ProductCard";
import type { Product } from "../types/product";

interface ProductGridProps {
  products: Product[];
  renderLimit?: number;
}

export function ProductGrid({ products, renderLimit = 60 }: ProductGridProps) {
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
          {products.length.toLocaleString()} records ·{" "}
          {hidden.toLocaleString()} more not rendered for performance
        </p>
      )}
    </>
  );
}

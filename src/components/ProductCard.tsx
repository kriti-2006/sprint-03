/**
 * ProductCard — a single product tile. Memoized so re-renders of the grid don't
 * re-render every card when only a few change.
 */

import { memo } from "react";
import type { Product } from "../types/product";
import { formatCategory, formatPrice, formatRating } from "../utils/format";

interface ProductCardProps {
  product: Product;
}

function ProductCardBase({ product }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card__media">
        <img
          className="product-card__image"
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          decoding="async"
        />
        {product.synthetic && (
          <span className="product-card__tag" title="Synthetic copy for worker stress test">
            copy
          </span>
        )}
      </div>
      <div className="product-card__body">
        <span className="product-card__category">
          {formatCategory(product.category)}
        </span>
        <h3 className="product-card__title" title={product.title}>
          {product.title}
        </h3>
        <div className="product-card__meta">
          <span className="product-card__price">
            {formatPrice(product.price)}
          </span>
          <span
            className="product-card__rating"
            aria-label={`Rating ${formatRating(product.rating)} out of 5`}
          >
            <span aria-hidden="true">★</span> {formatRating(product.rating)}
          </span>
        </div>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);

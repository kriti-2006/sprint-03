/**
 * SkeletonCard — CSS placeholder that mirrors ProductCard's layout so the grid
 * stays visually stable while the API request is pending (Phase 2).
 */

export function SkeletonCard() {
  return (
    <article className="product-card product-card--skeleton" aria-hidden="true">
      <div className="product-card__media skeleton" />
      <div className="product-card__body">
        <span className="skeleton skeleton__line skeleton__line--sm" />
        <span className="skeleton skeleton__line skeleton__line--lg" />
        <span className="skeleton skeleton__line skeleton__line--md" />
        <div className="product-card__meta">
          <span className="skeleton skeleton__line skeleton__line--price" />
          <span className="skeleton skeleton__line skeleton__line--rating" />
        </div>
      </div>
    </article>
  );
}

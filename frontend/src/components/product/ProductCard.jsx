import React from 'react';
import { formatINR } from '../../data/mockProducts';

export default function ProductCard({ product, isSelected, onSelect }) {
  if (!product) return null;

  return (
    <article
      onClick={() => onSelect(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(product);
        }
      }}
      className={`relative w-full rounded-2xl bg-surface-container-lowest p-5 md:p-6 transition-all cursor-pointer overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary ${
        isSelected
          ? 'shadow-md ring-2 ring-primary-container/40'
          : 'shadow-sm hover:shadow-md'
      }`}
    >
      {isSelected && <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-container" />}

      {isSelected ? (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md shadow-xs">
            <span className="material-symbols-outlined material-symbols-filled text-[16px] text-primary">
              check_circle
            </span>
            <span className="font-semibold tracking-tight">Selected as Target Reference</span>
          </div>
          <span className="font-mono-data text-label-sm text-outline">SKU: {product.sku}</span>
        </div>
      ) : (
        <div className="flex items-center justify-between pb-3">
          <span className="font-mono-data text-label-sm text-outline">SKU: {product.sku}</span>
          <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono-data text-label-sm">
            {product.trafficTag || 'Verified Catalog SKU'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        {/* Media Aspect Box */}
        <div className="sm:col-span-4 relative rounded-xl bg-surface-container-low p-3 aspect-square flex items-center justify-center overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur font-mono-data text-label-sm text-on-surface font-semibold shadow-xs">
            {product.badgeLabel}
          </span>
        </div>

        {/* Content Area */}
        <div className="sm:col-span-8 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`font-mono-data text-label-sm uppercase tracking-wider ${
                  isSelected ? 'text-primary font-semibold' : 'text-on-surface-variant'
                }`}
              >
                {product.series}
              </span>
              <div className="flex items-center gap-0.5 text-[#F59E0B]">
                <span className="material-symbols-outlined material-symbols-filled text-[16px]">
                  star
                </span>
                <span className="font-mono-data text-label-sm font-semibold text-on-surface">
                  {product.rating}
                </span>
                <span className="font-mono-data text-label-sm text-outline">
                  ({product.reviewCount.toLocaleString('en-IN')})
                </span>
              </div>
            </div>

            <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>

            {/* Spec Badges */}
            <div className="flex flex-wrap gap-1.5 my-3">
              {(product.specBadges || []).map((badge) => (
                <span
                  key={badge}
                  className="px-2.5 py-1 rounded-md bg-surface-container font-mono-data text-label-sm text-on-surface-variant"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Price & Target Selection Radio Interaction */}
          <div className="flex items-center justify-between pt-3 mt-1">
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="font-headline-md text-headline-md font-bold text-on-surface">
                {formatINR(product.price)}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="font-mono-data text-body-sm text-outline line-through">
                  {formatINR(product.mrp)}
                </span>
              )}
              {product.discount && (
                <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-semibold">
                  {product.discount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(product);
                }}
                className={
                  isSelected
                    ? 'px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-1.5 shadow-sm'
                    : 'px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors'
                }
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                </span>
                <span>{isSelected ? 'Target Active' : 'Select Target'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

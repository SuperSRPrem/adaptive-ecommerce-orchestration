import React from 'react';

export const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under20k', label: '<₹20k', min: 0, max: 20000 },
  { id: '20k-50k', label: '₹20k-₹50k', min: 20000, max: 50000 },
  { id: '50k-1l', label: '₹50k-₹1L', min: 50000, max: 100000 },
  { id: 'over1l', label: '₹1L+', min: 100000, max: Infinity },
];

export default function ProductFilters({
  brands,
  selectedBrand,
  onSelectBrand,
  selectedPriceRange,
  onSelectPriceRange,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
      {/* Brand Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none">
        <span className="font-mono-data text-label-sm text-on-surface-variant uppercase tracking-wider shrink-0 mr-1">
          Brand:
        </span>
        <button
          type="button"
          onClick={() => onSelectBrand('all')}
          className={
            selectedBrand === 'all'
              ? 'px-3.5 py-1.5 rounded-full font-label-sm text-label-sm bg-primary text-on-primary font-semibold shadow-sm shrink-0 flex items-center gap-1'
              : 'px-3 py-1.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors shrink-0'
          }
        >
          {selectedBrand === 'all' && (
            <span className="material-symbols-outlined text-[14px]">check</span>
          )}
          <span>All Brands</span>
        </button>

        {brands.map((brand) => {
          const active = selectedBrand === brand;
          return (
            <button
              key={brand}
              type="button"
              onClick={() => onSelectBrand(active ? 'all' : brand)}
              className={
                active
                  ? 'px-3.5 py-1.5 rounded-full font-label-sm text-label-sm bg-primary text-on-primary font-semibold shadow-sm shrink-0 flex items-center gap-1'
                  : 'px-3 py-1.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors shrink-0'
              }
            >
              {active && <span className="material-symbols-outlined text-[14px]">check</span>}
              <span>{brand}</span>
            </button>
          );
        })}
      </div>

      {/* Price Range Quick Segment */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none shrink-0">
        <span className="font-mono-data text-label-sm text-on-surface-variant uppercase tracking-wider shrink-0 mr-1">
          Range:
        </span>
        {PRICE_RANGES.map((range) => {
          const active = selectedPriceRange === range.id;
          return (
            <button
              key={range.id}
              type="button"
              onClick={() =>
                onSelectPriceRange(active && range.id !== 'all' ? 'all' : range.id)
              }
              className={
                active
                  ? 'px-2.5 py-1 rounded-lg font-mono-data text-label-sm bg-surface-container-highest text-primary-container font-semibold transition-colors'
                  : 'px-2.5 py-1 rounded-lg font-mono-data text-label-sm bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors'
              }
            >
              {range.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

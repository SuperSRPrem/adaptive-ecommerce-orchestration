import React from 'react';
import { CATEGORIES } from '../../data/categories';

export default function ProductSearch({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onResetFilters,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
      {/* Global Search Input */}
      <div className="md:col-span-8 lg:col-span-9 relative flex items-center">
        <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[22px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          aria-label="Search catalog by model, brand, or SKU"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search catalog by model, brand, or SKU (e.g. Samsung 458 L, iPhone 17, IdeaPad)..."
          className="w-full h-12 pl-11 pr-28 rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container/20 transition-all shadow-inner"
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 h-8 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            <span>Clear</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onResetFilters}
            className="absolute right-2.5 h-8 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>All Filters</span>
          </button>
        )}
      </div>

      {/* Category Dropdown Select */}
      <div className="md:col-span-4 lg:col-span-3 relative">
        <div className="w-full h-12 px-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between text-on-surface font-label-md text-label-md transition-colors text-left shadow-inner relative">
          <div className="flex flex-col truncate w-full">
            <label
              htmlFor="catalog-category-select"
              className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider leading-none"
            >
              Category Filter
            </label>
            <select
              id="catalog-category-select"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full bg-transparent font-semibold text-on-surface focus:outline-none cursor-pointer pr-6 appearance-none truncate mt-0.5"
            >
              <option value="all">All Categories (17 SKUs)</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.pluralName}
                </option>
              ))}
            </select>
          </div>
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant shrink-0 pointer-events-none absolute right-3">
            expand_more
          </span>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { CATEGORIES } from '../../data/categories';
import { MOCK_PRODUCTS } from '../../data/mockProducts';

export default function CategorySelector({ selectedCategory, onSelectCategory }) {
  return (
    <section className="flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary font-mono-data text-label-sm font-semibold">
            1
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Select a Benchmark Category
          </h2>
        </div>
        <span className="font-mono-data text-label-sm text-outline">
          Showing {CATEGORIES.length} catalog domains ({MOCK_PRODUCTS.length} demo SKUs)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const catCount = MOCK_PRODUCTS.filter((p) => p.category === cat.id).length;

          return (
            <button
              key={cat.id}
              id={`cat-${cat.id}`}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={
                isActive
                  ? 'group relative flex flex-col p-space-md rounded-xl bg-surface-container-lowest text-left shadow-md hover:shadow-lg transition-all duration-200 ring-2 ring-primary'
                  : 'group relative flex flex-col p-space-md rounded-xl bg-surface-container-lowest text-left shadow-sm hover:shadow-md transition-all duration-200 hover:bg-surface-container-low opacity-85 hover:opacity-100'
              }
            >
              {isActive && (
                <div className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
              )}

              <div
                className={
                  isActive
                    ? 'w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-200'
                    : 'w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-surface-container-high transition-colors'
                }
              >
                <span className="material-symbols-outlined text-[28px]">{cat.icon}</span>
              </div>

              <div className="mt-4 flex flex-col">
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  {cat.name}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {cat.subtitle}
                </span>
              </div>

              <div
                className={`mt-4 pt-3 flex items-center justify-between font-mono-data text-label-sm ${
                  isActive ? 'text-primary font-semibold' : 'text-outline'
                }`}
              >
                <span>{isActive ? `Active Selection (${catCount} SKUs)` : `${catCount} Demo SKU Models`}</span>
                <span className="material-symbols-outlined text-[16px]">
                  {isActive ? 'tune' : 'chevron_right'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

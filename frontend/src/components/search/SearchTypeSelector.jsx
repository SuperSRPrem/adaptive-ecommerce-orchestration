import React from 'react';
import { CATEGORIES, getCategoryById } from '../../data/categories';
import { MOCK_PRODUCTS, formatINR } from '../../data/mockProducts';

export default function SearchTypeSelector({
  selectedType,
  selectedCategory,
  selectedTarget,
  selectedAttributes,
  onSelectType,
  onSelectCategory,
  onNavigateBranch,
}) {
  const displayTarget = selectedTarget || MOCK_PRODUCTS[0];
  const activeCatObj = getCategoryById(selectedCategory);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-stretch">
      {/* CARD 1: SPECIFIC PRODUCT */}
      <div
        id="branch-card-specific"
        role="button"
        tabIndex={0}
        onClick={() => onSelectType('specific')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectType('specific');
          }
        }}
        className={`group relative flex flex-col justify-between bg-surface-container-lowest rounded-2xl p-space-lg transition-all duration-300 cursor-pointer ${
          selectedType === 'specific'
            ? 'shadow-xl ring-2 ring-primary-container'
            : 'shadow-sm hover:shadow-xl'
        }`}
      >
        <div
          className={`absolute top-6 right-6 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            selectedType === 'specific'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">check</span>
        </div>

        <div className="flex flex-col gap-space-md">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-mono-data text-label-sm font-semibold tracking-wide">
              Model Known
            </span>
            <span className="text-outline font-mono-data text-label-sm">#STRAT-01</span>
          </div>

          <div className="flex flex-col gap-space-xs">
            <h2 className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors">
              I know the product I want
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Search for a particular product model and see how effectively different search methods
              find it.
            </p>
          </div>

          {/* Realistic Product Showcase Visual Container */}
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col sm:flex-row items-center gap-space-md overflow-hidden relative">
            <div className="w-full sm:w-36 h-36 shrink-0 bg-surface-container-lowest rounded-lg p-2 flex items-center justify-center shadow-sm overflow-hidden relative">
              <img
                className="w-full h-full object-contain mix-blend-multiply"
                src={displayTarget.image}
                alt={displayTarget.name}
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-surface text-on-surface font-mono-data text-[10px] shadow-sm">
                {displayTarget.badgeLabel}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 w-full min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="font-mono-data text-label-sm text-on-surface-variant uppercase tracking-wider">
                  In Stock &amp; Verified (Demo SKU)
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
                {displayTarget.shortName || displayTarget.name}
              </h3>
              <div className="flex flex-wrap gap-1">
                {(displayTarget.specBadges || []).slice(0, 3).map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
              <div className="flex items-baseline gap-2 mt-1 tabular-nums">
                <span className="font-headline-md text-headline-md text-on-surface font-bold">
                  {formatINR(displayTarget.price)}
                </span>
                {displayTarget.mrp && (
                  <span className="font-mono-data text-body-sm text-outline line-through">
                    {formatINR(displayTarget.mrp)}
                  </span>
                )}
                {displayTarget.discount && (
                  <span className="font-label-sm text-label-sm text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {displayTarget.discount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Example Query Spec Box */}
          <div className="bg-surface-container rounded-lg p-3.5 flex flex-col gap-1">
            <span className="font-mono-data text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">
                data_exploration
              </span>{' '}
              Active Reference Target
            </span>
            <p className="font-mono-data text-body-sm text-on-surface italic font-medium">
              “{displayTarget.shortName || displayTarget.name}”
            </p>
          </div>
        </div>

        {/* CTA Action */}
        <div className="pt-space-lg">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateBranch('specific');
            }}
            className="w-full flex items-center justify-between px-space-md py-3.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-all font-label-lg text-label-lg shadow-sm group-hover:shadow-md"
          >
            <span>Find a specific product</span>
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </button>
        </div>
      </div>

      {/* CARD 2: GENERAL SEARCH */}
      <div
        id="branch-card-general"
        role="button"
        tabIndex={0}
        onClick={() => onSelectType('general')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectType('general');
          }
        }}
        className={`group relative flex flex-col justify-between bg-surface-container-lowest rounded-2xl p-space-lg transition-all duration-300 cursor-pointer ${
          selectedType === 'general'
            ? 'shadow-xl ring-2 ring-primary-container'
            : 'shadow-sm hover:shadow-xl'
        }`}
      >
        <div
          className={`absolute top-6 right-6 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            selectedType === 'general'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">check</span>
        </div>

        <div className="flex flex-col gap-space-md">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-mono-data text-label-sm font-semibold tracking-wide">
              Preference Driven
            </span>
            <span className="text-outline font-mono-data text-label-sm">#STRAT-02</span>
          </div>

          <div className="flex flex-col gap-space-xs">
            <h2 className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors">
              I know what I need
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Choose a category, set your budget, and describe the features that matter to you.
            </p>
          </div>

          {/* Multi-Category Icon Preview Visual Container */}
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-3 overflow-hidden relative">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {CATEGORIES.map((cat) => {
                  const isActiveCat = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCategory(cat.id);
                        onSelectType('general');
                      }}
                      className={
                        isActiveCat
                          ? 'inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-xs transition-colors'
                          : 'inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-high transition-colors'
                      }
                    >
                      <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
              <span className="font-mono-data text-label-sm text-outline hidden sm:inline">
                {CATEGORIES.length} Domains
              </span>
            </div>

            {/* Parameter Mapping Preview Area */}
            <div className="bg-surface-container-lowest rounded-lg p-3 flex flex-col gap-2 shadow-sm">
              <div className="flex items-center justify-between text-on-surface">
                <span className="font-mono-data text-label-sm text-outline font-semibold">
                  CONFIGURED CRITERIA ({activeCatObj.name.toUpperCase()})
                </span>
                <span className="font-mono-data text-label-sm text-secondary-container font-semibold">
                  3 ACTIVE CONSTRAINTS
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2 rounded bg-surface-container-low flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Color / Finish
                  </span>
                  <span className="font-mono-data text-body-sm font-semibold text-on-surface truncate">
                    {selectedAttributes?.color || activeCatObj.defaultAttributes.color}
                  </span>
                </div>
                <div className="p-2 rounded bg-surface-container-low flex flex-col tabular-nums">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Budget Range
                  </span>
                  <span className="font-mono-data text-body-sm font-semibold text-on-surface truncate">
                    {formatINR(
                      selectedAttributes?.minPrice || activeCatObj.defaultAttributes.minPrice
                    )}{' '}
                    –{' '}
                    {formatINR(
                      selectedAttributes?.maxPrice || activeCatObj.defaultAttributes.maxPrice
                    )}
                  </span>
                </div>
                <div className="p-2 rounded bg-surface-container-low flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Primary Spec
                  </span>
                  <span className="font-mono-data text-body-sm font-semibold text-on-surface truncate">
                    {selectedAttributes?.primarySpec || activeCatObj.defaultAttributes.primarySpec}
                  </span>
                </div>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden mt-1">
                <div className="bg-secondary-container h-full rounded-full w-2/3" />
              </div>
            </div>
          </div>

          {/* Example Query Spec Box */}
          <div className="bg-surface-container rounded-lg p-3.5 flex flex-col gap-1">
            <span className="font-mono-data text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary-container">
                tune
              </span>{' '}
              Example Natural Language Query
            </span>
            <p className="font-mono-data text-body-sm text-on-surface italic font-medium">
              “{activeCatObj.suggestedQueries[0]}”
            </p>
          </div>
        </div>

        {/* CTA Action */}
        <div className="pt-space-lg">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateBranch('general');
            }}
            className="w-full flex items-center justify-between px-space-md py-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-primary hover:bg-surface-container-low transition-all font-label-lg text-label-lg shadow-sm group-hover:shadow-md group-hover:text-primary-container"
          >
            <span>Explore product categories</span>
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

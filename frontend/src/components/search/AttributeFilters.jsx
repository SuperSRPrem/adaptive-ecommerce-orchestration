import React from 'react';
import { getCategoryById } from '../../data/categories';
import { formatINR } from '../../data/mockProducts';

export default function AttributeFilters({ categoryId, attributes, onUpdateAttributes }) {
  const cat = getCategoryById(categoryId);
  const minPrice = Number(attributes.minPrice) || cat.defaultBudget.min;
  const maxPrice = Number(attributes.maxPrice) || cat.defaultBudget.max;
  const priceWindow = Math.max(0, maxPrice - minPrice);

  const catalogMin = cat.defaultBudget.catalogMin;
  const catalogMax = cat.defaultBudget.catalogMax;
  const leftPercent = Math.max(
    0,
    Math.min(90, Math.round(((minPrice - catalogMin) / (catalogMax - catalogMin)) * 100))
  );
  const rightPercent = Math.max(
    0,
    Math.min(
      90,
      100 - Math.round(((maxPrice - catalogMin) / (catalogMax - catalogMin)) * 100)
    )
  );

  const handleBrandToggle = (brand) => {
    const currentBrands = Array.isArray(attributes.brands) ? attributes.brands : [];
    const exists = currentBrands.includes(brand);
    const nextBrands = exists
      ? currentBrands.filter((b) => b !== brand)
      : [...currentBrands, brand];
    onUpdateAttributes({ brands: nextBrands });
  };

  const handlePriceInput = (field, rawValue) => {
    const numeric = parseInt(String(rawValue).replace(/[^0-9]/g, ''), 10);
    onUpdateAttributes({ [field]: Number.isNaN(numeric) ? 0 : numeric });
  };

  return (
    <div className="lg:col-span-7 flex flex-col gap-space-md">
      {/* 1. Budget Range */}
      <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              currency_rupee
            </span>
            <label
              htmlFor="min-price-input"
              className="font-label-lg text-label-lg font-semibold text-on-surface"
            >
              1. Budget Range (INR)
            </label>
          </div>
          <span
            id="price-delta-badge"
            className="font-mono-data text-label-sm text-primary font-semibold px-2 py-0.5 bg-surface-container rounded-md tabular-nums"
          >
            {formatINR(priceWindow)} Window
          </span>
        </div>

        {/* Price Inputs */}
        <div className="grid grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="min-price-input"
              className="font-label-sm text-label-sm text-on-surface-variant font-medium"
            >
              Minimum Price
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono-data text-body-md text-outline">₹</span>
              <input
                id="min-price-input"
                type="text"
                value={minPrice.toLocaleString('en-IN')}
                onChange={(e) => handlePriceInput('minPrice', e.target.value)}
                className="w-full h-11 pl-8 pr-3 bg-surface-container-low rounded-lg font-mono-data text-body-md text-on-surface font-semibold focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary shadow-inner tabular-nums"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="max-price-input"
              className="font-label-sm text-label-sm text-on-surface-variant font-medium"
            >
              Maximum Price
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono-data text-body-md text-outline">₹</span>
              <input
                id="max-price-input"
                type="text"
                value={maxPrice.toLocaleString('en-IN')}
                onChange={(e) => handlePriceInput('maxPrice', e.target.value)}
                className="w-full h-11 pl-8 pr-3 bg-surface-container-low rounded-lg font-mono-data text-body-md text-on-surface font-semibold focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary shadow-inner tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Interactive Range Presets + Slider Visual */}
        <div className="flex flex-col gap-2 pt-2">
          <div className="relative w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              id="slider-track-highlight"
              style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
              className="absolute h-full bg-primary-container rounded-full transition-all"
            />
          </div>
          <div className="flex justify-between font-mono-data text-label-sm text-outline tabular-nums">
            <span>{formatINR(catalogMin)} (Min Catalog)</span>
            <span className="text-on-surface-variant font-medium">
              Active Segment {formatINR(minPrice)}–{formatINR(maxPrice)}
            </span>
            <span>{formatINR(catalogMax)} (Max Catalog)</span>
          </div>
        </div>
      </div>

      {/* 2. Preferred Exterior Color */}
      <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">palette</span>
            2. Preferred Exterior Color
          </span>
          <span className="font-mono-data text-label-sm text-outline">Single Select</span>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1" id="color-chips">
          {cat.colors.map((c) => {
            const isSelected = attributes.color === c.label;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => onUpdateAttributes({ color: c.label })}
                className={
                  isSelected
                    ? 'color-chip px-3.5 py-2 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-2 shadow-sm transition-all'
                    : 'color-chip px-3.5 py-2 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md hover:bg-surface-container transition-all flex items-center gap-2'
                }
              >
                <span className={`w-3.5 h-3.5 rounded-full ${c.swatchClass}`} />
                <span>{c.label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Primary Category Spec (Capacity / Storage / Case Size) */}
      <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              {cat.primarySpecIcon}
            </span>
            {cat.primarySpecLabel}
          </span>
          <span className="font-mono-data text-label-sm text-outline">{cat.primarySpecUnit}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1" id="capacity-chips">
          {cat.primarySpecOptions.map((opt) => {
            const isSelected = attributes.primarySpec === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdateAttributes({ primarySpec: opt.value })}
                className={
                  isSelected
                    ? 'cap-chip p-3 rounded-lg bg-primary-container text-on-primary ring-2 ring-primary flex flex-col items-center justify-center text-center shadow-sm transition-all font-semibold'
                    : 'cap-chip p-3 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container flex flex-col items-center justify-center text-center transition-all'
                }
              >
                <span className="font-label-md text-label-md font-semibold">{opt.value}</span>
                <span
                  className={
                    isSelected
                      ? 'font-mono-data text-label-sm text-on-primary-container'
                      : 'font-mono-data text-label-sm text-outline'
                  }
                >
                  {opt.sublabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Brand Preference (Multi-select) */}
      <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
            4. Brand Preference
          </span>
          <span className="font-mono-data text-label-sm text-primary font-semibold">
            Multi-Select ({(attributes.brands || []).length} Selected)
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1" id="brand-pills">
          {cat.brands.map((brand) => {
            const isSelected = (attributes.brands || []).includes(brand);
            return (
              <button
                key={brand}
                type="button"
                onClick={() => handleBrandToggle(brand)}
                className={
                  isSelected
                    ? 'brand-pill px-4 py-2 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all'
                    : 'brand-pill px-4 py-2 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all flex items-center gap-1.5'
                }
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isSelected ? '' : 'text-outline'
                  }`}
                >
                  {isSelected ? 'check_circle' : 'add'}
                </span>
                <span>{brand}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5 & 6 Row Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* 5. Secondary Spec (Energy / Display / Endurance) */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
          <span className="font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              {cat.secondarySpecIcon}
            </span>
            {cat.secondarySpecLabel}
          </span>
          <div className="flex flex-col gap-2 pt-1">
            {cat.secondarySpecOptions.map((opt) => {
              const isSelected = attributes.secondarySpec === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-surface-container-low'
                      : 'bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="secondary-spec"
                      checked={isSelected}
                      onChange={() => onUpdateAttributes({ secondarySpec: opt.value })}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      {opt.value}
                    </span>
                  </div>
                  <div className="flex items-center text-amber-500 text-[14px]">
                    {Array.from({ length: opt.stars || 3 }).map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined material-symbols-filled text-[16px]"
                      >
                        star
                      </span>
                    ))}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* 6. Tertiary Spec (Usage & Family Size) */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
          <span className="font-label-lg text-label-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              {cat.tertiarySpecIcon}
            </span>
            {cat.tertiarySpecLabel}
          </span>
          <div className="flex flex-col gap-2 pt-1">
            {cat.tertiarySpecOptions.map((opt) => {
              const isSelected = attributes.tertiarySpec === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-surface-container-low'
                      : 'bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="tertiary-spec"
                      checked={isSelected}
                      onChange={() => onUpdateAttributes({ tertiarySpec: opt.value })}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">
                        {opt.value}
                      </span>
                      <span className="font-mono-data text-label-sm text-outline">
                        {opt.sublabel}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      done
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

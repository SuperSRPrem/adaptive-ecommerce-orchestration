import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIES, getCategoryById, formatINR } from '../../data/categories';
import {
  CategoryIcon,
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Lock,
  Layers,
  Info,
  Tag,
} from '../common/CategoryIcon';

// Color palette with visual swatches
const COLOR_OPTIONS = [
  { id: 'any', label: 'Any Color', hex: null },
  { id: 'black', label: 'Black', hex: '#1e293b' },
  { id: 'silver', label: 'Silver', hex: '#cbd5e1' },
  { id: 'gray', label: 'Gray', hex: '#64748b' },
  { id: 'blue', label: 'Blue', hex: '#2563eb' },
  { id: 'red', label: 'Red', hex: '#dc2626' },
  { id: 'white', label: 'White', hex: '#f8fafc', border: true },
  { id: 'gold', label: 'Gold', hex: '#d97706' },
  { id: 'rose gold', label: 'Rose Gold', hex: '#fb7185' },
  { id: 'green', label: 'Green', hex: '#16a34a' },
  { id: 'brown', label: 'Brown', hex: '#78350f' },
  { id: 'stainless steel', label: 'Stainless', hex: '#94a3b8' },
];

// Discrete options by category based on actual products.csv catalog
const SPEC_OPTIONS = {
  laptop: {
    budget: { min: 20000, max: 150000, step: 5000, defaultMin: 40000, defaultMax: 80000 },
    ram: [
      { value: null, label: 'Any' },
      { value: 4, label: '4 GB+' },
      { value: 8, label: '8 GB+' },
      { value: 16, label: '16 GB+' },
      { value: 32, label: '32 GB+' },
      { value: 64, label: '64 GB' },
    ],
    storage: [
      { value: null, label: 'Any' },
      { value: 128, label: '128 GB+' },
      { value: 256, label: '256 GB+' },
      { value: 512, label: '512 GB+' },
      { value: 1024, label: '1 TB+' },
      { value: 2048, label: '2 TB' },
    ],
    screen: { min: 11.0, max: 18.0, step: 0.5, defaultMin: 15.0, defaultMax: 17.5 },
    brands: ['Any', 'HP', 'Apple', 'Lenovo', 'ASUS', 'Dell', 'Acer', 'Razer', 'Alienware', 'MSI'],
    colors: ['any', 'black', 'silver', 'gray', 'blue', 'red', 'white', 'gold'],
  },
  phone: {
    budget: { min: 8000, max: 100000, step: 2000, defaultMin: 20000, defaultMax: 60000 },
    ram: [
      { value: null, label: 'Any' },
      { value: 3, label: '3 GB+' },
      { value: 4, label: '4 GB+' },
      { value: 6, label: '6 GB+' },
      { value: 8, label: '8 GB+' },
      { value: 12, label: '12 GB+' },
    ],
    storage: [
      { value: null, label: 'Any' },
      { value: 32, label: '32 GB+' },
      { value: 64, label: '64 GB+' },
      { value: 128, label: '128 GB+' },
      { value: 256, label: '256 GB+' },
      { value: 512, label: '512 GB' },
    ],
    screen: { min: 5.0, max: 7.0, step: 0.1, defaultMin: 5.5, defaultMax: 6.7 },
    brands: ['Any', 'Apple', 'Samsung Electronics', 'ASUS', 'OnePlus', 'Xiaomi', 'Motorola', 'NUU', 'BLU'],
    colors: ['any', 'black', 'silver', 'gray', 'blue', 'red', 'white', 'gold', 'rose gold', 'green'],
  },
  watch: {
    budget: { min: 2000, max: 60000, step: 1000, defaultMin: 5000, defaultMax: 35000 },
    features: [
      { value: null, label: 'Any Style / Use' },
      { value: 'heart rate', label: 'Fitness & Heart Rate' },
      { value: 'gps', label: 'Built-in GPS Tracking' },
      { value: 'waterproof', label: 'Waterproof / Swim' },
      { value: 'touchscreen', label: 'Touchscreen Smartwatch' },
    ],
    brands: ['Any', 'Samsung Electronics', 'Fossil', 'Garmin', 'Amazfit', 'TicWatch', 'Apple', 'Diesel', 'iTouch'],
    colors: ['any', 'black', 'blue', 'pink', 'silver', 'rose gold', 'brown', 'green'],
  },
  refrigerator: {
    budget: { min: 10000, max: 120000, step: 5000, defaultMin: 25000, defaultMax: 80000 },
    capacity: [
      { value: null, label: 'Any Capacity' },
      { value: 1.7, label: 'Compact (< 2.5 cu. ft.)' },
      { value: 3.0, label: 'Mid-Size (3.0–4.5 cu. ft.)' },
      { value: 5.0, label: 'Large (5.0+ cu. ft.)' },
    ],
    brands: ['Any', 'Danby', 'RCA', 'Cooluli', 'Midea', 'Galanz', 'BLACK+DECKER', 'Frigidaire', 'Kenmore'],
    colors: ['any', 'black', 'white', 'stainless steel', 'silver', 'red', 'gray'],
  },
};

export default function ProductSpecificationBuilder({
  initialCategory = 'laptop',
  onConfirmSpecification,
}) {
  const [category, setCategory] = useState(initialCategory);

  // Specifications State
  const [minPrice, setMinPrice] = useState(40000);
  const [maxPrice, setMaxPrice] = useState(80000);
  const [ram, setRam] = useState(16);
  const [storage, setStorage] = useState(512);
  const [minScreen, setMinScreen] = useState(15.0);
  const [maxScreen, setMaxScreen] = useState(17.5);
  const [color, setColor] = useState('black');
  const [brand, setBrand] = useState('Any');
  const [feature, setFeature] = useState(null);
  const [capacity, setCapacity] = useState(null);

  const activeCategoryObj = getCategoryById(category);
  const categoryConfig = SPEC_OPTIONS[category] || SPEC_OPTIONS.laptop;

  // Reset defaults when changing category
  const applyCategoryDefaults = (catId) => {
    const cfg = SPEC_OPTIONS[catId] || SPEC_OPTIONS.laptop;
    setMinPrice(cfg.budget.defaultMin);
    setMaxPrice(cfg.budget.defaultMax);

    if (catId === 'laptop') {
      setRam(16);
      setStorage(512);
      setMinScreen(cfg.screen.defaultMin);
      setMaxScreen(cfg.screen.defaultMax);
      setColor('black');
      setBrand('Any');
      setFeature(null);
      setCapacity(null);
    } else if (catId === 'phone') {
      setRam(8);
      setStorage(128);
      setMinScreen(cfg.screen.defaultMin);
      setMaxScreen(cfg.screen.defaultMax);
      setColor('black');
      setBrand('Any');
      setFeature(null);
      setCapacity(null);
    } else if (catId === 'watch') {
      setRam(null);
      setStorage(null);
      setMinScreen(null);
      setMaxScreen(null);
      setColor('black');
      setBrand('Any');
      setFeature('gps');
      setCapacity(null);
    } else if (catId === 'refrigerator') {
      setRam(null);
      setStorage(null);
      setMinScreen(null);
      setMaxScreen(null);
      setColor('black');
      setBrand('Any');
      setFeature(null);
      setCapacity(3.0);
    }
  };

  const handleCategoryChange = (newCatId) => {
    setCategory(newCatId);
    applyCategoryDefaults(newCatId);
  };

  const handleResetToDefaults = () => {
    applyCategoryDefaults(category);
  };

  const handleClearAll = () => {
    const cfg = categoryConfig;
    setMinPrice(cfg.budget.min);
    setMaxPrice(cfg.budget.max);
    setRam(null);
    setStorage(null);
    if (cfg.screen) {
      setMinScreen(cfg.screen.min);
      setMaxScreen(cfg.screen.max);
    } else {
      setMinScreen(null);
      setMaxScreen(null);
    }
    setColor('any');
    setBrand('Any');
    setFeature(null);
    setCapacity(null);
  };

  // Safe budget slider handlers
  const handleMinPriceChange = (e) => {
    const val = Number(e.target.value);
    if (val <= maxPrice) {
      setMinPrice(val);
    }
  };

  const handleMaxPriceChange = (e) => {
    const val = Number(e.target.value);
    if (val >= minPrice) {
      setMaxPrice(val);
    }
  };

  // Safe screen slider handlers
  const handleMinScreenChange = (e) => {
    const val = Number(e.target.value);
    if (!maxScreen || val <= maxScreen) {
      setMinScreen(val);
    }
  };

  const handleMaxScreenChange = (e) => {
    const val = Number(e.target.value);
    if (!minScreen || val >= minScreen) {
      setMaxScreen(val);
    }
  };

  // Construct target specification payload
  const constructedTarget = useMemo(() => {
    const target = {
      category,
      min_price: minPrice,
      max_price: maxPrice,
    };

    if (ram !== null) {
      target.ram_gb = ram;
      target.min_ram_gb = ram;
    }
    if (storage !== null) {
      target.storage_gb = storage;
      target.min_storage_gb = storage;
    }
    if (minScreen !== null && maxScreen !== null) {
      target.min_screen_size = minScreen;
      target.max_screen_size = maxScreen;
      target.screen_inches = Number(((minScreen + maxScreen) / 2).toFixed(1));
    }
    if (color && color !== 'any') {
      target.color = color;
    } else {
      target.color = null;
    }
    if (brand && brand !== 'Any') {
      target.brand = brand.toLowerCase();
      target.preferred_brand = brand;
    } else {
      target.brand = null;
    }
    if (capacity !== null) {
      target.min_capacity_cu_ft = capacity;
    }
    if (feature !== null) {
      target.feature = feature;
    }

    return target;
  }, [category, minPrice, maxPrice, ram, storage, minScreen, maxScreen, color, brand, capacity, feature]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (onConfirmSpecification) {
      onConfirmSpecification(constructedTarget);
    }
  };

  // Budget slider visual percentage
  const budgetMinPct = Math.round(
    ((minPrice - categoryConfig.budget.min) /
      (categoryConfig.budget.max - categoryConfig.budget.min)) *
      100
  );
  const budgetMaxPct = Math.round(
    ((maxPrice - categoryConfig.budget.min) /
      (categoryConfig.budget.max - categoryConfig.budget.min)) *
      100
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto space-y-8">
      {/* SECTION 1: Choose Product Category */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
              Stage 01 · Step 1
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              Choose Product Category
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">4 Supported Domains</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600">
          Select the category you wish to evaluate. The specification controls below will dynamically adapt to the attributes available for that category in our catalog.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/70 border-primary ring-2 ring-primary/20 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-primary text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <CategoryIcon category={cat.id} size={20} />
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                      <CheckCircle2 size={13} />
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <div className="font-bold text-sm text-slate-900">{cat.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {cat.catalogCount} items in catalog
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Dynamic Specification Controls */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
              Stage 01 · Step 2
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              Set Your {activeCategoryObj.name} Requirements
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <span>Make All Unrestricted</span>
            </button>
          </div>
        </div>

        {/* 1. BUDGET RANGE CONTROLS */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                Budget Range (INR)
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Define the minimum and maximum acceptable price range.
              </p>
            </div>
            <div className="text-sm font-bold font-mono text-primary bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {formatINR(minPrice)} ━━━━━●━━━━━ {formatINR(maxPrice)}
            </div>
          </div>

          {/* Visual Track */}
          <div className="space-y-2 pt-2">
            <div className="relative w-full h-3 bg-slate-200 rounded-full">
              <div
                className="absolute top-0 bottom-0 bg-primary rounded-full"
                style={{
                  left: `${budgetMinPct}%`,
                  width: `${Math.max(0, budgetMaxPct - budgetMinPct)}%`,
                }}
              />
            </div>

            {/* Synchronized Slider Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Minimum Budget:</span>
                  <strong className="font-mono">{formatINR(minPrice)}</strong>
                </div>
                <input
                  type="range"
                  min={categoryConfig.budget.min}
                  max={categoryConfig.budget.max}
                  step={categoryConfig.budget.step}
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  className="w-full accent-primary cursor-pointer"
                  aria-label="Minimum Budget"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Maximum Budget:</span>
                  <strong className="font-mono">{formatINR(maxPrice)}</strong>
                </div>
                <input
                  type="range"
                  min={categoryConfig.budget.min}
                  max={categoryConfig.budget.max}
                  step={categoryConfig.budget.step}
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  className="w-full accent-primary cursor-pointer"
                  aria-label="Maximum Budget"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. CATEGORY SPECIFIC ATTRIBUTES */}
        {/* A. LAPTOPS & PHONES (RAM, Storage, Screen) */}
        {(category === 'laptop' || category === 'phone') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RAM Control */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                  Minimum RAM Capacity
                </label>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {ram ? `${ram} GB or more` : 'Unrestricted'}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {categoryConfig.ram.map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setRam(opt.value)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      ram === opt.value
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Control */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                  Minimum Storage / SSD
                </label>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {storage ? (storage >= 1024 ? `${storage / 1024} TB+` : `${storage} GB+`) : 'Unrestricted'}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {categoryConfig.storage.map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setStorage(opt.value)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      storage === opt.value
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Screen Size Slider */}
            {categoryConfig.screen && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                      Screen Size Range (Inches)
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Desired display diagonal size in inches.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                    {minScreen && maxScreen ? `${minScreen}" – ${maxScreen}"` : 'Any Screen Size'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Min Screen Size:</span>
                      <strong className="font-mono">{minScreen}&quot;</strong>
                    </div>
                    <input
                      type="range"
                      min={categoryConfig.screen.min}
                      max={categoryConfig.screen.max}
                      step={categoryConfig.screen.step}
                      value={minScreen || categoryConfig.screen.min}
                      onChange={handleMinScreenChange}
                      className="w-full accent-primary cursor-pointer"
                      aria-label="Min Screen Size"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Max Screen Size:</span>
                      <strong className="font-mono">{maxScreen}&quot;</strong>
                    </div>
                    <input
                      type="range"
                      min={categoryConfig.screen.min}
                      max={categoryConfig.screen.max}
                      step={categoryConfig.screen.step}
                      value={maxScreen || categoryConfig.screen.max}
                      onChange={handleMaxScreenChange}
                      className="w-full accent-primary cursor-pointer"
                      aria-label="Max Screen Size"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* B. REFRIGERATORS (Capacity in cu. ft.) */}
        {category === 'refrigerator' && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                  Refrigerator Capacity (Cubic Feet)
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extracted from catalog product specifications where available.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">
                {capacity ? `${capacity} cu. ft. or more` : 'Any Capacity'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categoryConfig.capacity.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setCapacity(opt.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    capacity === opt.value
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* C. WATCHES (Feature / Usage) */}
        {category === 'watch' && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                  Smart Feature &amp; Usage Focus
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Keywords verified from watch catalog titles &amp; feature bullets.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">
                {feature || 'Unrestricted'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {categoryConfig.features.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setFeature(opt.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    feature === opt.value
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. COLOR PALETTE SELECTION */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
              Preferred Color
            </label>
            <span className="text-xs font-mono font-bold text-slate-900 capitalize">
              {color === 'any' || !color ? 'Any Color (Unrestricted)' : color}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.filter((c) =>
              categoryConfig.colors ? categoryConfig.colors.includes(c.id) : true
            ).map((c) => {
              const isSelected = color === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-2xs ring-1 ring-primary/30'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.hex && (
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block"
                      style={{
                        backgroundColor: c.hex,
                        border: c.border ? '1px solid #cbd5e1' : 'none',
                      }}
                    />
                  )}
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. BRAND SELECTION */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                Brand Preference
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Populated from catalog inventory in {activeCategoryObj.name}.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-900">
              {brand || 'Any Brand (Unrestricted)'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryConfig.brands.map((b) => {
              const isSelected = brand === b;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {b === 'Any' ? 'Any Brand (Unrestricted)' : b}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: Review Your Requirements (Summary Card) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
              Stage 01 · Step 3
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              Review Your Configured Requirements
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-primary border border-blue-100">
            Hidden Evaluation Target
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600">
          These attributes represent your personal evaluation criteria. When you search in the next step, the engine will measure how well the returned results satisfy these constraints.
        </p>

        {/* Real-time Summary Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1 font-mono">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Category</div>
            <div className="text-xs font-bold text-slate-900 capitalize mt-1">
              {category}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 col-span-2 sm:col-span-1 lg:col-span-2">
            <div className="text-[10px] text-blue-700 uppercase font-bold">Budget Window</div>
            <div className="text-xs font-bold text-blue-900 mt-1">
              {formatINR(minPrice)} – {formatINR(maxPrice)}
            </div>
          </div>

          {(category === 'laptop' || category === 'phone') && (
            <>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">RAM</div>
                <div className="text-xs font-bold text-slate-900 mt-1">
                  {ram ? `${ram} GB or more` : 'Any'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Storage / SSD</div>
                <div className="text-xs font-bold text-slate-900 mt-1">
                  {storage ? (storage >= 1024 ? `${storage / 1024} TB+` : `${storage} GB+`) : 'Any'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Screen</div>
                <div className="text-xs font-bold text-slate-900 mt-1">
                  {minScreen && maxScreen ? `${minScreen}"–${maxScreen}"` : 'Any'}
                </div>
              </div>
            </>
          )}

          {category === 'refrigerator' && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Capacity</div>
              <div className="text-xs font-bold text-slate-900 mt-1">
                {capacity ? `${capacity} cu. ft.+` : 'Any'}
              </div>
            </div>
          )}

          {category === 'watch' && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Feature Focus</div>
              <div className="text-xs font-bold text-slate-900 mt-1 truncate" title={feature || 'Any'}>
                {feature || 'Any'}
              </div>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Color</div>
            <div className="text-xs font-bold text-slate-900 capitalize mt-1">
              {color === 'any' || !color ? 'Any' : color}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Brand</div>
            <div className="text-xs font-bold text-slate-900 capitalize mt-1 truncate" title={brand}>
              {brand || 'Any'}
            </div>
          </div>
        </div>

        {/* Target Leakage Prevention Safeguard Notice */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3 mt-2">
          <Lock size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Target Leakage Prevention Guarantee:</strong> These target specifications are kept privately in client memory.
            When you enter your natural-language query in the next step, these target constraints are <strong>never</strong> transmitted
            to the retrieval engine. The backend evaluator scores the retrieved products against your criteria only after retrieval is complete.
          </p>
        </div>
      </div>

      {/* SECTION 4: Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={handleResetToDefaults}
          className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors order-2 sm:order-1"
        >
          Reset to Category Defaults
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-primary hover:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 order-1 sm:order-2"
        >
          <span>Continue to Query Formulation (Step 2)</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

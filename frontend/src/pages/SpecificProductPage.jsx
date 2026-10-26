import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useExperimentSession } from '../hooks/useExperimentSession';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import ProductSearch from '../components/product/ProductSearch';
import ProductFilters, { PRICE_RANGES } from '../components/product/ProductFilters';
import ProductCard from '../components/product/ProductCard';
import TargetSummary from '../components/product/TargetSummary';

const ALL_BRANDS = ['Samsung', 'LG', 'Apple', 'Lenovo', 'Sony', 'Whirlpool', 'Bosch', 'OnePlus', 'Godrej'];

export default function SpecificProductPage() {
  const navigate = useNavigate();
  const { session, setTargetProduct, setCategory } = useExperimentSession();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const handleCategoryChange = (catId) => {
    setCategoryFilter(catId);
    if (catId !== 'all') {
      setCategory(catId);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setSelectedBrand('all');
    setSelectedPriceRange('all');
  };

  const filteredProducts = useMemo(() => {
    const priceObj = PRICE_RANGES.find((r) => r.id === selectedPriceRange) || PRICE_RANGES[0];
    const q = searchTerm.trim().toLowerCase();

    const list = MOCK_PRODUCTS.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
      if (p.price < priceObj.min || p.price > priceObj.max) return false;
      if (q) {
        const haystack = [
          p.name,
          p.shortName,
          p.brand,
          p.sku,
          p.category,
          p.description,
          ...(p.specBadges || []),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'rating') {
      return [...list].sort((a, b) => b.rating - a.rating);
    }
    // Default relevance: keep selected target easily visible or catalog order
    return list;
  }, [searchTerm, categoryFilter, selectedBrand, selectedPriceRange, sortBy]);

  const handleSelectTarget = (product) => {
    setTargetProduct(product, [], false);
  };

  const handleContinueToConfirmation = () => {
    if (!session.selectedTargetProduct) return;
    navigate('/target-confirmation');
  };

  const handleSkipToQuery = () => {
    if (!session.selectedTargetProduct) return;
    navigate('/query');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Subtle Ambient Top Glow */}
      <div className="relative w-full overflow-hidden pointer-events-none -mb-32 h-64">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[980px] h-56 bg-gradient-to-b from-primary-fixed/40 via-surface-container/20 to-transparent blur-3xl opacity-70" />
      </div>

      <div className="max-w-[1360px] w-full mx-auto px-margin relative z-10 flex flex-col gap-space-lg">
        {/* Breadcrumb & Step Micro-Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-4">
          <nav className="flex items-center gap-2 font-mono-data text-label-sm text-on-surface-variant">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-outline-variant font-body-sm">/</span>
            <span className="text-on-surface font-label-md">Specific product</span>
            <span className="text-outline-variant font-body-sm">/</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-label-sm font-semibold tracking-wide uppercase">
              Stage 02
            </span>
          </nav>

          <div className="flex items-center gap-space-xs font-mono-data text-label-sm text-on-surface-variant bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span>
              Active Target SKU: {session.selectedTargetProduct?.sku || 'None Selected'}
            </span>
          </div>
        </div>

        {/* Page Title & Analytical Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="material-symbols-outlined text-primary-container text-[20px]">
                filter_center_focus
              </span>
              <span className="font-mono-data text-label-sm uppercase tracking-wider text-primary font-semibold">
                Evaluation Target Calibration
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Which product are you looking for?
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-1.5">
              Choose an exact model from our available product catalog as your target reference.
            </p>
          </div>

          {/* Quick Session Stats Widget (Computed from real catalog) */}
          <div className="hidden lg:flex items-center gap-4 bg-surface-container-lowest p-2.5 px-4 rounded-xl shadow-sm shrink-0 tabular-nums">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Demo Catalog Pool
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                {MOCK_PRODUCTS.length} Items
              </span>
            </div>
            <div className="w-px h-8 bg-surface-container-high" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Filtered Matches
              </span>
              <span className="font-headline-sm text-headline-sm text-primary-container font-mono-data">
                {filteredProducts.length} of {MOCK_PRODUCTS.length}
              </span>
            </div>
          </div>
        </div>

        {/* Analytical Filtering Command Center */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col gap-4">
          <ProductSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={categoryFilter}
            onCategoryChange={handleCategoryChange}
            onResetFilters={handleResetFilters}
          />
          <ProductFilters
            brands={ALL_BRANDS}
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
            selectedPriceRange={selectedPriceRange}
            onSelectPriceRange={setSelectedPriceRange}
          />
        </div>

        {/* Main Asymmetric Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left Column: Catalog Stream (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between px-1 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Available Matches
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono-data text-label-sm tabular-nums">
                  {filteredProducts.length} Candidate Target{filteredProducts.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono-data text-label-sm text-on-surface-variant">
                <label htmlFor="sort-select">Sorted by:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-surface-container-lowest px-2.5 py-1 rounded-lg text-on-surface font-semibold border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="relevance">Relevance Match</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl bg-surface-container-lowest p-8 text-center shadow-sm flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-[36px] text-outline">
                  search_off
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  No catalog products match your active filters
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
                  Try clearing your search keyword, selecting &ldquo;All Brands&rdquo;, or expanding
                  the price bracket.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={session.selectedTargetProduct?.id === product.id}
                  onSelect={handleSelectTarget}
                />
              ))
            )}
          </div>

          {/* Right Column: Sticky Detail & Reference Inspector (4 Cols) */}
          <TargetSummary
            product={session.selectedTargetProduct}
            relaxedConstraints={session.relaxedConstraints}
            onContinue={handleContinueToConfirmation}
            onConfirmModal={handleSkipToQuery}
            onResetFilter={handleResetFilters}
            continueLabel="Review & Confirm Target"
          />
        </div>
      </div>
    </div>
  );
}

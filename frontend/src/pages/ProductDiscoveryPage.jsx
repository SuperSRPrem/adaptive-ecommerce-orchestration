import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CATEGORIES, getCategoryById, formatINR } from '../data/categories';
import { searchProducts } from '../services/api';
import { useExperimentSession } from '../hooks/useExperimentSession';
import {
  CategoryIcon,
  ProductVisual,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Star,
  Info,
} from '../components/common/CategoryIcon';

export default function ProductDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { backendHealth, showToast } = useExperimentSession();

  const initialCat = searchParams.get('category') || 'laptop';
  const initialQuery = searchParams.get('q') || '17 inch gaming laptop';
  const initialMode = searchParams.get('mode') || 'orchestrated';
  const initialType = searchParams.get('type') || 'specific';

  const [category, setCategory] = useState(initialCat);
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState(initialMode);
  const [searchType, setSearchType] = useState(initialType);
  const [kCount, setKCount] = useState(10);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResponse, setSearchResponse] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const activeCategoryObj = getCategoryById(category);

  const handleSearch = useCallback(
    async (overrideQuery = null, overrideCat = null, overrideMode = null, overrideType = null) => {
      const q = (overrideQuery !== null ? overrideQuery : query).trim();
      const cat = overrideCat !== null ? overrideCat : category;
      const m = overrideMode !== null ? overrideMode : mode;
      const t = overrideType !== null ? overrideType : searchType;

      if (!q) {
        showToast('Please enter a search query.', 'error');
        return;
      }

      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      // Update URL parameters
      setSearchParams({
        category: cat,
        q,
        mode: m,
        type: t,
      });

      try {
        const response = await searchProducts({
          query: q,
          mode: m,
          category: cat,
          search_type: t,
          k: kCount,
        });
        setSearchResponse(response);
      } catch (err) {
        setError(err.message || 'Search execution failed.');
      } finally {
        setIsLoading(false);
      }
    },
    [query, category, mode, searchType, kCount, setSearchParams, showToast]
  );

  // Run initial search on mount
  useEffect(() => {
    handleSearch(initialQuery, initialCat, initialMode, initialType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategorySelect = (newCat) => {
    setCategory(newCat);
    const catObj = getCategoryById(newCat);
    const defaultEx = catObj.discoveryExamples[0];
    setQuery(defaultEx.query);
    setSearchType(defaultEx.searchType);
    handleSearch(defaultEx.query, newCat, mode, defaultEx.searchType);
  };

  const handleExampleClick = (ex) => {
    setQuery(ex.query);
    setSearchType(ex.searchType);
    handleSearch(ex.query, category, mode, ex.searchType);
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mb-1">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Live Product Discovery</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
            E-Commerce Product Discovery Engine
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Explore 1,145 real ESCI products with natural language search, structured constraint reasoning, and adaptive stockout recovery.
          </p>
        </div>

        {/* Experiment Link CTA */}
        <Link
          to="/experiment"
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-blue-50 text-primary border border-blue-200 text-xs font-semibold hover:bg-blue-100/70 transition-colors flex items-center gap-1.5"
        >
          <Sparkles size={14} />
          <span>Switch to Human Evaluation Study →</span>
        </Link>
      </div>

      {/* Category Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex items-center gap-3 ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <CategoryIcon category={cat.id} size={20} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{cat.pluralName}</div>
                <div
                  className={`text-[11px] font-mono truncate ${
                    isActive ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {cat.catalogCount} Verified Items
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search Input Box & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        {/* Search Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Enter natural-language query (e.g. "${activeCategoryObj.discoveryExamples[0]?.query || '...'}")`}
              className="w-full h-13 pl-11 pr-24 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-blue-100 text-sm font-medium transition-all outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-13 px-6 rounded-xl bg-primary hover:bg-blue-800 disabled:opacity-60 text-white font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 shrink-0"
          >
            {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
            <span>Search</span>
          </button>
        </form>

        {/* Config Controls Strip: Mode + Search Type + Result Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Mode Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-slate-500 uppercase tracking-wider">Search Mode:</span>
            {[
              { id: 'orchestrated', label: 'Orchestrated (Adaptive Stockout Recovery)', badge: 'Recommended' },
              { id: 'optimized', label: 'Optimized (Constraints + MMR)' },
              { id: 'baseline', label: 'Baseline (Semantic Only)' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  handleSearch(query, category, m.id, searchType);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  mode === m.id
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                }`}
              >
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Search Type (Specific vs General) */}
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-500 uppercase tracking-wider">Query Intent:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSearchType('specific');
                  handleSearch(query, category, mode, 'specific');
                }}
                className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                  searchType === 'specific'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Specific Product
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchType('general');
                  handleSearch(query, category, mode, 'general');
                }}
                className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                  searchType === 'general'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                General Requirements
              </button>
            </div>
          </div>
        </div>

        {/* Clickable Example Queries for Active Category */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Try example:</span>
          {activeCategoryObj.discoveryExamples.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => handleExampleClick(ex)}
              className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-primary text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
            >
              &ldquo;{ex.query}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Parsed Constraints & Orchestration Status Pill if available */}
      {searchResponse && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/90 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap text-slate-700">
            <span className="font-semibold text-slate-900 uppercase">
              Mode: {searchResponse.mode}
            </span>
            <span>·</span>
            <span>Category: {searchResponse.category}</span>
            <span>·</span>
            <span>Search Type: {searchResponse.search_type}</span>
            {searchResponse.parsed_constraints &&
              Object.keys(searchResponse.parsed_constraints).length > 0 && (
                <>
                  <span>·</span>
                  <span className="text-primary font-semibold">
                    Parsed: {JSON.stringify(searchResponse.parsed_constraints)}
                  </span>
                </>
              )}
          </div>

          <div className="flex items-center gap-2">
            {searchResponse.orchestration_triggered ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} />
                Orchestration Triggered (Stockout Recovered)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                Internal Inventory Fulfillment
              </span>
            )}
            <span className="text-slate-500">
              Execution: {searchResponse.clientLatencyMs}ms
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-sm">Search Request Error</div>
            <div className="text-xs">{error}</div>
            <button
              type="button"
              onClick={() => handleSearch()}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry Search
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs animate-pulse space-y-3"
            >
              <div className="w-full h-40 bg-slate-100 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-6 bg-slate-200 rounded w-1/3 pt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && searchResponse && searchResponse.results && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-slate-800">
              Found {searchResponse.results.length} Top Ranked Products for &ldquo;{searchResponse.query}&rdquo;
            </div>
            <div className="text-xs font-mono text-slate-400">
              Ranked by {searchResponse.mode.toUpperCase()} Pipeline
            </div>
          </div>

          {searchResponse.results.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
              <Search size={36} className="mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-800">No Products Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No catalog items matched your active search constraints in {activeCategoryObj.name}. Try broadening your price range or search terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {searchResponse.results.map((product, idx) => {
                const isPartner = product.source === 'partner';
                const finalPrice = product.final_price || product.price;

                return (
                  <article
                    key={product.product_id || idx}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Rank Badge */}
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 text-xs font-mono">
                      <span className="font-bold text-slate-500">Rank #{idx + 1}</span>
                      {isPartner ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          Partner Recovered
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          Internal In-Stock
                        </span>
                      )}
                    </div>

                    {/* Product Visual */}
                    <div className="w-full h-44 mb-3">
                      <ProductVisual
                        product={product}
                        category={product.category || category}
                        size="lg"
                        className="w-full h-full"
                      />
                    </div>

                    {/* Product Meta */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span className="font-bold text-primary uppercase">
                          {product.product_brand || 'Verified Brand'}
                        </span>
                        <span>SKU: {product.product_id}</span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {product.product_title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-1">
                        {product.product_color && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px]">
                            {product.product_color}
                          </span>
                        )}
                        {typeof product.constraint_match === 'number' && (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold">
                            Constraint: {Math.round(product.constraint_match * 100)}%
                          </span>
                        )}
                        {typeof product.score === 'number' && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px]">
                            Score: {product.score.toFixed(3)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Delivery Details */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-slate-400">
                          {isPartner ? 'Partner Merchant Price' : 'Catalog Price'}
                        </div>
                        <div className="text-lg font-bold text-slate-950 font-mono">
                          {formatINR(finalPrice)}
                        </div>
                      </div>

                      {product.partner_delivery_days ? (
                        <div className="flex items-center gap-1 text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                          <Truck size={13} />
                          <span>Delivery: {product.partner_delivery_days}d</span>
                        </div>
                      ) : (
                        <div className="text-[11px] font-mono text-slate-400">
                          Standard Shipping
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useExperimentSession } from '../hooks/useExperimentSession';
import { getCategoryById, formatINR } from '../data/categories';
import {
  CategoryIcon,
  FlaskConical,
  Search,
  Lock,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Sparkles,
} from '../components/common/CategoryIcon';

export default function QueryPage() {
  const navigate = useNavigate();
  const {
    session,
    setUserQuery,
    runComparisonExperiment,
    showToast,
  } = useExperimentSession();

  const [isRunning, setIsRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeScenario = session.activeScenario;
  const activeCategoryObj = getCategoryById(session.category);

  // If user arrived without selecting a scenario or defining specs, redirect to /experiment
  if (!activeScenario) {
    return (
      <div className="w-full max-w-[800px] mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle size={36} className="text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No Target Specifications Defined</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please define your target product requirements before formulating a search query.
        </p>
        <Link
          to="/experiment"
          className="inline-flex px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
        >
          Set Requirements in Builder →
        </Link>
      </div>
    );
  }

  const isDynamic = Boolean(activeScenario.isDynamic || activeScenario.id?.startsWith('dynamic_spec_'));
  const constraints = activeScenario.target_constraints || {};

  const handleQueryChange = (val) => {
    if (errorMsg) setErrorMsg('');
    setUserQuery(val);
  };

  const handleRunSearch = async (e) => {
    if (e) e.preventDefault();
    const trimmed = (session.userQuery || '').trim();
    if (!trimmed) {
      setErrorMsg('Please enter your own natural-language search query.');
      showToast('Please type a search query.', 'error');
      return;
    }

    setErrorMsg('');
    setIsRunning(true);

    try {
      await runComparisonExperiment(trimmed);
      showToast('Query executed across all 3 search systems.', 'success');
      navigate('/comparison');
    } catch (err) {
      setErrorMsg(err.message || 'Search execution failed.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mb-1">
            <Link to="/experiment" className="hover:text-primary transition-colors">
              Set Requirements
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Stage 02 · Query Formulation</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
            Formulate Your Natural-Language Query
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Describe what you are searching for in your own words. Your query will execute across all three search systems.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 shadow-2xs">
          <span>Session: {session.sessionId}</span>
        </div>
      </div>

      {/* Target Task Brief Card (Displays strictly participant-facing requirements) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100">
              <CategoryIcon category={session.category} size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  Your Target Reference Requirements
                </span>
                {isDynamic ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    Custom Specification
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                    Controlled Scenario
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-mono capitalize mt-0.5">
                Domain: {activeCategoryObj?.name || session.category}
              </div>
            </div>
          </div>

          <Link
            to="/experiment"
            className="text-xs text-primary hover:text-blue-800 font-semibold transition-colors"
          >
            Edit Specifications →
          </Link>
        </div>

        {/* Task Objective Description */}
        {session.searchType === 'specific' ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-mono uppercase text-slate-500 font-bold">
              Target Product Title:
            </div>
            <p className="text-base font-bold text-slate-900 leading-snug">
              {activeScenario.target_product_title}
            </p>
            {activeScenario.target_brand && (
              <div className="text-xs font-mono text-slate-500">
                Target Brand: <strong className="text-slate-800">{activeScenario.target_brand}</strong>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-xs font-mono uppercase text-slate-500 font-bold">
              Target Criteria To Satisfy:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
              {/* Budget Range */}
              {(constraints.min_price || constraints.max_price) && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                  <div className="text-slate-400 font-mono text-[10px] uppercase font-bold">Budget Window</div>
                  <div className="font-bold text-blue-700 font-mono mt-0.5">
                    {constraints.min_price && constraints.max_price
                      ? `${formatINR(constraints.min_price)} – ${formatINR(constraints.max_price)}`
                      : constraints.max_price
                      ? `Up to ${formatINR(constraints.max_price)}`
                      : `From ${formatINR(constraints.min_price)}`}
                  </div>
                </div>
              )}

              {/* RAM */}
              {(constraints.min_ram_gb || constraints.ram_gb) && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                  <div className="text-slate-400 font-mono text-[10px] uppercase font-bold">RAM</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">
                    {constraints.min_ram_gb || constraints.ram_gb} GB or more
                  </div>
                </div>
              )}

              {/* Storage */}
              {(constraints.min_storage_gb || constraints.storage_gb) && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                  <div className="text-slate-400 font-mono text-[10px] uppercase font-bold">Storage / SSD</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">
                    {(() => {
                      const val = constraints.min_storage_gb || constraints.storage_gb;
                      return val >= 1024 ? `${val / 1024} TB or more` : `${val} GB or more`;
                    })()}
                  </div>
                </div>
              )}

              {/* Screen Size */}
              {((constraints.min_screen_size && constraints.max_screen_size) || constraints.screen_inches) && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                  <div className="text-slate-400 font-mono text-[10px] uppercase font-bold">Screen Size</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">
                    {constraints.min_screen_size && constraints.max_screen_size
                      ? `${constraints.min_screen_size}" – ${constraints.max_screen_size}"`
                      : `${constraints.screen_inches}"`}
                  </div>
                </div>
              )}

              {/* Color */}
              {constraints.color && constraints.color !== 'any' && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                  <div className="text-slate-400 font-mono text-[10px] uppercase font-bold">Color Preference</div>
                  <div className="font-bold text-slate-900 font-mono capitalize mt-0.5">
                    {constraints.color}
                  </div>
                </div>
              )}

              {/* Brand */}
              {(constraints.preferred_brand || (constraints.brand && constraints.brand !== 'any')) && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                  <div className="text-slate-400 font-mono text-[10px] uppercase font-bold">Preferred Brand</div>
                  <div className="font-bold text-slate-900 font-mono capitalize mt-0.5">
                    {constraints.preferred_brand || constraints.brand}
                  </div>
                </div>
              )}

              {/* Refrigerator Capacity */}
              {constraints.min_capacity_cu_ft && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                  <div className="text-slate-400 font-mono text-[10px] uppercase font-bold">Capacity</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">
                    {constraints.min_capacity_cu_ft} cu. ft. or more
                  </div>
                </div>
              )}

              {/* Watch Feature */}
              {constraints.feature && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                  <div className="text-slate-400 font-mono text-[10px] uppercase font-bold">Feature Focus</div>
                  <div className="font-bold text-slate-900 font-mono capitalize mt-0.5">
                    {constraints.feature}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
          <Info size={14} className="text-primary shrink-0" />
          <span>
            Formulate a natural search query that you would normally type into a store search bar to find an item meeting these criteria.
          </span>
        </div>
      </div>

      {/* Query Formulation Input Box */}
      <form
        onSubmit={handleRunSearch}
        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <label htmlFor="participant-query-input" className="text-sm font-bold text-slate-900">
            Enter your natural-language search query:
          </label>
          <span className="text-xs font-mono text-slate-400">
            {session.userQuery?.length || 0} characters
          </span>
        </div>

        <div className="relative">
          <textarea
            id="participant-query-input"
            rows={3}
            value={session.userQuery || ''}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Type your search query here (e.g. 15 inch gaming laptop 16gb ram ssd under 75000)..."
            className="w-full p-4 rounded-2xl bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-blue-100 text-base font-medium transition-all outline-none resize-none"
          />
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Leakage Protection Callout */}
        <div className="p-3.5 rounded-xl bg-slate-50 text-xs font-mono text-slate-500 flex items-start gap-2 border border-slate-100">
          <Lock size={15} className="text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Experimental Guarantee:</strong> Your search input is transmitted alone to the retrieval API.
            The target product ID and target constraints are strictly excluded from the request.
          </span>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <Link
            to="/experiment"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Back to Specification Builder
          </Link>

          <button
            type="submit"
            disabled={isRunning}
            className="px-8 py-3.5 rounded-xl bg-primary hover:bg-blue-800 disabled:opacity-60 text-white font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Running 3-Way Search Pipelines...</span>
              </>
            ) : (
              <>
                <span>Submit Query &amp; Compare Systems (Step 3)</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

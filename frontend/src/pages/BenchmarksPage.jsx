import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BENCHMARK_OVERVIEW } from '../data/benchmarks';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  FlaskConical,
  Activity,
  Layers,
  ShieldCheck,
  Search,
} from '../components/common/CategoryIcon';

export default function BenchmarksPage() {
  const [activeTab, setActiveTab] = useState('main'); // 'main' | 'stockout' | 'figures' | 'substitutes'

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mb-1">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Empirical Benchmarks</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
            Experimental Benchmark Results
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Rigorous evaluation across 173 real ESCI queries and controlled stockout simulations comparing Baseline, Optimized, and Centralized Adaptive Orchestration.
          </p>
        </div>

        <Link
          to="/experiment"
          className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2"
        >
          <FlaskConical size={14} />
          <span>Test in Human Evaluation Study →</span>
        </Link>
      </div>

      {/* Dataset & Ground-Truth Context Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <div className="text-slate-400 uppercase font-semibold text-[10px]">Evaluation Queries</div>
          <div className="text-lg font-bold text-slate-900 font-sans">
            {BENCHMARK_OVERVIEW.totalQueries} Real ESCI Queries
          </div>
          <div className="text-slate-500 text-[11px]">
            Balanced across Laptops, Phones, Watches, and Refrigerators
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <div className="text-slate-400 uppercase font-semibold text-[10px]">Catalog Inventory</div>
          <div className="text-lg font-bold text-slate-900 font-sans">
            {BENCHMARK_OVERVIEW.totalCatalogProducts} Verified Products
          </div>
          <div className="text-slate-500 text-[11px]">
            854 in-stock, 291 simulated stockouts (210 with partner availability)
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <div className="text-slate-400 uppercase font-semibold text-[10px]">Data Integrity Scope</div>
          <div className="text-lg font-bold text-emerald-700 font-sans">
            Real Relevance Ground Truth
          </div>
          <div className="text-slate-500 text-[11px]">
            ESCI queries/labels are real; stockout/partner fields are simulated
          </div>
        </div>
      </div>

      {/* Benchmark Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold overflow-x-auto scrollbar-none">
        {[
          { id: 'main', label: '173-Query Discovery Benchmark' },
          { id: 'stockout', label: 'Controlled Stockout Recovery Study (n = 9)' },
          { id: 'figures', label: 'Visual Benchmark Plots' },
          { id: 'substitutes', label: 'Substitute Pilot & Limitations' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 border-b-2 font-mono whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary font-bold bg-blue-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: 173-Query Discovery Benchmark */}
      {activeTab === 'main' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Primary Benchmark Performance Table (173 Real ESCI Queries)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparison of Baseline, Optimized, and Orchestrated retrieval models across all domains.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">ESCI Test Partition</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5">System Condition</th>
                    <th className="py-3 px-5">Hit@5</th>
                    <th className="py-3 px-5">MRR (Mean Reciprocal Rank)</th>
                    <th className="py-3 px-5">Brand Diversity (%)</th>
                    <th className="py-3 px-5">Mean Relevance</th>
                    <th className="py-3 px-5">Average Latency</th>
                    <th className="py-3 px-5">Orchestration Trigger Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {BENCHMARK_OVERVIEW.modes.map((m) => {
                    const isOrch = m.mode === 'orchestrated';
                    return (
                      <tr key={m.mode} className={isOrch ? 'bg-blue-50/50 font-bold text-primary' : 'hover:bg-slate-50'}>
                        <td className="py-4 px-5 font-sans font-semibold text-slate-900">
                          {m.label} ({m.subtitle})
                        </td>
                        <td className="py-4 px-5">{m.hitAt5Formatted}</td>
                        <td className="py-4 px-5">{m.mrrFormatted}</td>
                        <td className="py-4 px-5">{m.brandDiversityFormatted}</td>
                        <td className="py-4 px-5">{m.meanRelevanceFormatted}</td>
                        <td className="py-4 px-5">{m.latencyFormatted}</td>
                        <td className="py-4 px-5">{m.triggerRate.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Interpretation Alert */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Info size={16} className="text-primary" />
              <span>Rigorous Research Interpretation</span>
            </div>
            <p>
              <strong>Hit@5 Invariance:</strong> The orchestrated model matches baseline Hit@5 at <strong>42.197%</strong>. We do not claim higher raw Hit@5; rather, orchestration prevents relevance degradation while incorporating fulfillment routing and diversity.
            </p>
            <p>
              <strong>MRR &amp; Diversity Gains:</strong> Orchestrated achieves the highest MRR (<strong>0.274</strong> vs 0.263) and increases Brand Diversity from <strong>64.624% to 69.335%</strong> (+4.71 percentage points) without sacrificing latency (31.5 ms vs 15.3 ms baseline, well within interactive tolerances).
            </p>
          </div>

          {/* Category Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Category-Wise Performance Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5">Category</th>
                    <th className="py-3 px-5">Baseline Hit@5 / MRR</th>
                    <th className="py-3 px-5">Optimized Hit@5 / MRR</th>
                    <th className="py-3 px-5">Orchestrated Hit@5 / MRR</th>
                    <th className="py-3 px-5">Diversity (Base → Orch)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {BENCHMARK_OVERVIEW.byCategory.map((cat) => (
                    <tr key={cat.category} className="hover:bg-slate-50">
                      <td className="py-3.5 px-5 font-sans font-bold text-slate-900">
                        {cat.label}
                      </td>
                      <td className="py-3.5 px-5">
                        {cat.baseline.hitAt5.toFixed(1)}% / {cat.baseline.mrr.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-5">
                        {cat.optimized.hitAt5.toFixed(1)}% / {cat.optimized.mrr.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-primary">
                        {cat.orchestrated.hitAt5.toFixed(1)}% / {cat.orchestrated.mrr.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-5">
                        {cat.baseline.diversity.toFixed(1)}% → {cat.orchestrated.diversity.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Controlled Stockout Recovery Study */}
      {activeTab === 'stockout' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Controlled Exact-Stockout Recovery Evaluation (n = 9)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Strict inclusion: top semantic search result is Amazon-labeled Exact, exists in cleaned catalog, and is out of internal stock.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-primary bg-blue-50 px-3 py-1 rounded-full">
                66.7% Overall Recovery
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-slate-400 uppercase text-[10px]">Strict Eligible Cases</div>
                <div className="text-2xl font-bold text-slate-900 font-sans">9 Cases</div>
                <div className="text-slate-500 text-[11px]">4 laptops, 4 phones, 1 watch</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-slate-400 uppercase text-[10px]">Partner Available Cases</div>
                <div className="text-2xl font-bold text-emerald-700 font-sans">6 / 6 (100%)</div>
                <div className="text-slate-500 text-[11px]">Every partner target recovered at Rank #1</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-slate-400 uppercase text-[10px]">Baseline / Optimized Recovery</div>
                <div className="text-2xl font-bold text-red-600 font-sans">0 / 9 (0%)</div>
                <div className="text-slate-500 text-[11px]">Non-orchestrated engines drop all stockouts</div>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Exact Target Recovery</th>
                    <th className="py-3 px-4">Partner-Available Recovery</th>
                    <th className="py-3 px-4">Target MRR</th>
                    <th className="py-3 px-4">Orchestration Trigger Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {BENCHMARK_OVERVIEW.stockoutStudy.modes.map((row) => (
                    <tr
                      key={row.mode}
                      className={row.mode === 'orchestrated' ? 'bg-blue-50/60 font-bold text-primary' : ''}
                    >
                      <td className="py-3 px-4 font-sans font-semibold">{row.label}</td>
                      <td className="py-3 px-4">{row.overallRecovery}</td>
                      <td className="py-3 px-4">{row.partnerAvailableRecovery}</td>
                      <td className="py-3 px-4">{row.targetMrr}</td>
                      <td className="py-3 px-4">{row.triggerRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-amber-700" />
                <span>Simulation Boundary &amp; Disclosure</span>
              </div>
              <p>
                These controlled results represent a deterministic simulation of partner availability and fulfillment.
                They demonstrate the algorithmic efficacy of adaptive fallback routing, not empirical Amazon merchant availability.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Visual Benchmark Plots */}
      {activeTab === 'figures' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {BENCHMARK_OVERVIEW.figures.map((fig) => (
              <div
                key={fig.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
              >
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {fig.title}
                  </h3>
                </div>

                <div className="p-4 bg-white flex items-center justify-center min-h-[220px]">
                  <img
                    src={fig.filename}
                    alt={fig.title}
                    className="max-h-64 object-contain rounded-lg"
                    onError={(e) => {
                      // Fallback if image fails
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                <div className="p-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50/50">
                  {fig.caption}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Substitute Pilot & Limitations */}
      {activeTab === 'substitutes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Substitute Route Exploratory Pilot (n = 3)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exploratory study examining substitute retrieval when exact targets are unavailable.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Pilot Only · Methodological Boundary
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase">Eligible Cases</span>
                <div className="text-lg font-bold text-slate-900 font-sans mt-0.5">3 Cases</div>
                <div className="text-slate-400 text-[10px]">2 watch, 1 laptop</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase">Avg Substitutes/Case</span>
                <div className="text-lg font-bold text-slate-900 font-sans mt-0.5">4.0 Items</div>
                <div className="text-slate-400 text-[10px]">Amazon ESCI labels</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase">Substitute Hit@5</span>
                <div className="text-lg font-bold text-slate-900 font-sans mt-0.5">66.7%</div>
                <div className="text-slate-400 text-[10px]">Consistent across modes</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase">Substitute MRR</span>
                <div className="text-lg font-bold text-slate-900 font-sans mt-0.5">0.417 – 0.444</div>
                <div className="text-slate-400 text-[10px]">All modes evaluate evenly</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {BENCHMARK_OVERVIEW.substitutePilot.note}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

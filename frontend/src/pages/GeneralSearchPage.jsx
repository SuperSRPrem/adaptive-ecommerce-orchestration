import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useExperimentSession } from '../hooks/useExperimentSession';
import { getCategoryById } from '../data/categories';
import { formatINR } from '../data/mockProducts';
import { evaluateGeneralSearchCandidates } from '../services/searchService';
import CategorySelector from '../components/search/CategorySelector';
import AttributeFilters from '../components/search/AttributeFilters';

export default function GeneralSearchPage() {
  const navigate = useNavigate();
  const {
    session,
    setCategory,
    updateAttributes,
    resetCategoryAttributes,
    setTargetProduct,
  } = useExperimentSession();

  const activeCategoryObj = getCategoryById(session.category);
  const attrs = session.selectedAttributes;

  const evaluation = useMemo(
    () => evaluateGeneralSearchCandidates(session.category, attrs),
    [session.category, attrs]
  );

  const activeBenchmarkEntry =
    evaluation.allEvaluated.find((e) => e.product.id === session.selectedTargetProduct?.id) ||
    evaluation.recommendedBenchmark;

  const activeTarget = activeBenchmarkEntry?.product || session.selectedTargetProduct;
  const activeRelaxed = activeBenchmarkEntry?.relaxedConstraints || [];

  const brandSummary =
    attrs.brands && attrs.brands.length > 0 ? attrs.brands.join('/') : 'Any Brand';
  const summaryChipText = `${attrs.color || 'Any'} ${activeCategoryObj.name} | ${formatINR(
    attrs.minPrice
  )}–${formatINR(attrs.maxPrice)} | ${attrs.primarySpec} | ${attrs.secondarySpec} | ${brandSummary}`;

  const handleCandidateClick = (candidateEntry) => {
    setTargetProduct(candidateEntry.product, candidateEntry.relaxedConstraints, false);
  };

  const handleFindTarget = () => {
    if (activeBenchmarkEntry) {
      setTargetProduct(
        activeBenchmarkEntry.product,
        activeBenchmarkEntry.relaxedConstraints,
        false
      );
    }
    navigate('/target-confirmation');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 right-12 w-96 h-96 rounded-full bg-surface-container-high opacity-60 blur-3xl pointer-events-none" />
        <div className="absolute top-80 -left-20 w-80 h-80 rounded-full bg-primary-fixed opacity-40 blur-3xl pointer-events-none" />

        <div className="max-w-[1360px] mx-auto px-margin py-space-lg w-full flex flex-col gap-space-xl relative z-10">
          {/* Top Section: Breadcrumb & Title Block */}
          <div className="flex flex-col gap-space-xs">
            <nav className="flex items-center gap-2 font-mono-data text-label-sm text-on-surface-variant mb-1">
              <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">home</span>
                Home
              </Link>
              <span className="text-outline-variant">/</span>
              <span className="text-primary font-semibold">General search</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-mono-data text-label-sm uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Step 02 · Target Calibration
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
                  What kind of product do you need?
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-1.5">
                  Define your desired attributes. Our system will pinpoint the closest catalog match
                  to serve as your experiment benchmark.
                </p>
              </div>

              {/* Metadata Pill */}
              <div className="flex items-center gap-3 bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-sm self-start lg:self-auto">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">dataset</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono-data text-label-sm text-outline">Dataset Corpus</span>
                  <span className="font-headline-sm text-label-lg font-semibold text-on-surface">
                    Consumer Tech INR v2.4 (Demo)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Visual Category Switcher */}
          <CategorySelector
            selectedCategory={session.category}
            onSelectCategory={setCategory}
          />

          {/* Step 2: Two-Column Attribute Configuration Layout */}
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary font-mono-data text-label-sm font-semibold">
                  2
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Configure Specification Attributes
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-surface-container text-primary font-mono-data text-label-sm font-semibold">
                  Active Category: {activeCategoryObj.name}
                </span>
              </div>

              <button
                id="reset-defaults"
                type="button"
                onClick={resetCategoryAttributes}
                className="text-primary hover:text-surface-tint font-label-md text-label-md flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                Reset to Experiment Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left Column: Form Controls (7 Columns) */}
              <AttributeFilters
                categoryId={session.category}
                attributes={attrs}
                onUpdateAttributes={updateAttributes}
              />

              {/* Right Column: Live Summary Card (5 Columns) */}
              <div className="lg:col-span-5 sticky top-20 flex flex-col gap-space-md">
                <div className="rounded-xl bg-surface-container-lowest shadow-md overflow-hidden flex flex-col">
                  {/* Banner Header */}
                  <div className="p-space-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary flex flex-col gap-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono-data text-label-sm uppercase tracking-wider backdrop-blur-sm">
                        Live Reactive Preview
                      </span>
                      <div className="flex items-center gap-1.5 font-mono-data text-label-sm text-white/90">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Synthesizing
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className="font-mono-data text-label-sm text-on-primary-container uppercase tracking-wider font-semibold">
                        Step 2 Benchmark
                      </span>
                      <h3 className="font-headline-md text-headline-md font-bold text-white tracking-tight">
                        Your Ideal Product
                      </h3>
                    </div>
                  </div>

                  {/* Product Visual Spec Snapshot */}
                  <div className="p-space-lg flex flex-col gap-space-md">
                    {activeTarget && (
                      <div className="relative w-full h-44 rounded-lg bg-surface-container-low overflow-hidden flex items-center justify-center p-3">
                        <img
                          className="object-contain h-full max-h-36 drop-shadow-md rounded-md"
                          src={activeTarget.image}
                          alt={activeTarget.name}
                        />
                        <div className="absolute bottom-2.5 left-3 px-2 py-1 rounded bg-inverse-surface/80 backdrop-blur-md text-inverse-on-surface font-mono-data text-label-sm flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">tune</span>
                          <span className="truncate max-w-[240px]">
                            Matched: {activeTarget.shortName || activeTarget.name}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Target Attribute Profile Badge */}
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono-data text-label-sm uppercase tracking-wider text-outline font-semibold">
                        Target Attribute Profile
                      </span>
                      <div
                        id="summary-chip-text"
                        className="p-3 rounded-lg bg-surface-container-low font-mono-data text-body-sm font-semibold text-primary leading-relaxed break-words"
                      >
                        {summaryChipText}
                      </div>
                    </div>

                    {/* Constraint Relaxation Alert if no 100% exact match */}
                    {activeRelaxed.length > 0 ? (
                      <div className="p-3.5 rounded-lg bg-error-container/45 border border-error/20 flex gap-3 items-start text-on-error-container">
                        <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
                          warning
                        </span>
                        <div className="font-body-sm text-body-sm space-y-1">
                          <div className="font-semibold">
                            Closest Target Relaxes {activeRelaxed.length} Constraint
                            {activeRelaxed.length === 1 ? '' : 's'}:
                          </div>
                          <ul className="list-disc list-inside text-[12px]">
                            {activeRelaxed.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-lg bg-surface-container flex gap-3 items-start">
                        <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                          analytics
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                          All configured constraints are satisfied by the selected benchmark item in
                          the active demo dataset.
                        </p>
                      </div>
                    )}

                    {/* Nearest Matches Counter Card (Actual computed counts) */}
                    <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-high">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-mono-data text-label-md font-bold tabular-nums">
                          {evaluation.exactMatches.length > 0
                            ? evaluation.exactMatches.length
                            : evaluation.allEvaluated.length}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md font-semibold text-on-surface">
                            {evaluation.exactMatches.length > 0
                              ? `${evaluation.exactMatches.length} exact catalog match${
                                  evaluation.exactMatches.length === 1 ? '' : 'es'
                                } found`
                              : `0 exact matches · Showing ${evaluation.topCandidates.length} closest`}
                          </span>
                          <span className="font-mono-data text-label-sm text-on-surface-variant">
                            Top candidate fit score: {activeBenchmarkEntry?.matchScore || 100}%
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        task_alt
                      </span>
                    </div>

                    {/* Interactive Candidate Match List */}
                    <div className="flex flex-col gap-1.5 pt-1 font-mono-data text-label-sm">
                      <span className="text-outline uppercase text-[10px]">
                        Click a candidate to set as target benchmark:
                      </span>
                      {evaluation.topCandidates.map((entry) => {
                        const isPicked = activeTarget?.id === entry.product.id;
                        return (
                          <button
                            key={entry.product.id}
                            type="button"
                            onClick={() => handleCandidateClick(entry)}
                            className={`flex items-center justify-between p-2 rounded-lg text-left transition-colors tabular-nums ${
                              isPicked
                                ? 'bg-primary-fixed text-on-primary-fixed font-semibold ring-1 ring-primary'
                                : 'hover:bg-surface-container-low text-on-surface-variant'
                            }`}
                          >
                            <span className="truncate pr-2">
                              {entry.product.shortName || entry.product.name}
                            </span>
                            <span className="font-semibold text-on-surface shrink-0">
                              {formatINR(entry.product.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Primary CTA */}
                    <button
                      id="cta-find-target"
                      type="button"
                      onClick={handleFindTarget}
                      className="w-full py-3.5 px-space-md rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm font-semibold hover:bg-surface-tint active:bg-primary transition-all duration-150 flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2"
                    >
                      <span>Find My Target Product</span>
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>

                    <div className="flex items-center justify-center gap-2 font-mono-data text-label-sm text-outline">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      <span>Session {session.sessionId} · Target Confirmation Next</span>
                    </div>
                  </div>
                </div>

                {/* Experiment Insight Micro-Card */}
                <div className="p-space-md rounded-xl bg-surface-container flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-[24px]">
                      science
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">
                        Natural Language Baseline Ready
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Step 3 will construct semantic prompt variants.
                      </span>
                    </div>
                  </div>
                  <span className="font-mono-data text-label-sm text-secondary font-semibold">
                    READY
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

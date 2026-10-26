import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useExperimentSession } from '../hooks/useExperimentSession';
import { getCategoryById } from '../data/categories';
import { formatINR, getProductsByCategory } from '../data/mockProducts';

export default function TargetConfirmationPage() {
  const navigate = useNavigate();
  const { session, setTargetProduct, confirmTarget } = useExperimentSession();
  const target = session.selectedTargetProduct;
  const categoryObj = getCategoryById(target?.category || session.category);
  const categoryPeers = getProductsByCategory(target?.category || session.category);
  const relaxed = session.relaxedConstraints || [];

  const handleConfirmAndProceed = () => {
    confirmTarget();
    navigate('/query');
  };

  const handleBackToSelection = () => {
    navigate(session.searchType === 'general' ? '/general-search' : '/specific-product');
  };

  if (!target) {
    return (
      <div className="max-w-[1360px] mx-auto px-margin py-space-xl">
        <div className="bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm text-center space-y-4">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            No Target Product Selected
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Please select a target product before proceeding to the experiment.
          </p>
          <button
            type="button"
            onClick={() => navigate('/specific-product')}
            className="px-6 py-3 rounded-xl bg-primary-container text-on-primary font-label-lg"
          >
            Go to Product Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin py-space-xl flex flex-col gap-space-lg">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <nav className="flex items-center gap-2 font-mono-data text-label-sm text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <button
            type="button"
            onClick={handleBackToSelection}
            className="hover:text-primary transition-colors"
          >
            {session.searchType === 'general' ? 'General Search' : 'Specific Product'}
          </button>
          <span>/</span>
          <span className="text-primary font-semibold">Target Confirmation</span>
        </nav>

        <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono-data text-label-sm text-on-surface font-semibold uppercase tracking-wide">
            Stage 02B · Ground Truth Lock
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-primary font-mono-data text-label-sm uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Benchmark Confirmation</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Confirm your target benchmark product
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Verify the product attributes and price below. This item will serve as the ground-truth
            target across all three search conditions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleBackToSelection}
          className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center gap-1.5 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Modify Target Criteria</span>
        </button>
      </div>

      {/* Main Confirmation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-space-lg shadow-md border-t-4 border-primary-container flex flex-col gap-space-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-container-high">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-semibold">
              <span className="material-symbols-outlined material-symbols-filled text-[16px] text-primary">
                check_circle
              </span>
              <span>Designated Experiment Ground Truth</span>
            </div>
            <span className="font-mono-data text-label-sm text-outline">
              SKU: {target.sku} · {categoryObj.taxonomyLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 rounded-xl bg-surface-container-low p-6 aspect-square flex items-center justify-center relative">
              <img
                src={target.image}
                alt={target.name}
                className="w-full h-full object-contain mix-blend-multiply"
              />
              <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-surface-container-lowest font-mono-data text-label-sm font-semibold text-on-surface shadow-xs">
                {target.badgeLabel}
              </span>
            </div>

            <div className="md:col-span-7 flex flex-col gap-4">
              <div>
                <span className="font-mono-data text-label-sm uppercase tracking-wider text-primary font-semibold">
                  {target.series}
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface mt-1">
                  {target.name}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  {target.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(target.specBadges || []).map((badge) => (
                  <span
                    key={badge}
                    className="px-2.5 py-1 rounded-md bg-surface-container font-mono-data text-label-sm text-on-surface-variant"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Price & Rating Block */}
              <div className="p-4 rounded-xl bg-surface-container-low flex flex-wrap items-center justify-between gap-4 tabular-nums">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block">
                    Confirmed Benchmark Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                      {formatINR(target.price)}
                    </span>
                    {target.mrp && target.mrp > target.price && (
                      <span className="font-mono-data text-body-sm text-outline line-through">
                        {formatINR(target.mrp)}
                      </span>
                    )}
                    {target.discount && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-semibold">
                        {target.discount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-surface-container-lowest px-3 py-2 rounded-lg shadow-xs">
                  <span className="material-symbols-outlined material-symbols-filled text-[#F59E0B] text-[18px]">
                    star
                  </span>
                  <span className="font-mono-data text-label-md font-bold text-on-surface">
                    {target.rating}
                  </span>
                  <span className="font-mono-data text-label-sm text-outline">
                    ({target.reviewCount.toLocaleString('en-IN')} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Specification Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-surface-container-low">
              <span className="font-label-sm text-label-sm text-outline uppercase">
                Color / Finish
              </span>
              <div className="font-mono-data text-body-md font-semibold text-on-surface mt-0.5">
                {target.attributes.finish} ({target.attributes.color})
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low">
              <span className="font-label-sm text-label-sm text-outline uppercase">
                Capacity / Spec
              </span>
              <div className="font-mono-data text-body-md font-semibold text-on-surface mt-0.5">
                {target.attributes.capacity}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low">
              <span className="font-label-sm text-label-sm text-outline uppercase">
                Efficiency / Tier
              </span>
              <div className="font-mono-data text-body-md font-semibold text-primary mt-0.5">
                {target.attributes.energyRating}
              </div>
            </div>
          </div>

          {/* Constraint Audit Notice */}
          {session.searchType === 'general' && relaxed.length > 0 && (
            <div className="p-4 rounded-xl bg-error-container/50 border border-error/25 text-on-error-container flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">warning</span>
              <div className="space-y-1 font-body-sm text-body-sm">
                <div className="font-semibold">
                  Note: Relaxation Recorded for General Search Constraints
                </div>
                <p>
                  This target was selected as the closest match in the demo catalog, with the
                  following constraint differences recorded for session analysis:
                </p>
                <ul className="list-disc list-inside font-mono-data text-[12px]">
                  {relaxed.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-surface-container-high">
            <button
              type="button"
              onClick={handleBackToSelection}
              className="px-5 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-colors"
            >
              ← Change Target Selection
            </button>
            <button
              id="confirm-target-cta"
              type="button"
              onClick={handleConfirmAndProceed}
              className="px-7 py-3.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              <span>Confirm Target &amp; Proceed to Query</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right Column: Alternate Category Benchmarks */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Other {categoryObj.pluralName} in Catalog
              </h3>
              <span className="font-mono-data text-label-sm text-outline">
                {categoryPeers.length} SKUs
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Want to lock a different {categoryObj.name.toLowerCase()} benchmark instead? Click any
              item below:
            </p>
            <div className="flex flex-col gap-2 mt-1">
              {categoryPeers.map((peer) => {
                const isCurrent = peer.id === target.id;
                return (
                  <button
                    key={peer.id}
                    type="button"
                    onClick={() => setTargetProduct(peer, [], false)}
                    className={`p-3 rounded-xl text-left flex items-center justify-between gap-2 transition-all tabular-nums ${
                      isCurrent
                        ? 'bg-primary-fixed text-on-primary-fixed font-semibold ring-1 ring-primary'
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-label-md text-label-md truncate">
                        {peer.shortName || peer.name}
                      </div>
                      <div className="font-mono-data text-[11px] text-on-surface-variant">
                        {peer.attributes.color} · {peer.attributes.capacity}
                      </div>
                    </div>
                    <span className="font-mono-data text-label-md font-bold shrink-0">
                      {formatINR(peer.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

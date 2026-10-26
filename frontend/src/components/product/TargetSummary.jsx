import React from 'react';
import { formatINR } from '../../data/mockProducts';
import { getCategoryById } from '../../data/categories';

export default function TargetSummary({
  product,
  relaxedConstraints = [],
  onContinue,
  onConfirmModal,
  onResetFilter,
  continueLabel = 'Continue to Target Confirmation',
}) {
  if (!product) {
    return (
      <div className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-md">
        <p className="font-body-md text-on-surface-variant">
          Please select a product from the catalog list to inspect its benchmark specifications.
        </p>
      </div>
    );
  }

  const categoryObj = getCategoryById(product.category);

  return (
    <div className="lg:col-span-4 sticky top-20 flex flex-col gap-space-md">
      {/* Inspector Panel Card */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Selected Target Details
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-mono-data text-label-sm font-semibold">
            Active Focus
          </span>
        </div>

        {/* Product Image & Quick Preview */}
        <div className="relative rounded-xl bg-surface-container-low p-4 flex flex-col items-center justify-center overflow-hidden my-1">
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-surface-container-lowest shadow-xs flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>Verified Reference</span>
          </div>
          <div className="w-44 h-44 my-2">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
          <span className="font-mono-data text-label-sm text-on-surface-variant mt-1">
            Catalog Reference ID: {product.refCode || product.sku}
          </span>
        </div>

        {/* Product Taxonomy & Metadata */}
        <div className="pt-4 flex flex-col gap-1.5">
          <span className="font-mono-data text-label-sm text-primary font-semibold uppercase tracking-wider">
            {categoryObj.taxonomyLabel}
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface leading-snug">
            {product.name} ({product.sku})
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{product.description}</p>
        </div>

        {/* Relaxed Constraint Warning if any */}
        {relaxedConstraints.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-error-container/50 border border-error/20 text-on-error-container font-body-sm text-body-sm">
            <div className="font-semibold flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>Constraint Mismatch Flagged:</span>
            </div>
            <ul className="list-disc list-inside text-[12px] space-y-0.5">
              {relaxedConstraints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Comprehensive Specs List Matrix */}
        <div className="my-4 rounded-xl bg-surface-container-low p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between font-body-sm text-body-sm py-1">
            <span className="text-on-surface-variant">Primary Spec / Capacity</span>
            <span className="font-mono-data font-semibold text-on-surface">
              {product.attributes.capacity}
            </span>
          </div>
          <div className="w-full h-px bg-surface-container-high" />
          <div className="flex items-center justify-between font-body-sm text-body-sm py-1">
            <span className="text-on-surface-variant">System / Architecture</span>
            <span className="font-mono-data font-semibold text-on-surface">
              {product.attributes.defrostType}
            </span>
          </div>
          <div className="w-full h-px bg-surface-container-high" />
          <div className="flex items-center justify-between font-body-sm text-body-sm py-1">
            <span className="text-on-surface-variant">Efficiency / Performance</span>
            <span className="font-mono-data font-semibold text-primary-container flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              {product.attributes.energyRating}
            </span>
          </div>
          <div className="w-full h-px bg-surface-container-high" />
          <div className="flex items-center justify-between font-body-sm text-body-sm py-1">
            <span className="text-on-surface-variant">Physical Dimensions</span>
            <span className="font-mono-data font-semibold text-on-surface">
              {product.attributes.dimensions}
            </span>
          </div>
          <div className="w-full h-px bg-surface-container-high" />
          <div className="flex items-center justify-between font-body-sm text-body-sm py-1">
            <span className="text-on-surface-variant">Exterior Finish</span>
            <span className="font-mono-data font-semibold text-on-surface">
              {product.attributes.finish}
            </span>
          </div>
        </div>

        {/* Displayed Target Catalog Price & State */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
          <div className="flex flex-col tabular-nums">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Target Catalog Price
            </span>
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              {formatINR(product.price)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest font-mono-data text-label-sm font-semibold text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Ready for Experiment
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onContinue}
            className="w-full h-12 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] group"
          >
            <span>{continueLabel}</span>
            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
          {onConfirmModal && (
            <button
              type="button"
              onClick={onConfirmModal}
              className="w-full py-2 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-low transition-colors text-center"
            >
              Skip Directly to Query Entry →
            </button>
          )}
          {onResetFilter && (
            <button
              type="button"
              onClick={onResetFilter}
              className="w-full py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors text-center"
            >
              Show All Catalog Items
            </button>
          )}
        </div>

        {/* Persistent Disclaimer Notice */}
        <div className="mt-4 pt-3 flex items-start gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] text-outline shrink-0 mt-0.5">
            lock_clock
          </span>
          <p className="font-body-sm text-body-sm text-outline leading-snug">
            Your target product is locked for this session. You can change it anytime before
            submitting results.
          </p>
        </div>
      </div>

      {/* Research Context Assistant Micro-Card */}
      <div className="w-full bg-surface-container-low rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[22px]">psychology</span>
        </div>
        <div className="flex flex-col">
          <span className="font-label-md text-label-md font-semibold text-on-surface">
            Research Protocol Tip
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            In Step 3, you will craft queries to see how accurately natural language search
            navigates directly to this reference.
          </span>
        </div>
      </div>
    </div>
  );
}

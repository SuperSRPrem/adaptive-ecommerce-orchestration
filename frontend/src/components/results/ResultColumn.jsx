import React from 'react';
import { formatINR } from '../../data/mockProducts';

export default function ResultColumn({ columnSlot, blindedMode }) {
  const { displayLabel, variantLabel, conditionId, data } = columnSlot;
  if (!data) return null;

  const isOrchestrated = conditionId === 'orchestrated';
  const isOptimized = conditionId === 'optimized';

  const containerStyle = blindedMode
    ? 'bg-surface-container-low/80'
    : isOrchestrated
    ? 'bg-secondary/5'
    : isOptimized
    ? 'bg-surface-container/40'
    : 'bg-surface-container-low/70';

  const headerAccentText = blindedMode
    ? 'text-primary'
    : isOrchestrated
    ? 'text-secondary-container'
    : isOptimized
    ? 'text-primary'
    : 'text-outline';

  const headerBadgeClasses = blindedMode
    ? 'bg-surface-container-high text-on-surface-variant'
    : isOrchestrated
    ? 'bg-secondary-container/15 text-secondary-container'
    : isOptimized
    ? 'bg-primary/10 text-primary'
    : 'bg-surface-container-high text-on-surface-variant';

  const targetRankText = data.metrics.targetRank
    ? `Target Pos: #${data.metrics.targetRank}`
    : 'Target: Not in Top 3';

  return (
    <div className={`flex flex-col gap-space-md p-space-md rounded-2xl ${containerStyle}`}>
      {/* Column Header */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`font-mono-data text-label-sm ${headerAccentText}`}>
            {blindedMode ? variantLabel.toUpperCase() : data.pipelineCode}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${headerBadgeClasses}`}
          >
            {blindedMode ? 'Blinded Condition' : data.conditionName}
          </span>
        </div>

        <h2 className="font-headline-sm text-headline-sm text-on-surface">{displayLabel}</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {blindedMode
            ? 'Condition identity hidden during blinded evaluation to prevent scoring bias.'
            : data.description}
        </p>

        <div className="mt-3 pt-3 flex items-center justify-between text-outline font-mono-data text-label-sm border-t border-surface-container-low">
          <span>
            {data.adapterMode === 'live'
              ? `Latency: ${data.executionTimeMs}ms`
              : `Demo Eval: ${data.executionTimeMs}ms`}
          </span>
          <span
            className={
              data.metrics.targetRank === 1
                ? 'text-primary font-bold'
                : 'text-on-surface-variant font-semibold'
            }
          >
            {targetRankText}
          </span>
        </div>
      </div>

      {/* Product Cards Stack */}
      <div className="flex flex-col gap-3">
        {data.results.map((item) => {
          const { rank, product, score, explanation, pipelineTag, matchedFacets, isTargetMatch } =
            item;

          return (
            <div
              key={`${conditionId}-${product.id}`}
              className={`bg-surface-container-lowest p-space-md rounded-xl transition-shadow relative overflow-hidden ${
                isTargetMatch
                  ? 'shadow-md ring-1 ring-primary-container/40'
                  : 'shadow-sm hover:shadow-md'
              }`}
            >
              {isTargetMatch && (
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-secondary/10 text-secondary font-mono-data text-[10px] font-semibold rounded-bl">
                  Ground Truth
                </div>
              )}

              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-lg bg-surface-container-low shrink-0 overflow-hidden p-1.5 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 pr-14">
                    <span
                      className={`font-mono-data text-label-sm ${
                        rank === 1 ? 'text-primary font-bold' : 'text-outline'
                      }`}
                    >
                      Rank #{rank}
                    </span>

                    {isTargetMatch ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-label-sm text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Target Match (Rank #{rank})
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-container-high text-on-surface-variant font-mono-data">
                        {pipelineTag}
                      </span>
                    )}
                  </div>

                  <h3 className="font-label-lg text-label-lg text-on-surface font-semibold truncate mt-0.5">
                    {product.shortName || product.name}
                  </h3>

                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                    {product.attributes.finish} · {product.attributes.capacity} ·{' '}
                    {product.attributes.energyRating}
                  </p>

                  {/* Spec Tags or Coordinated Reasoning */}
                  {!blindedMode && isOrchestrated && rank === 1 && matchedFacets.length > 0 ? (
                    <div className="mt-2 p-2 rounded-lg bg-surface-container-low font-body-sm text-[12px] text-on-surface flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-secondary-container shrink-0 mt-0.5">
                        verified
                      </span>
                      <div className="leading-snug">
                        <strong className="font-semibold text-secondary-container">
                          Matched Intent:
                        </strong>{' '}
                        {matchedFacets.join(' · ')}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(product.specBadges || []).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono-data text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex items-baseline justify-between tabular-nums">
                    <div className="flex items-baseline gap-2">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        {formatINR(product.price)}
                      </span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="font-body-sm text-body-sm text-outline line-through">
                          {formatINR(product.mrp)}
                        </span>
                      )}
                    </div>
                    <span className="font-mono-data text-[11px] text-primary font-semibold">
                      Heuristic Score: {score.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-surface-container-low text-on-surface-variant font-body-sm text-[12px] flex items-center justify-between gap-2">
                <span className="truncate">{explanation}</span>
                <span className="font-mono-data text-outline shrink-0">{product.badgeLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

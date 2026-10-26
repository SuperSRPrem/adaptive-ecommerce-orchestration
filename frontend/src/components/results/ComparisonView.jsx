import React from 'react';
import ResultColumn from './ResultColumn';
import EvaluationMatrix from './EvaluationMatrix';

export default function ComparisonView({
  comparisonData,
  blindedMode,
  onToggleBlinded,
  onShuffleOrder,
  isRandomized,
}) {
  if (!comparisonData) return null;

  const { orderedColumns, targetProduct } = comparisonData;

  return (
    <div className="flex flex-col">
      {/* Researcher / Participant Blinded Mode Controls + Calculated Metric Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/30">
        <div className="flex items-center gap-2 font-mono-data text-label-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] text-primary">science</span>
          <span>
            <strong>Data Source:</strong> {comparisonData.adapterStatus?.label} · Metrics computed
            from top-3 retrieved items
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onToggleBlinded(!blindedMode)}
            className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm flex items-center gap-1.5 transition-colors ${
              blindedMode
                ? 'bg-secondary-container text-on-secondary-container font-semibold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {blindedMode ? 'visibility_off' : 'visibility'}
            </span>
            <span>{blindedMode ? 'Blinded View Active' : 'Researcher View (Unblinded)'}</span>
          </button>

          <button
            type="button"
            onClick={() => onShuffleOrder(!isRandomized)}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">shuffle</span>
            <span>{isRandomized ? 'Reset Column Order (A/B/C)' : 'Randomize Column Order'}</span>
          </button>
        </div>
      </div>

      {/* Comparative Visual Metric Bar (Computed from actual results) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-6">
        {orderedColumns.map((col) => {
          const { metrics } = col.data;
          const dotColor = blindedMode
            ? 'bg-primary'
            : col.conditionId === 'orchestrated'
            ? 'bg-secondary-container'
            : col.conditionId === 'optimized'
            ? 'bg-primary'
            : 'bg-outline';

          const textColor = blindedMode
            ? 'text-on-surface'
            : col.conditionId === 'orchestrated'
            ? 'text-secondary-container'
            : col.conditionId === 'optimized'
            ? 'text-primary'
            : 'text-on-surface';

          return (
            <div
              key={col.shortCode}
              className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex items-center justify-between tabular-nums"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                <span className="font-label-md text-label-md text-on-surface-variant">
                  {blindedMode
                    ? `${col.displayLabel} Top-3 Attr Match:`
                    : `${col.data.conditionName} Attr Match:`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono-data text-headline-sm font-semibold ${textColor}`}>
                  {metrics.attributeMatchRate}%
                </span>
                <span className="text-outline font-label-sm text-label-sm">
                  ({metrics.targetRank ? `Target #${metrics.targetRank}` : 'Unranked'})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Three-Column Comparison Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
        {orderedColumns.map((colSlot) => (
          <ResultColumn
            key={colSlot.shortCode}
            columnSlot={colSlot}
            blindedMode={blindedMode}
          />
        ))}
      </div>

      {/* Orchestration Metric Breakdown Matrix */}
      <EvaluationMatrix
        orderedColumns={orderedColumns}
        targetProduct={targetProduct}
        blindedMode={blindedMode}
      />
    </div>
  );
}

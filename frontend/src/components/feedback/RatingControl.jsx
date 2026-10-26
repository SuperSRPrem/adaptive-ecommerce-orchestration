import React from 'react';

const METRIC_ROWS = [
  { key: 'intentAlignment', label: 'Intent Alignment' },
  { key: 'easeOfFinding', label: 'Ease of Finding Product' },
  { key: 'likelihoodOfReturn', label: 'Likelihood of Return' },
];

export default function RatingControl({
  columnSlot,
  ratings,
  onRateMetric,
  blindedMode,
  targetRank,
  attributeMatchRate,
}) {
  const { displayLabel, variantLabel, conditionId } = columnSlot;
  const currentRatings = ratings || {
    overallSatisfaction: null,
    intentAlignment: null,
    easeOfFinding: null,
    likelihoodOfReturn: null,
  };

  const conditionTitles = {
    baseline: {
      title: 'Baseline Search',
      subtitle: 'Standard lexical keyword parsing',
      icon: 'keyboard',
    },
    optimized: {
      title: 'Optimized Search',
      subtitle: 'Synonym expansion & attribute vectors',
      icon: 'neurology',
    },
    orchestrated: {
      title: 'Optimized + Orchestrated',
      subtitle: 'Multi-step intent & facet routing',
      icon: 'auto_awesome',
    },
  };

  const meta = conditionTitles[conditionId] || conditionTitles.baseline;

  return (
    <div className="flex flex-col rounded-xl bg-surface-container-low p-space-md relative overflow-hidden shadow-sm">
      <div className="flex items-center justify-between pb-space-sm mb-space-sm">
        <div>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono-data text-[10px] uppercase font-bold tracking-wider">
            {variantLabel}
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
            {blindedMode ? displayLabel : `${displayLabel} (${meta.title})`}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {blindedMode ? 'Rate this search experience independently' : meta.subtitle}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[18px]">{meta.icon}</span>
        </div>
      </div>

      {/* Metric 1: Overall Satisfaction (Star Rating, starts unselected) */}
      <div className="bg-surface-container-lowest rounded-lg p-space-sm mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-label-md text-label-md text-on-surface">Overall Satisfaction</span>
          <span className="font-mono-data text-label-sm text-primary font-bold tabular-nums">
            {currentRatings.overallSatisfaction
              ? `${currentRatings.overallSatisfaction}.0 / 5.0`
              : 'Not rated'}
          </span>
        </div>
        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-label={`${displayLabel} Overall Satisfaction`}
        >
          {[1, 2, 3, 4, 5].map((starVal) => {
            const filled =
              currentRatings.overallSatisfaction !== null &&
              starVal <= currentRatings.overallSatisfaction;
            return (
              <button
                key={starVal}
                type="button"
                aria-label={`Rate ${starVal} out of 5 stars`}
                aria-pressed={currentRatings.overallSatisfaction === starVal}
                onClick={() => onRateMetric(conditionId, 'overallSatisfaction', starVal)}
                className={`material-symbols-outlined text-[24px] hover:scale-110 transition-transform ${
                  filled ? 'material-symbols-filled text-[#F59E0B]' : 'text-outline-variant'
                }`}
              >
                star
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics 2, 3, 4: 1–5 Button Scales (start unselected) */}
      {METRIC_ROWS.map((row) => {
        const currentVal = currentRatings[row.key];
        return (
          <div
            key={row.key}
            className="bg-surface-container-lowest rounded-lg p-space-sm mb-3 last:mb-0"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-on-surface">{row.label}</span>
              <span className="font-mono-data text-label-sm text-on-surface font-semibold tabular-nums">
                {currentVal ? `${currentVal} / 5` : 'Select 1–5'}
              </span>
            </div>
            <div
              className="grid grid-cols-5 gap-1.5"
              role="radiogroup"
              aria-label={`${displayLabel} ${row.label}`}
            >
              {[1, 2, 3, 4, 5].map((scoreVal) => {
                const isSelected = currentVal === scoreVal;
                return (
                  <button
                    key={scoreVal}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onRateMetric(conditionId, row.key, scoreVal)}
                    className={
                      isSelected
                        ? 'h-8 rounded bg-primary-container text-on-primary font-mono-data text-label-sm font-bold shadow-sm transition-colors'
                        : 'h-8 rounded bg-surface-container-high text-on-surface font-mono-data text-label-sm hover:bg-primary-container hover:text-on-primary transition-colors'
                    }
                  >
                    {scoreVal}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Actual observed session rank & overlap instead of hardcoded fake latency */}
      <div className="mt-4 pt-2 text-[11px] font-mono-data text-on-surface-variant flex items-center justify-between tabular-nums">
        <span>{targetRank ? `Session Target Rank: #${targetRank}` : 'Target Rank: Unranked'}</span>
        <span>
          {typeof attributeMatchRate === 'number'
            ? `Attr Overlap: ${attributeMatchRate}%`
            : 'Session Evaluated'}
        </span>
      </div>
    </div>
  );
}

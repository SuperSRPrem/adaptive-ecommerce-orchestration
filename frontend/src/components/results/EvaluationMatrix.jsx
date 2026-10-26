import React from 'react';

export default function EvaluationMatrix({ orderedColumns, targetProduct, blindedMode }) {
  if (!orderedColumns || orderedColumns.length === 0) return null;

  const targetColor = targetProduct?.attributes?.color || 'White';

  const describeTargetFound = (col) => {
    const rank = col.data.metrics.targetRank;
    if (!rank) return 'Not in Catalog Pool';
    if (rank === 1) {
      return col.conditionId === 'orchestrated' && !blindedMode
        ? 'Yes (Rank #1 + Facet Verified)'
        : 'Yes (Rank #1)';
    }
    return `Yes (Rank #${rank})`;
  };

  const describeColorFidelity = (col) => {
    const count = col.data.metrics.colorMatchesCount;
    const total = col.data.metrics.topResultCount || 3;
    const colors = col.data.metrics.colorsInTop3.join(', ');
    if (count === total) {
      return `100% Match (${count}/${total} ${targetColor})`;
    }
    return `${count}/${total} ${targetColor} (${colors})`;
  };

  const describeAttributeMatch = (col) => {
    const rate = col.data.metrics.attributeMatchRate;
    const specs = col.data.results.map((r) => r.product.badgeLabel).join(', ');
    return `${rate}% Target Attribute Overlap (${specs})`;
  };

  const describeOrchestration = (col) => {
    if (blindedMode) {
      return 'Hidden in Blinded Mode';
    }
    if (col.conditionId === 'baseline') return 'Disabled (Lexical keyword match only)';
    if (col.conditionId === 'optimized') return 'Disabled (Synonym & attribute boosting only)';
    return 'Enabled (Intent routing & facet extraction)';
  };

  return (
    <div className="mt-space-lg bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-md">
        <div>
          <span className="font-mono-data text-label-sm text-outline uppercase tracking-wider">
            Evaluation Framework (Computed from Current Run)
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            System Performance Delta Audit
          </h3>
        </div>
        {!blindedMode && (
          <div className="flex items-center gap-4 text-on-surface-variant font-body-sm text-body-sm flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-surface-container-high" /> Baseline
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-primary-fixed-dim" /> Optimized
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-secondary-fixed" /> Orchestrated
            </div>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left font-body-sm text-body-sm">
          <thead>
            <tr className="text-outline font-label-md text-label-md uppercase tracking-wider bg-surface-container-low">
              <th className="py-3 px-4 rounded-l-lg">Relevance Dimension</th>
              {orderedColumns.map((col, idx) => (
                <th
                  key={col.shortCode}
                  className={`py-3 px-4 ${
                    idx === orderedColumns.length - 1 ? 'rounded-r-lg' : ''
                  }`}
                >
                  {col.displayLabel}
                  {!blindedMode && (
                    <span className="block text-[10px] text-primary font-mono-data">
                      {col.data.conditionName}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-on-surface">
            <tr className="bg-surface-container-lowest">
              <td className="py-3 px-4 font-semibold text-on-surface">
                Target Ground Truth Found
              </td>
              {orderedColumns.map((col) => (
                <td
                  key={col.shortCode}
                  className={`py-3 px-4 ${
                    col.data.metrics.targetRank === 1
                      ? 'text-primary font-semibold'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {describeTargetFound(col)}
                </td>
              ))}
            </tr>

            <tr className="bg-surface-container-low/40">
              <td className="py-3 px-4 font-semibold text-on-surface">
                Color Attribute Fidelity ({targetColor})
              </td>
              {orderedColumns.map((col) => (
                <td
                  key={col.shortCode}
                  className={`py-3 px-4 ${
                    col.data.metrics.colorMatchesCount === 3
                      ? 'text-primary font-medium'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {describeColorFidelity(col)}
                </td>
              ))}
            </tr>

            <tr className="bg-surface-container-lowest">
              <td className="py-3 px-4 font-semibold text-on-surface">
                Top-3 Target Attribute Overlap
              </td>
              {orderedColumns.map((col) => (
                <td key={col.shortCode} className="py-3 px-4 text-on-surface-variant">
                  {describeAttributeMatch(col)}
                </td>
              ))}
            </tr>

            <tr className="bg-surface-container-low/40">
              <td className="py-3 px-4 font-semibold text-on-surface">
                Orchestration &amp; Facet Reasoning
              </td>
              {orderedColumns.map((col) => (
                <td
                  key={col.shortCode}
                  className={`py-3 px-4 ${
                    col.conditionId === 'orchestrated' && !blindedMode
                      ? 'text-secondary-container font-semibold'
                      : 'text-outline'
                  }`}
                >
                  {describeOrchestration(col)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

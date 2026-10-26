import React, { useState } from 'react';
import { getCategoryById } from '../../data/categories';

export default function NaturalLanguageQuery({
  category,
  userQuery,
  parsedConstraints,
  onQueryChange,
  onRunComparison,
  isRunning,
  validationError,
}) {
  const [isListening, setIsListening] = useState(false);
  const categoryObj = getCategoryById(category);
  const suggestions = categoryObj.suggestedQueries || [];

  const handleVoiceSimulate = () => {
    if (isListening) return;
    setIsListening(true);
    setTimeout(() => {
      const sample = suggestions[0] || 'Find me a reliable white refrigerator within my budget';
      onQueryChange(sample);
      setIsListening(false);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onRunComparison();
    }
  };

  return (
    <div className="lg:col-span-8 flex flex-col gap-space-lg">
      {/* Header Text */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary-container" />
          <span className="font-mono-data text-label-sm uppercase tracking-wider text-on-surface-variant">
            Step 03 · Natural Query Formulation
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          Tell us what you want to find
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Enter a natural language search query as you naturally would on an online store. We will
          run this query across all three search engine pipelines simultaneously.
        </p>
      </div>

      {/* Interactive Search Container Card */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col gap-space-md relative">
        <div className="flex items-center justify-between">
          <label
            htmlFor="search-input-field"
            className="font-label-lg text-label-lg text-on-surface flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
            Enter your natural-language search query below
          </label>
          <div className="flex items-center gap-1.5 font-mono-data text-label-sm text-outline-variant tabular-nums">
            <span className="text-on-surface font-semibold" id="char-count">
              {parsedConstraints?.charCount || 0}
            </span>
            <span>/ 180 chars</span>
            <span className="text-outline-variant">·</span>
            <span className="text-primary font-semibold" id="token-est">
              ~{parsedConstraints?.estimatedTokens || 0} tokens
            </span>
          </div>
        </div>

        {/* High-Contrast Prominent Input Region */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline text-[24px] group-focus-within:text-primary transition-colors">
              manage_search
            </span>
          </div>
          <textarea
            id="search-input-field"
            rows={3}
            maxLength={180}
            value={userQuery}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`e.g. ${suggestions[0] || 'Describe the product, color, capacity, and budget you need...'}`}
            className={`w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm pl-12 pr-28 py-3.5 rounded-xl shadow-inner transition-all outline-none resize-none placeholder:text-outline-variant/60 ${
              validationError ? 'ring-2 ring-error bg-error-container/20' : 'focus:ring-2 focus:ring-primary/25'
            }`}
          />
          <div className="absolute right-3 top-3.5 flex items-center gap-1.5">
            <button
              id="voice-mic-btn"
              type="button"
              onClick={handleVoiceSimulate}
              title="Populate voice query example"
              className={`w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-all ${
                isListening ? 'text-error animate-pulse' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isListening ? 'radio_button_checked' : 'mic'}
              </span>
            </button>
            <button
              id="clear-input-btn"
              type="button"
              onClick={() => onQueryChange('')}
              title="Clear current query"
              className="w-9 h-9 rounded-lg bg-surface-container hover:bg-error-container text-on-surface-variant hover:text-on-error-container flex items-center justify-center transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {validationError && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* Suggested Queries (Instant Injection Pills) */}
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                tips_and_updates
              </span>
              Suggested Real-World Query Variations ({categoryObj.name}):
            </span>
            <span className="font-mono-data text-label-sm text-outline">Click pill to load</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map((suggestion, idx) => {
              const isSelected = userQuery.trim() === suggestion.trim();
              const dotColors = [
                'bg-primary',
                'bg-secondary-container',
                'bg-secondary',
                'bg-outline',
              ];
              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onQueryChange(suggestion)}
                  className={`query-pill text-left px-3.5 py-2 rounded-full font-body-sm text-body-sm transition-all shadow-sm flex items-center gap-2 group ${
                    isSelected
                      ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                      : 'bg-surface-container hover:bg-primary-fixed hover:text-on-primary-fixed text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      dotColors[idx % dotColors.length]
                    } group-hover:scale-125 transition-transform`}
                  />
                  <span>“{suggestion}”</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md pt-space-md border-t border-surface-container-high">
          <div className="flex items-center gap-2 font-mono-data text-label-sm text-on-surface-variant">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>3-Pipeline Comparison Engine Ready</span>
          </div>

          <button
            id="run-experiment-cta"
            type="button"
            disabled={isRunning}
            onClick={onRunComparison}
            className="relative group px-7 py-4 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-xl shadow-primary-container/25 hover:bg-primary transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[22px] group-hover:translate-x-0.5 transition-transform">
              {isRunning ? 'sync' : 'model_training'}
            </span>
            <span className="font-headline-sm text-headline-sm tracking-tight font-semibold">
              {isRunning ? 'Dispatching 3 Engines...' : 'Run Search & Compare Systems'}
            </span>
            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-surface-container-lowest/20 font-mono-data text-[11px] text-on-primary font-bold">
              ↵ Enter
            </kbd>
          </button>
        </div>
      </div>

      {/* Live Intent Parsing Telemetry Card (Computed from actual userQuery) */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[22px]">troubleshoot</span>
          </div>
          <div>
            <div className="font-label-lg text-label-lg text-on-surface">
              Live Intent Parsing Telemetry (Heuristic Parser)
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {parsedConstraints?.constraintCount > 0
                ? `Detected: ${parsedConstraints.constraintCount} Attribute Constraint${
                    parsedConstraints.constraintCount === 1 ? '' : 's'
                  } (${parsedConstraints.constraints.map((c) => c.type).join(', ')})`
                : 'No explicit attribute constraints detected yet — type color, brand, size, or budget terms.'}
            </p>
          </div>
        </div>

        {/* Dynamic Intent Tokens Preview */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono-data text-label-sm">
          {parsedConstraints?.constraints?.length > 0 ? (
            parsedConstraints.constraints.map((c) => (
              <span
                key={`${c.type}-${c.value}`}
                className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface flex items-center gap-1"
              >
                <span className="text-outline">{c.type}:</span>{' '}
                <span className="font-bold text-primary">{c.value}</span>
              </span>
            ))
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-surface-container-low text-outline">
              Awaiting query constraints...
            </span>
          )}
        </div>
      </div>

      {parsedConstraints?.hasContradictions && (
        <div
          role="status"
          className="bg-error-container/60 border border-error/30 text-on-error-container p-space-md rounded-xl flex items-start gap-3"
        >
          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">warning</span>
          <div className="space-y-1 font-body-sm text-body-sm">
            <div className="font-semibold">
              Contradictory Query Constraints Detected ({parsedConstraints.contradictions.length}):
            </div>
            <ul className="list-disc list-inside font-mono-data text-[12px]">
              {parsedConstraints.contradictions.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

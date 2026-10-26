import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useExperimentSession } from '../../hooks/useExperimentSession';
import { CheckCircle2, ChevronRight } from '../common/CategoryIcon';

export const EXPERIMENT_STAGES = [
  { step: 1, id: 'scenario', label: '1. Set Requirements', path: '/experiment' },
  { step: 2, id: 'query', label: '2. Formulate Query', path: '/query' },
  { step: 3, id: 'comparison', label: '3. Compare Systems', path: '/comparison' },
  { step: 4, id: 'feedback', label: '4. Participant Survey', path: '/feedback' },
];

export function getActiveStep(pathname) {
  if (
    pathname.startsWith('/experiment') ||
    pathname.startsWith('/specific-product') ||
    pathname.startsWith('/general-search') ||
    pathname.startsWith('/target-confirmation')
  ) {
    return 1;
  }
  if (pathname.startsWith('/query')) return 2;
  if (pathname.startsWith('/comparison')) return 3;
  if (pathname.startsWith('/feedback')) return 4;
  return 1;
}

export default function ProgressStepper({ compact = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useExperimentSession();
  const activeStep = getActiveStep(location.pathname);

  const handleStepClick = (stage) => {
    // Prevent navigating ahead of completed steps
    if (stage.step > activeStep && !session.searchResults && stage.step > 2) {
      return;
    }
    navigate(stage.path);
  };

  if (compact) {
    return (
      <nav
        aria-label="Experiment Progress Mobile"
        className="w-full bg-slate-100/90 border-t border-slate-200/80 px-4 py-2 flex items-center justify-between text-xs overflow-x-auto scrollbar-none"
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono font-semibold text-primary">
            Step {activeStep} of 4:
          </span>
          <span className="font-medium text-slate-800">
            {EXPERIMENT_STAGES[activeStep - 1]?.label.replace(/^\d\.\s*/, '')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {EXPERIMENT_STAGES.map((stage) => {
            const isCompleted = stage.step < activeStep;
            const isCurrent = stage.step === activeStep;
            return (
              <span
                key={stage.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  isCurrent
                    ? 'bg-primary w-5'
                    : isCompleted
                    ? 'bg-emerald-500'
                    : 'bg-slate-300'
                }`}
              />
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Human Evaluation Progress"
      className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
    >
      {EXPERIMENT_STAGES.map((stage, idx) => {
        const isCompleted = stage.step < activeStep;
        const isCurrent = stage.step === activeStep;
        const isClickable = stage.step <= activeStep || (stage.step === 3 && session.searchResults);

        return (
          <React.Fragment key={stage.id}>
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => handleStepClick(stage)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isCurrent
                  ? 'bg-primary text-white font-semibold shadow-2xs'
                  : isCompleted
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 size={13} className="text-emerald-600" />
              ) : (
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[10px] ${
                    isCurrent ? 'bg-white text-primary font-bold' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {stage.step}
                </span>
              )}
              <span>{stage.label}</span>
            </button>
            {idx < EXPERIMENT_STAGES.length - 1 && (
              <ChevronRight size={12} className="text-slate-300 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

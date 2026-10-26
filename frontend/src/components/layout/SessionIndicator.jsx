import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperimentSession } from '../../hooks/useExperimentSession';
import { RefreshCw, ShieldCheck, XCircle, ChevronRight, Lock } from '../common/CategoryIcon';

export default function SessionIndicator() {
  const { session, resetSession, showToast } = useExperimentSession();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    resetSession();
    setIsOpen(false);
    showToast('New anonymous session initialized.', 'info');
    navigate('/experiment');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Participant Session Identity"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-mono text-xs transition-colors border border-slate-200"
      >
        <ShieldCheck size={13} className="text-primary" />
        <span className="font-semibold">{session.sessionId}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-11 w-80 rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              <span className="font-semibold text-slate-900 text-sm">Participant Session</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <XCircle size={16} />
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Session ID:</span>
              <span className="font-bold text-slate-900">{session.sessionId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Consent Status:</span>
              <span className={session.consentGiven ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                {session.consentGiven ? 'Granted' : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Current Task:</span>
              <span className="font-semibold text-slate-800 capitalize">
                {session.searchType} Search
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Target Category:</span>
              <span className="font-semibold text-slate-800 capitalize">
                {session.category}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Tasks Logged:</span>
              <span className="font-bold text-primary">
                {session.tasksLog?.length || 0} trial(s)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Reset &amp; Start Fresh Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

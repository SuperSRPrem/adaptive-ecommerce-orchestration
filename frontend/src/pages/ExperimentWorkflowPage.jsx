import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useExperimentSession } from '../hooks/useExperimentSession';
import { CATEGORIES, getCategoryById, formatINR } from '../data/categories';
import ProductSpecificationBuilder from '../components/experiment/ProductSpecificationBuilder';
import {
  CategoryIcon,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Lock,
  Layers,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from '../components/common/CategoryIcon';

export default function ExperimentWorkflowPage() {
  const navigate = useNavigate();
  const {
    session,
    scenarios,
    scenariosLoading,
    scenariosError,
    grantConsent,
    selectScenario,
    setDynamicSpecification,
    setSearchType,
    setCategory,
    showToast,
  } = useExperimentSession();

  const [hasConsented, setHasConsented] = useState(session.consentGiven);
  const [showLegacyMode, setShowLegacyMode] = useState(false);

  const activeCategoryObj = getCategoryById(session.category);
  const currentPool =
    session.searchType === 'general' ? scenarios.general : scenarios.specific;
  const filteredScenarios = currentPool.filter((s) => s.category === session.category);

  const handleConsentSubmit = async () => {
    await grantConsent();
    setHasConsented(true);
    showToast('Informed consent acknowledged. Participant session registered.', 'success');
  };

  const handleConfirmSpecification = (specs) => {
    setDynamicSpecification(specs);
    showToast('Product specifications locked. Proceeding to query formulation...', 'success');
    navigate('/query');
  };

  const handleTaskTypeSwitch = (type) => {
    setSearchType(type);
  };

  const handleCategorySwitch = (catId) => {
    setCategory(catId);
  };

  const handleSelectScenario = (scenario) => {
    selectScenario(scenario);
    showToast(`Predefined scenario selected (${activeCategoryObj.name}).`, 'info');
  };

  const handleProceedWithScenario = () => {
    if (!session.activeScenario) {
      showToast('Please select a task scenario first.', 'error');
      return;
    }
    navigate('/query');
  };

  // STEP 1: Participant Information and Informed Consent Screen
  if (!hasConsented) {
    return (
      <div className="w-full max-w-[960px] mx-auto px-4 sm:px-8 py-10">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100">
              <FlaskConical size={24} />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                Human-Evaluation Research Study
              </span>
              <h1 className="text-2xl font-bold text-slate-950 mt-0.5">
                Participant Information &amp; Consent
              </h1>
            </div>
          </div>

          <div className="prose prose-slate text-sm text-slate-600 leading-relaxed space-y-3 pt-2 border-t border-slate-100">
            <p>
              You are invited to take part in an academic research experiment evaluating product discovery and stockout recovery algorithms in e-commerce search.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 font-normal">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-primary" />
                  <span>Anonymous Session</span>
                </div>
                <p className="text-xs text-slate-500">
                  You are identified only by a randomized session ID ({session.sessionId}). We do NOT collect names, email addresses, student IDs, or IP addresses.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Info size={16} className="text-primary" />
                  <span>Duration &amp; Procedure</span>
                </div>
                <p className="text-xs text-slate-500">
                  Takes approximately 5–8 minutes. You will define product requirements, formulate a natural search query, inspect 3 blinded search systems, and complete a feedback survey.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="font-semibold text-slate-800 text-sm">What will be recorded:</div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Your chosen category and target requirements (budget, RAM, storage, screen size, color, brand).</li>
                <li>The natural language query you formulate.</li>
                <li>The retrieved ranking positions of catalog items across the three search systems.</li>
                <li>Your subjective questionnaire responses (relevance, diversity, satisfaction, confidence).</li>
              </ul>
            </div>

            <p className="text-xs text-slate-500 pt-1">
              <strong>Voluntary Participation:</strong> Your participation is completely voluntary. You may decline or stop at any time by closing this tab or clicking Reset Session.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Return to Project Overview
            </Link>

            <button
              type="button"
              onClick={handleConsentSubmit}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-primary hover:bg-blue-800 text-white font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>I Understand &amp; Agree to Participate</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Main Dynamic Product Specification Builder Screen
  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold uppercase tracking-wider mb-1">
            <span>Stage 01</span>
            <span>·</span>
            <span>Product Specification Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
            Define Your Target Product Specifications
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Choose a product domain and customize your requirements (budget, specs, colors, brands).
            These specifications will serve as your hidden reference target while you formulate a natural query.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 self-start md:self-auto shadow-2xs">
          <ShieldCheck size={14} className="text-primary" />
          <span>Participant: {session.sessionId}</span>
        </div>
      </div>

      {/* Primary: Dynamic Specification Builder */}
      <ProductSpecificationBuilder
        initialCategory={session.category || 'laptop'}
        onConfirmSpecification={handleConfirmSpecification}
      />

      {/* Secondary / Advanced: Researcher Predefined Scenario Calibration (Collapsible) */}
      <div className="mt-4 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setShowLegacyMode(!showLegacyMode)}
          className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={16} className="text-slate-500" />
            <div>
              <span className="text-xs font-bold text-slate-800">
                Researcher Calibration Mode: Select from Predefined Static Scenarios
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Use fixed benchmark scenarios from scenarios.json for reproducible algorithm verification.
              </p>
            </div>
          </div>
          <div className="text-slate-400">
            {showLegacyMode ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {showLegacyMode && (
          <div className="mt-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Predefined Benchmark Scenario Library
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controlled tasks from the research paper evaluation suite.
                </p>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Category: {activeCategoryObj.name}
              </div>
            </div>

            {/* Task Type Switcher */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTaskTypeSwitch('specific')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  session.searchType === 'specific'
                    ? 'bg-blue-50/70 border-primary ring-2 ring-primary/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Specific Product Discovery</span>
                  {session.searchType === 'specific' && <CheckCircle2 size={14} className="text-primary" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">Exact SKU / Title discovery benchmark</p>
              </button>

              <button
                type="button"
                onClick={() => handleTaskTypeSwitch('general')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  session.searchType === 'general'
                    ? 'bg-blue-50/70 border-primary ring-2 ring-primary/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">General Constraint Search</span>
                  {session.searchType === 'general' && <CheckCircle2 size={14} className="text-primary" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">Multi-attribute constraint satisfaction benchmark</p>
              </button>
            </div>

            {/* Category pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = session.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySwitch(cat.id)}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <CategoryIcon category={cat.id} size={16} />
                    <span className="text-xs font-semibold">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Scenarios Stream */}
            {scenariosLoading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading benchmark scenarios...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredScenarios.map((sc, idx) => {
                  const isSelected = session.activeScenario?.id === sc.id;
                  return (
                    <div
                      key={sc.id}
                      onClick={() => handleSelectScenario(sc)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/70 border-primary ring-2 ring-primary/20'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Scenario #{idx + 1}</span>
                        {isSelected && <span className="text-primary font-bold">Selected</span>}
                      </div>
                      <div className="font-semibold text-xs text-slate-900 mt-1 line-clamp-2">
                        {sc.search_type === 'specific' ? sc.target_product_title : sc.description || `Constraint Task ${sc.id}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!session.activeScenario}
                onClick={handleProceedWithScenario}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-2"
              >
                <span>Proceed with Selected Scenario</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import WelcomePage from '../pages/WelcomePage';
import ProductDiscoveryPage from '../pages/ProductDiscoveryPage';
import ExperimentWorkflowPage from '../pages/ExperimentWorkflowPage';
import BenchmarksPage from '../pages/BenchmarksPage';
import ResearcherPage from '../pages/ResearcherPage';
import QueryPage from '../pages/QueryPage';
import ComparisonPage from '../pages/ComparisonPage';
import FeedbackPage from '../pages/FeedbackPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Main Hub & Research Landing Page */}
        <Route path="/" element={<WelcomePage />} />

        {/* Live Product Discovery Engine */}
        <Route path="/discover" element={<ProductDiscoveryPage />} />

        {/* Guided Human Evaluation Workflow (Informed Consent -> Scenario Selection) */}
        <Route path="/experiment" element={<ExperimentWorkflowPage />} />

        {/* Step 2: Formulate Search Query */}
        <Route path="/query" element={<QueryPage />} />

        {/* Step 3: Blinded 3-Way Search Comparison */}
        <Route path="/comparison" element={<ComparisonPage />} />

        {/* Step 4: 9-Dimension Likert Questionnaire & Submission */}
        <Route path="/feedback" element={<FeedbackPage />} />

        {/* Empirical Benchmarks (173 ESCI queries, 9-case stockout study) */}
        <Route path="/benchmarks" element={<BenchmarksPage />} />

        {/* Researcher Diagnostic Inspector & Live SQLite Data Export */}
        <Route path="/researcher" element={<ResearcherPage />} />

        {/* Legacy route compatibility: redirect seamlessly to the guided experiment workflow */}
        <Route path="/specific-product" element={<Navigate to="/experiment" replace />} />
        <Route path="/general-search" element={<Navigate to="/experiment" replace />} />
        <Route path="/target-confirmation" element={<Navigate to="/experiment" replace />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

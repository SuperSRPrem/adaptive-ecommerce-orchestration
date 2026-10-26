import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ExperimentSessionProvider } from '../hooks/useExperimentSession';
import AppShell from '../components/layout/AppShell';
import AppRoutes from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <ExperimentSessionProvider>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </ExperimentSessionProvider>
    </BrowserRouter>
  );
}

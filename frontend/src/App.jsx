import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import UploadPage from './pages/UploadPage';
import BatchesPage from './pages/BatchesPage';
import BatchDetailsPage from './pages/BatchDetailsPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import SearchPage from './pages/SearchPage';
import ValidationPage from './pages/ValidationPage';
import CorrectionPage from './pages/CorrectionPage';
import ComparisonPage from './pages/ComparisonPage';
import SchedulerPage from './pages/SchedulerPage';
import HelpPage from './pages/HelpPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#0ea5e9',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/upload" replace />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="batches" element={<BatchesPage />} />
          <Route path="batches/:batchId" element={<BatchDetailsPage />} />
          <Route path="batches/:batchId/validation" element={<ValidationPage />} />
          <Route path="batches/:batchId/corrections" element={<CorrectionPage />} />
          <Route path="analytics" element={<AnalyticsDashboardPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="comparison" element={<ComparisonPage />} />
          <Route path="scheduler" element={<SchedulerPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

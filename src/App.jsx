import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ListingsPage } from './pages/ListingsPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { RentalsPage } from './pages/RentalsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SavedListingsPage } from './pages/SavedListingsPage';
import { InsightsPage } from './pages/InsightsPage';
import { ApiTrustReportPage } from './pages/ApiTrustReportPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ErrorBoundary><Layout /></ErrorBoundary>}>
          <Route index element={<ListingsPage />} />
          <Route path="listings" element={<ListingsPage />} />
          <Route path="listings/:listingId" element={<ListingDetailPage />} />
          <Route path="listing/:id" element={<ListingDetailPage />} />
          <Route path="rentals" element={<RentalsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="saved" element={<SavedListingsPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="api-trust-report" element={<ApiTrustReportPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { PublicShell } from './components/layout/PublicShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlayersPage } from './pages/PlayersPage';
import { MatchesPage } from './pages/MatchesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { HomePage } from './pages/HomePage';
import { SquadPage } from './pages/SquadPage';
import { FixturesPage } from './pages/FixturesPage';
import { ContributionsPage } from './pages/ContributionsPage';

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slateNight-950 text-white">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicShell>
            <HomePage />
          </PublicShell>
        }
      />
      <Route
        path="/squad"
        element={
          <PublicShell>
            <SquadPage />
          </PublicShell>
        }
      />
      <Route
        path="/fixtures"
        element={
          <PublicShell>
            <FixturesPage />
          </PublicShell>
        }
      />
      <Route
        path="/contributions"
        element={
          <PublicShell>
            <ContributionsPage />
          </PublicShell>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route index element={<DashboardPage />} />
                <Route path="players" element={<PlayersPage />} />
                <Route path="matches" element={<MatchesPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

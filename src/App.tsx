import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { LoginPage } from '@/features/auth/LoginPage';
import { AuthCallback } from '@/features/auth/AuthCallback';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ClientsPage } from '@/features/clients/ClientsPage';
import { ClientProfilePage } from '@/features/profile/ClientProfilePage';
import { RemindersPage } from '@/features/reminders/RemindersPage';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected */}
      <Route
        path="/*"
        element={
          <AuthGuard>
            <AppLayout>
              <Routes>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="clients/:id" element={<ClientProfilePage />} />
                <Route path="reminders" element={<RemindersPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppLayout>
          </AuthGuard>
        }
      />
    </Routes>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.tsx';

// Public & Landing Pages
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/Auth/LoginPage.tsx';
import { SignupPage } from './pages/Auth/SignupPage.tsx';
import { DesignSystemPage } from './pages/DesignSystemPage.tsx';

// 7 Application Screens
import { DashboardPage } from './pages/Dashboard/DashboardPage.tsx';
import { NewDiagnosisPage } from './pages/NewDiagnosis/NewDiagnosisPage.tsx';
import { IncidentDetailsPage } from './pages/IncidentDetails/IncidentDetailsPage.tsx';
import { AgentMonitorPage } from './pages/AgentMonitor/AgentMonitorPage.tsx';
import { DiagnosisReportPage } from './pages/DiagnosisReport/DiagnosisReportPage.tsx';
import { IncidentHistoryPage } from './pages/IncidentHistory/IncidentHistoryPage.tsx';
import { InteropLabPage } from './pages/InteropLab/InteropLabPage.tsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />

          {/* 7 Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-diagnosis"
            element={
              <ProtectedRoute>
                <NewDiagnosisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incident-details"
            element={
              <ProtectedRoute>
                <IncidentDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent-monitor"
            element={
              <ProtectedRoute>
                <AgentMonitorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagnosis-report"
            element={
              <ProtectedRoute>
                <DiagnosisReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incident-history"
            element={
              <ProtectedRoute>
                <IncidentHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interop-lab"
            element={
              <ProtectedRoute>
                <InteropLabPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

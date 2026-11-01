import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TopologyPage } from './pages/TopologyPage';
import { DevicesPage } from './pages/DevicesPage';
import { AgentsPage } from './pages/AgentsPage';
import { TelemetryPage } from './pages/TelemetryPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { RunDiagnosisPage } from './pages/RunDiagnosisPage';
import { DiagnosisResultPage } from './pages/DiagnosisResultPage';
import { ReportsPage } from './pages/ReportsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Phase 1: Premium Cinematic 3D Landing Portal */}
        <Route path="/" element={<LandingPage />} />

        {/* Phase 2: 3D Network Operations Command Center & Intelligence */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="diagnosis" element={<RunDiagnosisPage />} />
          <Route path="diagnosis/:id" element={<DiagnosisResultPage />} />
          <Route path="topology" element={<TopologyPage />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="telemetry" element={<TelemetryPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback to Landing Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

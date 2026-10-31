import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.tsx';
import { DesignSystemPage } from './pages/DesignSystemPage.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Phase 2: Cinematic 3D Landing Page at Root */}
        <Route path="/" element={<LandingPage />} />

        {/* Phase 1: Design System & 3D Environment Preview */}
        <Route path="/design-system" element={<DesignSystemPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

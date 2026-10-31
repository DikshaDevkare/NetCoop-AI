import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DesignSystemPage } from './pages/DesignSystemPage.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/design-system" element={<DesignSystemPage />} />
        {/* In Phase 1, the root route seamlessly showcases the design system foundation */}
        <Route path="/" element={<Navigate to="/design-system" replace />} />
        <Route path="*" element={<Navigate to="/design-system" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

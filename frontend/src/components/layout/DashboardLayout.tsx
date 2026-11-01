import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { GlobalEarthBackground3D } from '../../scenes3d/GlobalEarthBackground3D';
import { useDashboardStore } from '../../store/useDashboardStore';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { fetchData, isLiveBackend } = useDashboardStore();

  useEffect(() => {
    // Initial data fetch on dashboard entry
    fetchData();
  }, [fetchData]);

  return (
    <div className="relative min-h-screen bg-[#05080D] text-[#F4F6FA] flex overflow-x-hidden">
      {/* --- RESTORED 3D EARTH / NETWORK GLOBE BACKGROUND (LAYER 2 & 3) --- */}
      <GlobalEarthBackground3D
        opacity={0.48}
        positionOffset={[2.4, -0.4, -3.2]}
        scale={1.15}
      />

      {/* --- SIDEBAR NAVIGATION (LAYER 5) --- */}
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* --- MAIN WORKSPACE COLUMN (LAYER 4 & 5) --- */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Topbar onToggleMobileMenu={() => setMobileOpen(true)} />

        {/* Demo Mode Notice Banner when Backend is Offline */}
        {!isLiveBackend && (
          <div className="bg-[#FF8A24]/10 border-b border-[#FF8A24]/20 px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-mono text-[#FFB45C]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FF8A24] shrink-0" />
              <span>
                <strong>DEMO FALLBACK DATA ACTIVE:</strong> Backend offline at{' '}
                <code>http://127.0.0.1:8000</code>. Displaying simulated campus network
                observations. All interactions are fully operational.
              </span>
            </div>
            <button
              onClick={() => fetchData()}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FF8A24]/20 hover:bg-[#FF8A24]/30 text-[#FF8A24] text-[11px] font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Backend</span>
            </button>
          </div>
        )}

        {/* Dynamic Nested Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

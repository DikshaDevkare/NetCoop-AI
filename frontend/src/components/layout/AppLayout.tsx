import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar.tsx';
import { AppHeader } from './AppHeader.tsx';
import { checkBackendHealth } from '../../services/healthService.ts';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{ connected: boolean; version?: string }>({
    connected: false,
  });

  useEffect(() => {
    checkBackendHealth().then((res) => {
      if (res.connected && res.data) {
        setBackendStatus({ connected: true, version: res.data.version });
      }
    });
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#08090D',
        color: '#F5F5F7',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Atmospheric Background Glows */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '420px',
          background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(168, 85, 247, 0.16) 0%, rgba(255, 122, 24, 0.08) 50%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle at 100% 100%, rgba(255, 122, 24, 0.1) 0%, rgba(168, 85, 247, 0.06) 50%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Left Navigation Sidebar */}
      <AppSidebar
        backendConnected={backendStatus.connected}
        backendVersion={backendStatus.version}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        <AppHeader
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main style={{ flex: 1, padding: '24px 28px', maxWidth: '1600px', width: '100%', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

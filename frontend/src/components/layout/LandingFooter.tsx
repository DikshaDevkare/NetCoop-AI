import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(8, 9, 13, 0.95)',
        padding: '60px 24px 40px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}
      >
        {/* Col 1: Brand & Tagline */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #FF9436, #FF7A18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 0 14px rgba(255, 122, 24, 0.5)',
              }}
            >
              <Activity size={18} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#F5F5F7' }}>
              NetCoop <span style={{ color: '#FF7A18' }}>AI</span>
            </span>
          </div>

          <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#A3A6B3', maxWidth: '300px', marginBottom: '16px' }}>
            Agentic AI-powered network fault diagnosis and interoperability platform for autonomous infrastructure resilience.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#10B981',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
            <span>● 5-Agent Consensus Active</span>
          </div>
        </div>

        {/* Col 2: Platform Modules */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7', marginBottom: '16px', letterSpacing: '0.02em' }}>
            Application Modules
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <a href="#capabilities" style={{ color: '#A3A6B3', textDecoration: 'none', fontSize: '13px' }}>
                01. Network Command Centre
              </a>
            </li>
            <li>
              <a href="#how-it-works" style={{ color: '#A3A6B3', textDecoration: 'none', fontSize: '13px' }}>
                02. New Diagnosis Setup
              </a>
            </li>
            <li>
              <a href="#capabilities" style={{ color: '#A3A6B3', textDecoration: 'none', fontSize: '13px' }}>
                03. Incident Details & Topology
              </a>
            </li>
            <li>
              <a href="#architecture" style={{ color: '#A3A6B3', textDecoration: 'none', fontSize: '13px' }}>
                04. Multi-Agent Orchestration
              </a>
            </li>
            <li>
              <a href="#how-it-works" style={{ color: '#A3A6B3', textDecoration: 'none', fontSize: '13px' }}>
                05. Diagnosis Report & Evidence
              </a>
            </li>
            <li>
              <a href="#capabilities" style={{ color: '#A3A6B3', textDecoration: 'none', fontSize: '13px' }}>
                06. Interoperability Lab
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Architecture & 3D */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7', marginBottom: '16px', letterSpacing: '0.02em' }}>
            Engineering Architecture
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <Link to="/design-system" style={{ color: '#A3A6B3', textDecoration: 'none', fontSize: '13px' }}>
                Obsidian Ember Tokens
              </Link>
            </li>
            <li>
              <Link to="/design-system#cards" style={{ color: '#A3A6B3', textDecoration: 'none', fontSize: '13px' }}>
                Smoked Glass Cards
              </Link>
            </li>
            <li>
              <Link to="/design-system#3d-environment" style={{ color: '#A3A6B3', textDecoration: 'none', fontSize: '13px' }}>
                Three.js WebGL Engine
              </Link>
            </li>
            <li>
              <Link to="/design-system#metrics" style={{ color: '#A3A6B3', textDecoration: 'none', fontSize: '13px' }}>
                Live Telemetry Gauges
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Tech Stack Specification */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7', marginBottom: '16px', letterSpacing: '0.02em' }}>
            Technology Stack
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#A3A6B3' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#FF7A18' }}>●</span>
              <span>React 19 + TypeScript 5.8</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#38D9FF' }}>●</span>
              <span>React Three Fiber 9 & Drei 10</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#A855F7' }}>●</span>
              <span>Framer Motion 14</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#FFB347' }}>●</span>
              <span>Vite 8 Lightning Bundler</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '12px',
          color: '#6A6D7C',
        }}
      >
        <div>© 2026 NetCoop AI • Autonomous Multi-Agent Network Diagnosis Platform</div>
        <div style={{ display: 'flex', gap: '18px' }}>
          <span>Phase 2 Live: Cinematic 3D Landing Page</span>
          <span>Theme: Obsidian Ember</span>
        </div>
      </div>
    </footer>
  );
}

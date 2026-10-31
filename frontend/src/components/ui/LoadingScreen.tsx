import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import type { LoadingScreenProps } from '../../types/components.types.ts';

export function LoadingScreen({
  message = 'Synchronizing Multi-Agent Telemetry...',
  subtext = 'Connecting to NetCoop neural routing fabric',
  progress,
  fullScreen = true,
}: LoadingScreenProps) {
  const containerStyle: CSSProperties = fullScreen
    ? {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'radial-gradient(circle at center, #11131A 0%, #08090D 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }
    : {
        width: '100%',
        minHeight: '260px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        background: 'rgba(25, 28, 38, 0.5)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      };

  return (
    <div style={containerStyle} className="loading-screen">
      {/* Multi-ring orbital ember loader */}
      <div style={{ position: 'relative', width: '84px', height: '84px', marginBottom: '24px' }}>
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(255, 122, 24, 0.2)',
            borderTopColor: '#FF7A18',
            boxShadow: '0 0 16px rgba(255, 122, 24, 0.4)',
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
        <motion.div
          style={{
            position: 'absolute',
            inset: '10px',
            borderRadius: '50%',
            border: '2px solid rgba(255, 179, 71, 0.2)',
            borderBottomColor: '#FFB347',
          }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
        />
        <motion.div
          style={{
            position: 'absolute',
            inset: '22px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #FFB347 0%, #FF7A18 70%, transparent 100%)',
            boxShadow: '0 0 20px #FF7A18',
          }}
          animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      </div>

      <h3
        style={{
          fontSize: '17px',
          fontWeight: 600,
          color: '#F5F5F7',
          letterSpacing: '-0.01em',
          marginBottom: '6px',
          textAlign: 'center',
        }}
      >
        {message}
      </h3>

      {subtext && (
        <p
          style={{
            fontSize: '13px',
            color: '#A3A6B3',
            marginBottom: typeof progress === 'number' ? '20px' : 0,
            textAlign: 'center',
          }}
        >
          {subtext}
        </p>
      )}

      {typeof progress === 'number' && (
        <div style={{ width: '220px', marginTop: '16px' }}>
          <div
            style={{
              height: '4px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #FF7A18, #FFB347)',
                borderRadius: '9999px',
                boxShadow: '0 0 10px #FF7A18',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '11px', color: '#A3A6B3' }}>
            {Math.round(progress)}%
          </div>
        </div>
      )}
    </div>
  );
}

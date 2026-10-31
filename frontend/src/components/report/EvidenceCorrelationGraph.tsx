import { motion } from 'framer-motion';

export function EvidenceCorrelationGraph() {
  const leftEvidence = [
    { label: 'High bandwidth utilization', score: '0.12', color: '#38D9FF' },
    { label: 'Increased latency', score: '0.76', color: '#FF7A18' },
    { label: 'Interface errors', score: '0.64', color: '#FF4D4D' },
  ];

  const rightEvidence = [
    { label: 'Queue drops', score: '0.71', color: '#FF7A18' },
    { label: 'Correlated trail', score: '0.81', color: '#A855F7' },
  ];

  return (
    <div
      style={{
        position: 'relative',
        padding: '28px 20px',
        background: 'rgba(17, 19, 26, 0.65)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        minHeight: '260px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}
    >
      {/* SVG Connecting Flowing Splines */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id="grad-left-orange" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38D9FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF7A18" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="grad-right-orange" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF7A18" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Left flowing curves */}
        <path d="M 180,60 C 260,60 280,130 350,130" stroke="url(#grad-left-orange)" strokeWidth="2.5" fill="none" opacity="0.6" />
        <path d="M 180,130 C 260,130 280,130 350,130" stroke="#FF7A18" strokeWidth="3" fill="none" opacity="0.8" />
        <path d="M 180,200 C 260,200 280,130 350,130" stroke="#FF4D4D" strokeWidth="2.5" fill="none" opacity="0.6" />

        {/* Right flowing curves */}
        <path d="M 520,130 C 590,130 610,80 690,80" stroke="#FF7A18" strokeWidth="3" fill="none" opacity="0.8" />
        <path d="M 520,130 C 590,130 610,180 690,180" stroke="url(#grad-right-orange)" strokeWidth="2.5" fill="none" opacity="0.7" />
      </svg>

      {/* Left Evidence Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', zIndex: 1 }}>
        {leftEvidence.map((item) => (
          <div
            key={item.label}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(8, 9, 13, 0.85)',
              border: `1px solid ${item.color}50`,
              boxShadow: `0 0 12px ${item.color}20`,
              fontSize: '11px',
              color: '#F5F5F7',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontWeight: 600 }}>{item.label}</span>
            <span style={{ color: item.color, fontWeight: 700 }}>({item.score})</span>
          </div>
        ))}
      </div>

      {/* Center Root Cause Nexus Node (Exact Reference Match) */}
      <motion.div
        animate={{ scale: [0.97, 1.03, 0.97] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        style={{
          zIndex: 2,
          padding: '14px 28px',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, #FF9436 0%, #FF7A18 60%, #E65A00 100%)',
          color: '#FFFFFF',
          fontWeight: 800,
          fontSize: '14px',
          letterSpacing: '-0.01em',
          boxShadow: '0 0 28px rgba(255, 122, 24, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 179, 71, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          userSelect: 'none',
        }}
      >
        <span>Root Cause</span>
      </motion.div>

      {/* Right Evidence Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', zIndex: 1 }}>
        {rightEvidence.map((item) => (
          <div
            key={item.label}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(8, 9, 13, 0.85)',
              border: `1px solid ${item.color}50`,
              boxShadow: `0 0 12px ${item.color}20`,
              fontSize: '11px',
              color: '#F5F5F7',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontWeight: 600 }}>{item.label}</span>
            <span style={{ color: item.color, fontWeight: 700 }}>({item.score})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

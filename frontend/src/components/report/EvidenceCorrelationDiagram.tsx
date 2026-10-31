import { motion } from 'framer-motion';

export function EvidenceCorrelationDiagram() {
  const leftEvidence = [
    { label: 'High bandwidth utilization', score: '0.92', color: '#38D9FF' },
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
        padding: '36px 30px',
        background: 'rgba(17, 19, 26, 0.65)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 122, 24, 0.25)',
        minHeight: '260px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        boxShadow: '0 0 24px -6px rgba(255, 122, 24, 0.15)',
      }}
    >
      {/* Dynamic SVG Connecting Flowing Splines */}
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
          <linearGradient id="grad-left-cyan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38D9FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FF7A18" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="grad-left-orange" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF7A18" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FF7A18" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="grad-left-red" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF4D4D" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FF7A18" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="grad-right-orange" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#FF7A18" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FF7A18" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="grad-right-violet" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FF7A18" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Left flowing curves: connects left nodes to center */}
        <path d="M 230,64 C 320,64 360,130 440,130" stroke="url(#grad-left-cyan)" strokeWidth="3" fill="none" opacity="0.75" />
        <path d="M 230,130 C 320,130 360,130 440,130" stroke="url(#grad-left-orange)" strokeWidth="3.5" fill="none" opacity="0.9" />
        <path d="M 230,196 C 320,196 360,130 440,130" stroke="url(#grad-left-red)" strokeWidth="3" fill="none" opacity="0.75" />

        {/* Right flowing curves: connects center to right nodes */}
        <path d="M 580,130 C 660,130 700,84 780,84" stroke="url(#grad-right-orange)" strokeWidth="3.5" fill="none" opacity="0.9" />
        <path d="M 580,130 C 660,130 700,176 780,176" stroke="url(#grad-right-violet)" strokeWidth="3" fill="none" opacity="0.75" />
      </svg>

      {/* Left Evidence Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', zIndex: 1, minWidth: '220px' }}>
        {leftEvidence.map((item) => (
          <div
            key={item.label}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(8, 9, 13, 0.9)',
              border: `1px solid ${item.color}60`,
              boxShadow: `0 0 14px ${item.color}25`,
              fontSize: '12px',
              color: '#F5F5F7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <span style={{ fontWeight: 600 }}>{item.label}</span>
            <span style={{ color: item.color, fontWeight: 700 }}>({item.score})</span>
          </div>
        ))}
      </div>

      {/* Center Root Cause Nexus Node */}
      <motion.div
        animate={{ scale: [0.97, 1.03, 0.97] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        style={{
          zIndex: 2,
          padding: '16px 34px',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, #FF9436 0%, #FF7A18 60%, #E65A00 100%)',
          color: '#FFFFFF',
          fontWeight: 800,
          fontSize: '15px',
          letterSpacing: '-0.01em',
          boxShadow: '0 0 32px rgba(255, 122, 24, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 179, 71, 0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 0 8px #FFFFFF',
          }}
        />
        <span>Root Cause</span>
      </motion.div>

      {/* Right Evidence Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', zIndex: 1, minWidth: '190px' }}>
        {rightEvidence.map((item) => (
          <div
            key={item.label}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(8, 9, 13, 0.9)',
              border: `1px solid ${item.color}60`,
              boxShadow: `0 0 14px ${item.color}25`,
              fontSize: '12px',
              color: '#F5F5F7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
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

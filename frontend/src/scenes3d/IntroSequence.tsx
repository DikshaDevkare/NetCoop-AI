import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Network, FastForward, Sparkles } from 'lucide-react';

interface IntroSequenceProps {
  onComplete: () => void;
  onSceneChange?: (scene: number, progress: number) => void;
  prefersReducedMotion?: boolean;
}

export function IntroSequence({
  onComplete,
  prefersReducedMotion = false,
}: IntroSequenceProps) {
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (prefersReducedMotion) {
      onCompleteRef.current();
      return;
    }

    // Short target duration: 1.8 seconds total
    const timer = setTimeout(() => {
      onCompleteRef.current();
    }, 1800);

    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  const handleSkip = () => {
    onCompleteRef.current();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 md:p-10 bg-[#05080D]/95 backdrop-blur-md text-[#F4F6FA] select-none">
      {/* Top Bar with Skip Intro Button */}
      <div className="w-full flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF8A24] animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-[#FF8A24] font-mono font-bold">
            NETCOOP AI // INITIALIZING
          </span>
        </div>

        <button
          onClick={handleSkip}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs uppercase tracking-wider text-[#A2ACBA] hover:text-[#FF8A24] hover:border-[#FF8A24]/40 transition-all cursor-pointer"
        >
          <span>Skip Intro</span>
          <FastForward className="w-3.5 h-3.5 text-[#FF8A24]" />
        </button>
      </div>

      {/* Center Cinematic Energy Animation & Logo Entrance */}
      <div className="my-auto flex flex-col items-center justify-center text-center relative">
        {/* Smooth Concentric Circular Energy Rings */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotate: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: 360 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center"
        >
          {/* Outer Orange Pulsing Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[#FF8A24]/40 animate-[spin_8s_linear_infinite]" />
          {/* Inner Cyan Rotating Ring */}
          <div className="absolute inset-4 rounded-full border border-dashed border-[#20D9FF]/50 animate-[spin_6s_linear_infinite_reverse]" />
          {/* Center Glow Ambient Orb */}
          <div className="absolute inset-10 rounded-full bg-gradient-to-tr from-[#FF8A24]/20 via-[#20D9FF]/20 to-transparent blur-xl" />

          {/* Central High-Tech Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.2, type: 'spring', stiffness: 120 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF8A24] via-[#FFB45C] to-[#20D9FF] p-[2px] shadow-2xl shadow-[#FF8A24]/40 z-10 flex items-center justify-center"
          >
            <div className="w-full h-full bg-[#05080D] rounded-[14px] flex items-center justify-center">
              <Network className="w-10 h-10 text-[#FF8A24]" />
            </div>
          </motion.div>
        </motion.div>

        {/* Brand Title & Tagline with Rapid Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 space-y-2"
        >
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#F4F6FA] uppercase">
            NETCOOP <span className="bg-gradient-to-r from-[#FF8A24] via-[#FFB45C] to-[#20D9FF] bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-xs sm:text-sm font-mono text-[#A2ACBA] tracking-wide max-w-md mx-auto">
            Autonomous Multi-Agent Network Fault Diagnosis Platform
          </p>
        </motion.div>

        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#26D7A0]/10 border border-[#26D7A0]/30 text-[11px] font-mono text-[#26D7A0]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>CONSENSUS CORE ONLINE // ENTERING NOC</span>
        </motion.div>
      </div>

      {/* Bottom Fast Micro Progress Indicator */}
      <div className="w-full max-w-xs mx-auto">
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-[#FF8A24] via-[#FFB45C] to-[#20D9FF]"
          />
        </div>
      </div>
    </div>
  );
}

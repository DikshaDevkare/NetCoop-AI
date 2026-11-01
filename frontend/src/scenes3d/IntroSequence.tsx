import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FastForward, Shield, Radio, Activity } from 'lucide-react';

interface IntroSequenceProps {
  onComplete: () => void;
  onSceneChange: (scene: number, progress: number) => void;
  prefersReducedMotion?: boolean;
}

export function IntroSequence({
  onComplete,
  onSceneChange,
  prefersReducedMotion = false,
}: IntroSequenceProps) {
  const [currentScene, setCurrentScene] = useState<number>(1);
  const [sceneProgress, setSceneProgress] = useState<number>(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // Sequence timing table (scene durations in milliseconds)
    const sceneDurations = [
      2200, // Scene 1: Dark Digital Environment
      2400, // Scene 2: Portal Activation
      2800, // Scene 3: Robot Entry & Curved Motion
      2200, // Scene 4: Hero Positioning
      2600, // Scene 5: Network Core Activation (Hand Raised)
      3200, // Scene 6: Brand Reveal
    ];

    let startTime = Date.now();
    let currentIdx = 0;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const targetDuration = sceneDurations[currentIdx];
      const progress = Math.min(1, elapsed / targetDuration);
      setSceneProgress(progress);
      onSceneChange(currentIdx + 1, progress);

      if (elapsed >= targetDuration) {
        if (currentIdx < sceneDurations.length - 1) {
          currentIdx += 1;
          startTime = Date.now();
          setCurrentScene(currentIdx + 1);
        } else {
          clearInterval(interval);
          onComplete();
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete, onSceneChange, prefersReducedMotion]);

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-6 md:p-12">
      {/* Top Bar with Skip Intro Button */}
      <div className="w-full flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF8A24] animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-[#A2ACBA] font-mono">
            Cinematic Initialization // Scene 0{currentScene}
          </span>
        </div>

        <button
          onClick={handleSkip}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs uppercase tracking-wider text-[#F4F6FA] hover:text-[#FF8A24] hover:border-[#FF8A24]/40 transition-all cursor-pointer pointer-events-auto"
        >
          <span>Skip Sequence</span>
          <FastForward className="w-3.5 h-3.5 text-[#FF8A24]" />
        </button>
      </div>

      {/* Center Cinematic Scene Captions & Brand Reveal */}
      <div className="my-auto flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {currentScene === 1 && (
            <motion.div
              key="scene-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8 }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF8A24]/10 border border-[#FF8A24]/30 text-[#FF8A24] text-xs font-mono">
                <Radio className="w-3.5 h-3.5 animate-spin" />
                <span>STANDARDIZED TELEMETRY STREAM ACQUIRED</span>
              </div>
              <h2 className="text-xl md:text-3xl font-light text-[#A2ACBA] tracking-wider">
                Initiating Deep Space Network Topology
              </h2>
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              key="scene-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20D9FF]/10 border border-[#20D9FF]/30 text-[#20D9FF] text-xs font-mono">
                <Activity className="w-3.5 h-3.5" />
                <span>INTEROPERABILITY GATEWAY OPENING</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-semibold text-[#F4F6FA] tracking-wide">
                Activating Multi-Agent Neural Matrix
              </h2>
            </motion.div>
          )}

          {currentScene === 3 && (
            <motion.div
              key="scene-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="space-y-2"
            >
              <span className="text-xs uppercase tracking-widest text-[#FF8A24] font-mono">
                Autonomous Diagnostics Ingress
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#F4F6FA]">
                Autonomous Observer Materializing
              </h2>
            </motion.div>
          )}

          {currentScene === 4 && (
            <motion.div
              key="scene-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.7 }}
              className="space-y-2 text-left md:text-center"
            >
              <span className="text-xs uppercase tracking-widest text-[#20D9FF] font-mono">
                Telemetry Synchronization
              </span>
              <p className="text-base md:text-xl text-[#A2ACBA]">
                Locking coordinates into campus distribution fabric
              </p>
            </motion.div>
          )}

          {currentScene === 5 && (
            <motion.div
              key="scene-5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.9 }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF8A24]/10 border border-[#FF8A24]/30 text-[#FF8A24] text-xs font-mono">
                <Shield className="w-3.5 h-3.5" />
                <span>HOLOGRAPHIC NETWORK CORE ACTIVE</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-[#F4F6FA] tracking-tight">
                Synthesizing Distributed Topology Graph
              </h2>
            </motion.div>
          )}

          {currentScene === 6 && (
            <motion.div
              key="scene-6"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.0 }}
              className="space-y-5"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF8A24]/20 to-[#20D9FF]/20 border border-[#FF8A24]/40"
              >
                <div className="w-2 h-2 rounded-full bg-[#FF8A24] animate-ping" />
                <span className="text-xs font-semibold tracking-widest text-[#F4F6FA] uppercase">
                  NetCoop AI Architecture v1.0
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-7xl font-extrabold tracking-tight text-[#F4F6FA]"
              >
                NETCOOP <span className="text-[#FF8A24] text-glow-orange">AI</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-sm md:text-lg text-[#A2ACBA] max-w-2xl mx-auto uppercase tracking-wider font-light"
              >
                INTELLIGENT NETWORK DIAGNOSIS &amp; MULTI-AGENT INTELLIGENCE
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Progress Bar & Telemetry Status */}
      <div className="w-full max-w-xl mx-auto space-y-2 pointer-events-auto">
        <div className="flex justify-between text-[11px] font-mono text-[#A2ACBA]/80">
          <span>INITIALIZING HETEROGENEOUS MESH</span>
          <span>{Math.round(((currentScene - 1 + sceneProgress) / 6) * 100)}%</span>
        </div>
        <div className="h-1 w-full bg-[#141B25] rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FF8A24] via-[#FFB45C] to-[#20D9FF]"
            style={{
              width: `${((currentScene - 1 + sceneProgress) / 6) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

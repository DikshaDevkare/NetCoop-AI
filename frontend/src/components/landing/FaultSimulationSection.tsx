import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Play,
  RotateCcw,
  Terminal,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface FaultSimulationSectionProps {
  onSimulateFault?: (active: boolean) => void;
}

export function FaultSimulationSection({
  onSimulateFault,
}: FaultSimulationSectionProps) {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [stage, setStage] = useState<'idle' | 'analyzing' | 'correlated' | 'resolved'>('idle');

  const scenarios = [
    {
      id: 'scn-congestion',
      title: 'Buffer Overflow Congestion',
      device: 'SW-DIST-01',
      symptom: 'Bandwidth 98.2%, 550 Queue Drops, Latency 220ms',
      rootCause: 'Network Bandwidth Congestion & Egress Buffer Saturation',
      confidence: 'High (0.92)',
      scope: 'device_local',
      agentEvidence: [
        'Telemetry Agent: Bandwidth 98.2% exceeds critical threshold (90%)',
        'Telemetry Agent: 550 queue drops detected on egress trunk',
        'Infrastructure Agent: CPU (52%) and thermals (46°C) within normal limits',
        'Connectivity Agent: DNS latency normal (14ms); transport issue isolated',
      ],
      remedyCommand: 'qos policy-map EGRESS-SHAPING class BULK-DATA police rate 500 mbps',
    },
    {
      id: 'scn-wifi',
      title: 'Weak Wi-Fi RF Attenuation',
      device: 'AP-DORM-01',
      symptom: 'RSSI -86.0 dBm, 7.8% Loss, Normal Wired Core',
      rootCause: 'Wireless Signal Degradation / Weak Wi-Fi Coverage Hole',
      confidence: 'High (0.85)',
      scope: 'device_local',
      agentEvidence: [
        'Connectivity Agent: RSSI -86.0 dBm breaches RF floor (-80 dBm)',
        'Infrastructure Agent: Access Point uptime and RAM nominal',
        'Fault Correlation: Promotes empirical RF finding over statistical baseline',
      ],
      remedyCommand: 'ap capwap eirp-power 5ghz increase 3dbm channel-width 40mhz',
    },
  ];

  const handleStartSimulation = (scenarioId: string) => {
    setActiveScenario(scenarioId);
    setIsSimulating(true);
    setStage('analyzing');
    onSimulateFault?.(true);

    // Simulate multi-agent correlation progression
    setTimeout(() => {
      setStage('correlated');
    }, 1200);
  };

  const handleResolve = () => {
    setStage('resolved');
    setTimeout(() => {
      setIsSimulating(false);
      setActiveScenario(null);
      setStage('idle');
      onSimulateFault?.(false);
    }, 1400);
  };

  const currentScenarioData = scenarios.find((s) => s.id === activeScenario);

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto z-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4D5A]/10 border border-[#FF4D5A]/30 text-[#FF4D5A] text-xs font-mono">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>INTERACTIVE DIAGNOSTIC SIMULATOR // FAULT CORRELATION</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F4F6FA]">
          Witness Real-Time Autonomous Fault Isolation
        </h2>

        <p className="text-base text-[#A2ACBA] leading-relaxed">
          Trigger a live telemetry degradation scenario to watch the 5 agents evaluate
          symptoms, resolve conflicts, isolate root cause, and formulate mitigation commands.
        </p>
      </div>

      {/* Simulator Control Box */}
      <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Background Status Pulse */}
        <div
          className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl transition-colors duration-700 pointer-events-none ${
            stage === 'analyzing' || stage === 'correlated'
              ? 'bg-[#FF4D5A]/20'
              : stage === 'resolved'
              ? 'bg-[#26D7A0]/20'
              : 'bg-[#FF8A24]/10'
          }`}
        />

        {/* Step 1: Choose Scenario Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#A2ACBA]">
              CHOOSE INCIDENT TO INJECT:
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {scenarios.map((scn) => (
                <button
                  key={scn.id}
                  onClick={() => handleStartSimulation(scn.id)}
                  disabled={isSimulating && activeScenario === scn.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    activeScenario === scn.id
                      ? 'bg-[#FF4D5A] text-white font-bold shadow-md shadow-[#FF4D5A]/30'
                      : 'bg-white/5 hover:bg-white/10 text-[#F4F6FA] border border-white/10'
                  }`}
                >
                  <Play className="w-3 h-3 text-[#FF8A24]" />
                  <span>{scn.title}</span>
                </button>
              ))}
            </div>
          </div>

          {isSimulating && (
            <button
              onClick={handleResolve}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#26D7A0] text-[#080B10] text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#26D7A0]/20 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Apply Fix &amp; Stabilize Mesh</span>
            </button>
          )}
        </div>

        {/* Step 2: Diagnostic Reasoning Live View */}
        <div className="pt-8">
          <AnimatePresence mode="wait">
            {!isSimulating && (
              <motion.div
                key="idle-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#A2ACBA]">
                  <Zap className="w-5 h-5 text-[#FF8A24]" />
                </div>
                <h4 className="text-base font-bold text-[#F4F6FA]">
                  Network Mesh in Nominal Steady State
                </h4>
                <p className="text-xs text-[#A2ACBA] max-w-md mx-auto">
                  Click either incident above to inject simulated telemetry into the
                  multi-agent correlation engine.
                </p>
              </motion.div>
            )}

            {isSimulating && currentScenarioData && (
              <motion.div
                key="simulation-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Alert Locus Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#FF4D5A] animate-ping" />
                    <div>
                      <div className="text-xs font-mono font-bold text-[#FF4D5A]">
                        INCIDENT DETECTED // TARGET: {currentScenarioData.device}
                      </div>
                      <div className="text-xs text-[#F4F6FA] font-medium">
                        {currentScenarioData.symptom}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-[#A2ACBA]">
                      Scope: <code className="text-[#20D9FF]">{currentScenarioData.scope}</code>
                    </span>
                  </div>
                </div>

                {/* Multi-Agent Live Evidence Stream */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#A2ACBA] block">
                    AGENT CORROBORATION LOG:
                  </span>
                  <div className="space-y-1.5">
                    {currentScenarioData.agentEvidence.map((ev, eIdx) => (
                      <motion.div
                        key={`ev-${eIdx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: eIdx * 0.15 }}
                        className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-[#F4F6FA]/90 flex items-center gap-2"
                      >
                        <span className="text-[#FF8A24]">❯</span>
                        <span>{ev}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Correlated Root Cause & Recommendation */}
                {stage === 'correlated' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl bg-[#FF8A24]/10 border border-[#FF8A24]/30 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#FF8A24]" />
                        <span className="text-xs font-mono font-bold text-[#FF8A24]">
                          SYNTHESIZED ROOT CAUSE HYPOTHESIS
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#26D7A0]">
                        Confidence: {currentScenarioData.confidence}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[#F4F6FA]">
                      {currentScenarioData.rootCause}
                    </p>

                    {/* Mitigation CLI Command */}
                    <div className="p-3 rounded-xl bg-black/70 border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#20D9FF]">
                        <Terminal className="w-3 h-3" />
                        <span>RECOMMENDED CORRECTIVE RUNBOOK:</span>
                      </div>
                      <code className="text-xs text-[#26D7A0] font-mono block overflow-x-auto">
                        $ {currentScenarioData.remedyCommand}
                      </code>
                    </div>
                  </motion.div>
                )}

                {stage === 'resolved' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-2xl bg-[#26D7A0]/20 border border-[#26D7A0]/40 flex items-center gap-3 text-[#26D7A0]"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-xs font-mono font-bold">
                      Corrective action verified. Topology returned to 100% healthy baseline.
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

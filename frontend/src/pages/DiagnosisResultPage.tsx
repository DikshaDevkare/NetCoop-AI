import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DiagnosisFault3D } from '../scenes3d/DiagnosisFault3D';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  ShieldAlert,
  Terminal,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

interface IncidentDetail {
  id: string;
  name: string;
  severity: 'critical' | 'warning' | 'healthy';
  targetDevice: string;
  confidence: number;
  rootCause: string;
  evidence: Array<{ agent: string; color: string; finding: string; weight: string }>;
  alternatives: Array<{ hypothesis: string; confidence: number }>;
  remediationCommands: string;
  blastRadius: {
    affectedDevices: string[];
    affectedVlans: string[];
    packetLoss: string;
    latencySpike: string;
  };
}

const INCIDENT_DATABASE: Record<string, IncidentDetail> = {
  'INC-1002': {
    id: 'INC-1002',
    name: 'Core Distribution Switch Output Buffer Congestion',
    severity: 'critical',
    targetDevice: 'SW-DIST-01',
    confidence: 0.942,
    rootCause:
      'Hardware ASIC output queue exhaustion and tail drops on trunk uplink GigabitEthernet0/1 under high microburst traffic load, compounded by memory leak in management daemon.',
    evidence: [
      {
        agent: 'Telemetry & Perf Agent',
        color: '#20D9FF',
        finding: '8.4% packet drop rate on trunk Gi0/1 (Error floor threshold: 2.0%). Sustained 920 Mbps ingress.',
        weight: 'High (0.95)',
      },
      {
        agent: 'Infrastructure Health Agent',
        color: '#FF8A24',
        finding: 'ASIC CPU load at 98.2%. Buffer tail drop counter reached 14,208 packets. lldp_worker memory leak.',
        weight: 'Critical (0.98)',
      },
      {
        agent: 'Connectivity Analysis Agent',
        color: '#4A8DFF',
        finding: 'DNS resolution latency to 10.0.0.53 spiked to 210ms due to upstream queue transit latency.',
        weight: 'Medium (0.82)',
      },
      {
        agent: 'ML Anomaly Detection',
        color: '#A855F7',
        finding: 'Isolation Forest anomaly score -0.428 (Z-score +3.8σ). LightGBM classifier confidence 94.2%.',
        weight: 'High (0.94)',
      },
    ],
    alternatives: [
      { hypothesis: 'Physical Fiber SFP Optic Degradation', confidence: 0.241 },
      { hypothesis: 'Upstream Transit ISP BGP Flapping', confidence: 0.058 },
    ],
    remediationCommands: `! --- NetCoop AI Autonomous Remediation Plan [INC-1002] ---
! Target Device: SW-DIST-01 (Cisco IOS-XE / Arista EOS)
configure terminal
! 1. Expand hardware queue depth to buffer microbursts
interface GigabitEthernet0/1
 hold-queue 4096 out
 priority-queue out
! 2. Apply dynamic fair queuing policy
 policy-map QOS_BURST_MITIGATION
  class CLASS_HIGH_PRIORITY
   priority level 1
   police rate percent 30
  class class-default
   bandwidth remaining percent 70
   random-detect dscp-based
! 3. Restart leaky management daemon
do restart service lldp_worker
end
write memory`,
    blastRadius: {
      affectedDevices: ['SW-ACCESS-01', 'SW-ACCESS-02', 'AP-LIB-01'],
      affectedVlans: ['VLAN 10 (Voice)', 'VLAN 20 (Engineering)', 'VLAN 50 (Guest)'],
      packetLoss: '8.4% egress drop',
      latencySpike: '+42.5ms RTT',
    },
  },
  'INC-1003': {
    id: 'INC-1003',
    name: 'Dormitory Weak Wi-Fi Coverage & Co-Channel Interference',
    severity: 'warning',
    targetDevice: 'AP-DORM-01',
    confidence: 0.887,
    rootCause:
      'Severe 2.4GHz / 5GHz co-channel interference and low client RSSI floor (-82 dBm) causing high frame retry rate and roaming ping-pong effect.',
    evidence: [
      {
        agent: 'Connectivity Analysis Agent',
        color: '#4A8DFF',
        finding: 'Client RSSI floor degraded to -82 dBm. 802.11 frame retransmission rate at 34.2%.',
        weight: 'High (0.92)',
      },
      {
        agent: 'Telemetry & Perf Agent',
        color: '#20D9FF',
        finding: 'Channel utilization on Channel 36 reached 84%. Beacon transmission delay detected.',
        weight: 'High (0.89)',
      },
      {
        agent: 'Infrastructure Health Agent',
        color: '#FF8A24',
        finding: 'Radio temperature nominal (44°C). PoE voltage delivery to AP is stable at 54V.',
        weight: 'Normal (0.20)',
      },
    ],
    alternatives: [
      { hypothesis: 'PoE Switchport Power Negotiation Error', confidence: 0.184 },
      { hypothesis: 'Client OS Wireless Driver Incompatibility', confidence: 0.112 },
    ],
    remediationCommands: `! --- NetCoop AI Autonomous Remediation Plan [INC-1003] ---
! Target Device: AP-DORM-01 (Campus Wireless Controller)
ap name AP-DORM-01
 dot11 5ghz channel cleanair auto
 dot11 5ghz tx-power 18
 dot11 2ghz shutdown
 client band-select enable
 client roam-threshold rssi -74
end`,
    blastRadius: {
      affectedDevices: ['AP-DORM-01', 'Dormitory East Clients (148 users)'],
      affectedVlans: ['VLAN 40 (Student Residential)'],
      packetLoss: '14.2% Wi-Fi frame drops',
      latencySpike: '+94ms client jitter',
    },
  },
};

// Fallback incident generator
function getIncidentDetail(id?: string): IncidentDetail {
  if (id && INCIDENT_DATABASE[id]) {
    return INCIDENT_DATABASE[id];
  }
  return INCIDENT_DATABASE['INC-1002'];
}

export function DiagnosisResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const incident = getIncidentDetail(id);

  const [copied, setCopied] = useState(false);
  const [isExecutingFix, setIsExecutingFix] = useState(false);
  const [fixApplied, setFixApplied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(incident.remediationCommands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyFix = () => {
    setIsExecutingFix(true);
    setTimeout(() => {
      setIsExecutingFix(false);
      setFixApplied(true);
    }, 2000);
  };

  const handleExportReport = useCallback(() => {
    const timestampStr = new Date().toISOString();
    const reportText = [
      '================================================================================',
      `NETCOOP AI — MULTI-AGENT NETWORK FAULT DIAGNOSIS REPORT`,
      `Protocol v1.0 Standardized RFC 3339 Compliance`,
      '================================================================================',
      `INCIDENT ID:      ${incident.id}`,
      `SEVERITY:         ${incident.severity.toUpperCase()}`,
      `TARGET NODE:      ${incident.targetDevice}`,
      `CONSENSUS SCORE:  ${(incident.confidence * 100).toFixed(1)}%`,
      `GENERATED AT:     ${timestampStr}`,
      '',
      '--- 1. PRIMARY ROOT CAUSE SYNTHESIS ---',
      incident.rootCause,
      '',
      '--- 2. IMPACT ASSESSMENT & BLAST RADIUS ---',
      `Affected Devices: ${incident.blastRadius.affectedDevices.join(', ')}`,
      `Affected VLANs:   ${incident.blastRadius.affectedVlans.join(', ')}`,
      `Traffic Drop:     ${incident.blastRadius.packetLoss}`,
      `Latency Jitter:   ${incident.blastRadius.latencySpike}`,
      '',
      '--- 3. 5-AGENT CORROBORATED EVIDENCE TRAIL ---',
      ...incident.evidence.map(
        (e) => `• [${e.agent}] (Weight: ${e.weight})\n  ${e.finding}`
      ),
      '',
      '--- 4. RECOMMENDED DETERMINISTIC REMEDIATION SCRIPT ---',
      incident.remediationCommands,
      '',
      '================================================================================',
      'End of NetCoop AI Verified Diagnostic Report',
    ].join('\n');

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NetCoop_${incident.id}_Diagnostic_Report.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [incident]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Top Navigation & Status Banner matching SCREEN 6 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/diagnosis')}
            className="p-2 rounded-xl glass-panel border border-white/10 hover:border-[#FF8A24] text-[#A2ACBA] hover:text-[#FF8A24] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#FF8A24]">
                {incident.id}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#FF4D5A]/20 text-[#FF4D5A] border border-[#FF4D5A]/40 font-bold">
                {incident.severity.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-[#26D7A0] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                VERIFIED ROOT CAUSE
              </span>
              <span className="text-[11px] font-mono text-[#A2ACBA]">
                Analyzed at 10:42:15 UTC &bull; Device: <strong className="text-[#20D9FF]">{incident.targetDevice}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#F4F6FA] mt-0.5">
              Diagnosis Result
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/dashboard/reports')}
            className="px-4 py-2 rounded-xl text-xs font-mono text-[#F4F6FA] glass-panel border border-white/10 hover:border-white/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#20D9FF]" />
            View Full Report
          </button>
          <button
            onClick={handleExportReport}
            className="px-4 py-2 rounded-xl text-xs font-mono bg-[#FF8A24]/10 hover:bg-[#FF8A24]/20 border border-[#FF8A24]/40 text-[#FF8A24] font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Fault Localization (55%) + Intelligence Dossier (45%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Spatial Blast Radius & Topology View */}
        <div className="lg:col-span-7 space-y-4">
          <DiagnosisFault3D
            faultyNodeId={incident.targetDevice}
            faultType={incident.name}
          />

          {/* Blast Radius & Impact Card */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#F4F6FA] font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#FF4D5A]" />
                IMPACT ASSESSMENT &amp; BLAST RADIUS
              </span>
              <span className="text-[#FF4D5A] font-bold">Severity Level 1</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-[#A2ACBA] block">Target Device:</span>
                <span className="text-[#FF8A24] font-bold">{incident.targetDevice}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-[#A2ACBA] block">Traffic Drop:</span>
                <span className="text-[#FF4D5A] font-bold">{incident.blastRadius.packetLoss}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-[#A2ACBA] block">Latency Jitter:</span>
                <span className="text-[#FFB547] font-bold">{incident.blastRadius.latencySpike}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-[#A2ACBA] block">Downstream Nodes:</span>
                <span className="text-[#20D9FF] font-bold">{incident.blastRadius.affectedDevices.length} nodes</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-[#A2ACBA] flex flex-wrap gap-2">
              <span className="text-[#F4F6FA] font-bold">Affected VLANs:</span>
              {incident.blastRadius.affectedVlans.map((vlan, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-black/50 border border-white/10 text-[#20D9FF]">
                  {vlan}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Agent Consensus Intelligence & Remediation */}
        <div className="lg:col-span-5 space-y-4">
          {/* Root Cause Hypothesis & Confidence Score */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FF8A24]">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold">PRIMARY ROOT CAUSE HYPOTHESIS</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#26D7A0] px-2.5 py-0.5 rounded-full bg-[#26D7A0]/10 border border-[#26D7A0]/30">
                {(incident.confidence * 100).toFixed(1)}% Consensus
              </span>
            </div>

            <p className="text-sm text-[#F4F6FA] leading-relaxed font-medium">
              {incident.rootCause}
            </p>

            {/* Confidence Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-[#A2ACBA]">
                <span>Multi-Agent Bayesian Confidence</span>
                <span className="text-[#26D7A0] font-bold">{(incident.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[#101A25] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#FF8A24] to-[#26D7A0] h-full rounded-full transition-all duration-1000"
                  style={{ width: `${incident.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Contributing Agent Evidence List */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#F4F6FA] font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#20D9FF]" />
                CORRELATED AGENT EVIDENCE TRAIL
              </span>
              <span className="text-[10px] text-[#A2ACBA]">4 Vectors Aligned</span>
            </div>

            <div className="space-y-2">
              {incident.evidence.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-bold text-[11px]"
                      style={{ color: item.color }}
                    >
                      {item.agent}
                    </span>
                    <span className="text-[10px] text-[#A2ACBA]">
                      Weight: {item.weight}
                    </span>
                  </div>
                  <p className="text-[#F4F6FA] text-[11px] leading-relaxed">
                    {item.finding}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Lower-Confidence Hypotheses */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
            <span className="text-[11px] font-mono text-[#A2ACBA] uppercase block">
              Alternative Evaluated Hypotheses:
            </span>
            <div className="space-y-1.5 font-mono text-xs">
              {incident.alternatives.map((alt, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5 text-[#A2ACBA]"
                >
                  <span className="truncate pr-2">{alt.hypothesis}</span>
                  <span className="text-[#FFB547] font-semibold shrink-0">
                    {(alt.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Cisco/Arista CLI Remediation */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#F4F6FA] font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#26D7A0]" />
                RECOMMENDED REMEDIATION SCRIPT
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-[#A2ACBA] hover:text-[#F4F6FA] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied!' : 'Copy CLI'}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-black/90 border border-white/10 font-mono text-[11px] text-[#26D7A0] overflow-x-auto whitespace-pre leading-relaxed">
              {incident.remediationCommands}
            </div>

            <button
              onClick={handleApplyFix}
              disabled={isExecutingFix || fixApplied}
              className={`w-full py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                fixApplied
                  ? 'bg-[#26D7A0]/20 text-[#26D7A0] border border-[#26D7A0]/50'
                  : 'bg-gradient-to-r from-[#26D7A0] to-[#20D9FF] text-[#05080D] shadow-lg shadow-[#26D7A0]/20 hover:brightness-110 active:scale-[0.98]'
              }`}
            >
              {isExecutingFix ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  Applying Configuration to {incident.targetDevice}...
                </>
              ) : fixApplied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Remediation Applied Successfully
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Execute Autonomous Configuration Apply
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

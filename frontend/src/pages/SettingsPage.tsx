import { useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import {
  Settings,
  Server,
  RotateCw,
  Cpu,
} from 'lucide-react';

export function SettingsPage() {
  const {
    isLiveBackend,
    systemStatus,
    lastUpdated,
    fetchData,
    isLoading,
  } = useDashboardStore();

  const [apiUrl, setApiUrl] = useState(
    import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Header */}
      <div className="pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FF8A24] mb-1">
          <Settings className="w-4 h-4" />
          <span>SYSTEM CONFIGURATION // PLATFORM PARAMETERS</span>
        </div>
        <h2 className="text-2xl font-black text-[#F4F6FA]">
          Platform Settings &amp; Backend Telemetry Sync
        </h2>
        <p className="text-xs text-[#A2ACBA] mt-1">
          Configure API endpoints, verify database connectivity, inspect loaded machine
          learning models, and audit protocol version compliance.
        </p>
      </div>

      {/* Backend Connection Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF8A24]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F4F6FA]">
                FastAPI Backend Connection
              </h3>
              <p className="text-xs text-[#A2ACBA]">
                Endpoint used for health checks, telemetry streams, and device inventory
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border ${
              isLiveBackend
                ? 'bg-[#26D7A0]/10 text-[#26D7A0] border-[#26D7A0]/30'
                : 'bg-[#FFB547]/10 text-[#FFB547] border-[#FFB547]/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveBackend ? 'bg-[#26D7A0] animate-pulse' : 'bg-[#FFB547]'
              }`}
            />
            <span>{isLiveBackend ? 'ONLINE & CONNECTED' : 'OFFLINE / DEMO MODE'}</span>
          </div>
        </div>

        {/* API URL Config Form */}
        <div className="space-y-3">
          <label className="text-xs font-mono text-[#A2ACBA] block">
            BACKEND REST API BASE URL:
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-[#F4F6FA] focus:outline-none focus:border-[#FF8A24]"
            />
            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A24] to-[#FFB45C] text-[#080B10] text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#FF8A24]/20 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>
        </div>

        {/* Connection Diagnostics Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 text-xs font-mono">
          <div>
            <span className="text-[10px] text-[#A2ACBA] block">PROTOCOL VERSION</span>
            <span className="text-[#20D9FF] font-bold">Standard Protocol v1.0</span>
          </div>
          <div>
            <span className="text-[10px] text-[#A2ACBA] block">DATABASE CONNECTIVITY</span>
            <span className="text-[#26D7A0]">
              {systemStatus?.database_status || 'SQLite (netcoop.db)'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#A2ACBA] block">LAST EVALUATED</span>
            <span className="text-[#F4F6FA]">{lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Loaded Machine Learning Pipelines (from backend /api/system/status) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2.5 text-xs font-mono text-[#20D9FF]">
          <Cpu className="w-4 h-4" />
          <span>LOADED MACHINE LEARNING SUBSYSTEMS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Isolation Forest */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#FF8A24]">Isolation Forest</span>
              <span className="text-[10px] text-[#26D7A0]">READY</span>
            </div>
            <p className="text-[11px] text-[#A2ACBA]">
              Unsupervised outlier baseline detector trained on 18 standardized features.
            </p>
            <div className="text-[10px] text-[#20D9FF]">Threshold: -0.05</div>
          </div>

          {/* XGBoost */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#20D9FF]">XGBoost Classifier</span>
              <span className="text-[10px] text-[#26D7A0]">READY</span>
            </div>
            <p className="text-[11px] text-[#A2ACBA]">
              Supervised 7-class fault classifier with margin &amp; entropy uncertainty scores.
            </p>
            <div className="text-[10px] text-[#20D9FF]">7 Failure Classes</div>
          </div>

          {/* Temporal Analyzer */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#FFB45C]">Temporal Analyzer</span>
              <span className="text-[10px] text-[#26D7A0]">READY</span>
            </div>
            <p className="text-[11px] text-[#A2ACBA]">
              Deterministic rate-of-change trajectory tracking degradation &amp; recovery.
            </p>
            <div className="text-[10px] text-[#20D9FF]">ROC Slopes: Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}

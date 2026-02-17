"use client";

import React, { useState } from 'react';
import api from '@/lib/api';
import {
  ShieldAlert, Brain, AlertTriangle, Zap,
  CheckCircle, XCircle, Loader2, Rocket,
  Lock, Unlock
} from 'lucide-react';

interface FlagStatus {
  id: number;
  environment_id: number;
  environment_name: string;
  is_enabled: boolean;
}

interface FlagProps {
  flag: {
    id: number;
    name: string;
    key: string;
    description: string;
    statuses: FlagStatus[];
  };
  onUpdate: () => void;
}

// Gate Stages for Production Deployments
type GateStage = 'idle' | 'auditing' | 'score_display' | 'finalizing';

interface AuditReport {
  risk_score: number;
  advice: string;
  risk_level: string;
  status?: string;
  live_traffic_hits?: number; // Blast Radius telemetry
}

export default function FlagCard({ flag, onUpdate }: FlagProps) {
  const [error, setError] = useState<string | null>(null);
  const [activeEnvId, setActiveEnvId] = useState<number | null>(null);

  // Two-Stage Gate State
  const [gateStage, setGateStage] = useState<GateStage>('idle');
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [gateEnvId, setGateEnvId] = useState<number | null>(null);
  const [gateReason, setGateReason] = useState('');

  const isProd = (envName: string | undefined) => (envName || '').toLowerCase() === 'production';

  // --- STAGE 1: Audit (The Dry Run) ---
  const startProductionGate = async (envId: number) => {
    setError(null);
    setGateEnvId(envId);
    setGateStage('auditing');
    setAuditReport(null);

    try {
      // Calls the /audit endpoint to get the Groq-powered risk assessment
      const res = await api.post(`/flags/${flag.id}/audit`, {
        environment_id: envId,
        reason: 'Pre-flight production audit',
      });
      setAuditReport(res.data.data);
      setGateStage('score_display');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Audit request failed.');
      setGateStage('idle');
    }
  };

  // --- STAGE 2: Finalize Deployment (The Real Toggle) ---
  const finalizeDeployment = async () => {
    if (!gateEnvId) return;
    setGateStage('finalizing');
    setError(null);

    try {
      await api.patch(`/flags/${flag.id}/toggle`, {
        environment_id: gateEnvId,
        reason: gateReason || 'Production deployment confirmed after audit',
      });
      resetGate();
      onUpdate();
    } catch (err: any) {
      if (err.response?.status === 403) {
        // AI Guardrail Hard Block
        const blockData = err.response?.data?.data;
        setError(blockData?.message || 'Deployment blocked by AI Safety Guardrail.');
        setAuditReport(blockData?.report || auditReport);
        setGateStage('score_display');
      } else {
        setError(err.response?.data?.message || 'Toggle failed.');
        setGateStage('idle');
      }
    }
  };

  const directToggle = async (envId: number) => {
    setError(null);
    setActiveEnvId(envId);
    try {
      await api.patch(`/flags/${flag.id}/toggle`, {
        environment_id: envId,
        reason: 'Non-production toggle',
      });
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Toggle failed.');
    } finally {
      setActiveEnvId(null);
    }
  };

  const resetGate = () => {
    setGateStage('idle');
    setAuditReport(null);
    setGateEnvId(null);
    setGateReason('');
    setError(null);
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return { text: 'text-red-500', bg: 'bg-red-500', ring: 'ring-red-500/30' };
    if (score >= 5) return { text: 'text-orange-400', bg: 'bg-orange-400', ring: 'ring-orange-400/30' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-400', ring: 'ring-emerald-400/30' };
  };

  return (
    <div className="bg-[#020617]/70 backdrop-blur-md border border-slate-800/60 rounded-[2rem] p-6 hover:border-slate-700/80 transition-all duration-500 shadow-xl">
      
      {/* Flag Information */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-white truncate tracking-tight">{flag.name}</h3>
          <p className="text-[10px] font-mono text-blue-500/70 uppercase tracking-widest mt-1">{flag.key}</p>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
          <Zap className="w-3 h-3" /> {flag.statuses?.filter(s => s.is_enabled).length || 0} Nodes Active
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-6 line-clamp-2 leading-relaxed font-medium">{flag.description}</p>

      {/* Environment Grid */}
      <div className="space-y-2">
        {flag.statuses?.map((status) => {
          const isProduction = isProd(status.environment_name);
          const isGateActive = isProduction && gateStage !== 'idle' && gateEnvId === status.environment_id;

          return (
            <div key={status.id}>
              <div className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-300 ${isProduction 
                ? 'bg-red-500/[0.03] border border-red-500/10' 
                : 'bg-slate-900/50 border border-slate-800/50'}`}>
                
                <div className="flex items-center gap-3">
                  {isProduction ? <Lock className="w-3.5 h-3.5 text-red-500/60" /> : <Unlock className="w-3.5 h-3.5 text-slate-600" />}
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isProduction ? 'text-red-400/80' : 'text-slate-500'}`}>
                    {status.environment_name}
                  </span>
                </div>

                <button
                  onClick={() => isProduction ? startProductionGate(status.environment_id) : directToggle(status.environment_id)}
                  disabled={isGateActive || activeEnvId === status.environment_id}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${status.is_enabled 
                    ? isProduction ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                    : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${status.is_enabled ? 'translate-x-[24px]' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* TWO-STAGE GATE UI */}
              {isGateActive && (
                <div className="mt-3 bg-slate-950 border border-slate-800 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {gateStage === 'auditing' ? (
                    <div className="flex items-center gap-3 py-4 justify-center">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] animate-pulse">LPU Analyzing Risk...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Risk Score & Blast Radius */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${getRiskColor(auditReport?.risk_score || 0).bg}/10 ring-1 ${getRiskColor(auditReport?.risk_score || 0).ring} flex items-center justify-center`}>
                            <span className={`text-lg font-black ${getRiskColor(auditReport?.risk_score || 0).text}`}>{auditReport?.risk_score}</span>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">AI Audit Result</p>
                            <p className={`text-xs font-bold ${getRiskColor(auditReport?.risk_score || 0).text}`}>{auditReport?.risk_level?.toUpperCase()}</p>
                          </div>
                        </div>
                        {auditReport?.live_traffic_hits !== undefined && (
                          <div className="text-right">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Blast Radius</p>
                            <p className="text-xs font-black text-blue-400">{auditReport.live_traffic_hits} Active Users</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-900 rounded-xl p-3 flex gap-3 border border-slate-800/50">
                        <Brain className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-400 leading-relaxed italic">{auditReport?.advice}</p>
                      </div>

                      {/* Decision Logic */}
                      {(auditReport?.risk_score || 0) >= 8 ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex gap-2 items-center">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <p className="text-[10px] text-red-400 font-black uppercase tracking-tight">Security Lock Engaged — Toggle Blocked</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                           <input 
                             type="text" 
                             placeholder="Provide deployment rationale..." 
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 outline-none focus:border-blue-500 transition-colors"
                             value={gateReason}
                             onChange={(e) => setGateReason(e.target.value)}
                           />
                           <div className="flex gap-2">
                             <button onClick={resetGate} className="flex-1 py-3 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-900 rounded-xl transition-colors">Abort</button>
                             <button 
                               onClick={finalizeDeployment}
                               className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-[10px] font-black uppercase text-white shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                             >
                               <Rocket className="w-3.5 h-3.5" /> Finalize Deployment
                             </button>
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-[10px] text-red-400 font-bold leading-tight uppercase">{error}</p>
        </div>
      )}
    </div>
  );
}
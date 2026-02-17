"use client";

import React from 'react';
import { Clock, ShieldAlert, Brain, Zap, Info, Loader2 } from 'lucide-react';

interface AuditEntry {
  id: number;
  flag_id: number;
  flag_key: string;
  env_name: string;
  action: string;
  reason: string;
  ai_metadata: {
    risk_score: number;
    advice: string;
    risk_level: string;
    status?: string;
    live_traffic_hits?: number;
  } | null;
  timestamp: string;
}

interface AuditLogProps {
  logData: AuditEntry[];
  isSyncing: boolean;
}

/**
 * OPTIMIZED AUDIT LOG
 * Statelessly renders the event stream provided by the parent Dashboard pulse.
 * Fulfills: Real-time observability and AI audit transparency.
 */
export default function AuditLog({ logData, isSyncing }: AuditLogProps) {

  const getActionStyle = (action: string) => {
    if (action.includes('ON')) return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    if (action.includes('OFF')) return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
    if (action.includes('BLOCK')) return 'bg-red-500/10 text-red-500 border border-red-500/20 font-black shadow-[0_0_10px_rgba(239,68,68,0.2)]';
    return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
  };

  // Initial Loading State
  if (isSyncing && logData.length === 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-3xl p-6 h-[800px] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">
          Synchronizing Ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-3xl p-6 h-[800px] flex flex-col shadow-2xl overflow-hidden">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-5">
        <h2 className="text-xl font-black flex items-center gap-3 text-white tracking-tight">
          <Clock className="w-6 h-6 text-blue-500" />
          Safety Ledger
        </h2>
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
          ) : (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
          <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black">
            {isSyncing ? 'Uplink Busy' : 'Live Stream'}
          </span>
        </div>
      </div>

      {/* Log Container */}
      <div className="space-y-4 overflow-y-auto pr-3 custom-scrollbar flex-1 pb-10">
        {logData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center text-slate-600">
            <Info className="w-10 h-10 mb-4 opacity-10" />
            <p className="text-xs uppercase font-black tracking-widest leading-relaxed">
              Inference Void<br />
              <span className="text-[10px] text-slate-700 font-medium">No system events detected.</span>
            </p>
          </div>
        ) : (
          logData.map((log) => (
            <div key={log.id} className="group relative p-5 rounded-2xl bg-[#020617]/80 border border-slate-800/50 hover:border-blue-500/30 transition-all duration-500 animate-in fade-in slide-in-from-right-4">
              
              {/* Action Badge & Timestamp */}
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-tighter shadow-sm border ${getActionStyle(log.action)}`}>
                  {log.action}
                </span>
                <span className="text-[10px] font-mono text-slate-700 font-bold tabular-nums">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {/* Target Data */}
              <div className="mb-4">
                <p className="text-sm text-slate-100 font-black flex items-center gap-2 tracking-tight group-hover:text-blue-400 transition-colors">
                  <Zap className="w-3 h-3 text-blue-500" />
                  {log.flag_key || `FLAG_${log.flag_id}`}
                </p>
                <div className="flex items-center gap-4 mt-1.5">
                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
                    Cluster: <span className="text-slate-400">{log.env_name}</span>
                  </p>
                  {log.ai_metadata?.live_traffic_hits !== undefined && (
                    <div className="flex items-center gap-1">
                       <div className="w-1 h-1 rounded-full bg-blue-500" />
                       <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
                          Impact: <span className="text-blue-500 font-black">{log.ai_metadata.live_traffic_hits}</span>
                       </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Context (Reason) */}
              <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/30 mb-4">
                <p className="text-[11px] text-slate-500 italic leading-relaxed">
                  <span className="text-slate-700 not-italic font-black uppercase tracking-tighter mr-2 text-[9px]">Justification:</span>
                  &quot;{log.reason}&quot;
                </p>
              </div>

              {/* Neural Insight (AI Metadata) */}
              {log.ai_metadata && (
                <div className={`pt-4 border-t space-y-3 ${log.ai_metadata.risk_score >= 8 ? 'border-red-500/30' : 'border-slate-800/60'}`}>
                  
                  {/* Score HUD */}
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={`w-3.5 h-3.5 ${log.ai_metadata.risk_score >= 8 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${log.ai_metadata.risk_score >= 8 ? 'text-red-500' : 'text-emerald-500'}`}>
                      AI Integrity Score: {log.ai_metadata.risk_score}/10
                    </span>
                  </div>

                  {/* Groq Advice Text */}
                  <div className={`p-3.5 rounded-2xl flex items-start gap-3 border ${
                    log.ai_metadata.risk_score >= 8 
                      ? 'bg-red-500/5 border-red-500/10' 
                      : 'bg-slate-900/60 border-slate-800'
                  }`}>
                    <Brain className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${log.ai_metadata.risk_score >= 8 ? 'text-red-400' : 'text-purple-400'}`} />
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                      {log.ai_metadata.advice}
                    </p>
                  </div>

                  {/* Fall-safe Badge */}
                  {log.ai_metadata.status === 'fail-safe' && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/5 border border-amber-500/10 rounded-md">
                      <span className="text-[8px] text-amber-500 font-black uppercase tracking-tighter italic">
                        ⚠ Heuristic Override (AI Offline)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Bottom Fade Gradient to signify scrolling */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" />
    </div>
  );
}
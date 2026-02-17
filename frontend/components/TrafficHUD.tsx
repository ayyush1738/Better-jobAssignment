"use client";

import React from 'react';
import { Activity, Flame, BarChart3, Radio, AlertTriangle } from 'lucide-react';

interface TrafficEntry {
  key: string;
  hits: number;
}

interface TrafficHUDProps {
  trafficData: TrafficEntry[];
  isSyncing: boolean;
}

/**
 * OPTIMIZED TRAFFIC HUD
 * Receives telemetry via props to prevent API redundant polling.
 * Fulfills: Real-time Blast Radius visualization.
 */
export default function TrafficHUD({ trafficData, isSyncing }: TrafficHUDProps) {
  
  // Calculate total hits from the provided prop
  const totalHits = trafficData.reduce((sum, t) => sum + t.hits, 0);

  /**
   * BLAST RADIUS CLASSIFICATION
   * Logic: If a single feature controls >50% of traffic, it is CRITICAL.
   */
  const getBlastLevel = (hits: number) => {
    const pct = totalHits > 0 ? (hits / totalHits) * 100 : 0;
    if (pct >= 50) return { level: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500', barBg: 'bg-red-500/80', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' };
    if (pct >= 25) return { level: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-400', barBg: 'bg-orange-400/80', glow: 'shadow-[0_0_10px_rgba(251,146,60,0.2)]' };
    if (pct >= 10) return { level: 'MODERATE', color: 'text-yellow-400', bg: 'bg-yellow-400', barBg: 'bg-yellow-400/80', glow: '' };
    return { level: 'LOW', color: 'text-emerald-400', bg: 'bg-emerald-400', barBg: 'bg-emerald-400/80', glow: '' };
  };

  // Loading State (Initial mount only)
  if (isSyncing && trafficData.length === 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-3xl p-6 h-[400px] flex flex-col justify-center items-center">
         <Activity className="w-8 h-8 text-slate-700 animate-pulse mb-4" />
         <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Awaiting Pulse...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-3xl p-6 shadow-2xl">
      
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Blast Radius HUD</h3>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black">Infra Telemetry</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-slate-950/50 rounded-lg border border-slate-800">
          <Radio className={`w-3 h-3 text-blue-500 ${isSyncing ? 'animate-ping' : ''}`} />
          <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black">
            {isSyncing ? 'Syncing' : 'Sync Stable'}
          </span>
        </div>
      </div>

      {/* Hero Metric: Total System Hits */}
      <div className="flex items-center justify-between p-5 bg-[#020617]/80 rounded-2xl border border-slate-800/50 mb-6 group hover:border-blue-500/30 transition-all duration-300">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Evaluations</span>
        </div>
        <span className="text-3xl font-black text-white tabular-nums tracking-tighter">
          {totalHits.toLocaleString()}
        </span>
      </div>

      {/* Traffic Intensity Feed */}
      {trafficData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-700">
          <Flame className="w-10 h-10 mb-4 opacity-10" />
          <p className="text-[10px] uppercase font-black tracking-[0.2em]">Zero Data Points</p>
          <p className="text-[9px] mt-1 italic">Waiting for feature evaluations...</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
          {trafficData
            .sort((a, b) => b.hits - a.hits)
            .map((entry) => {
              const pct = totalHits > 0 ? Math.round((entry.hits / totalHits) * 100) : 0;
              const blast = getBlastLevel(entry.hits);
              
              return (
                <div
                  key={entry.key}
                  className={`p-4 bg-[#020617]/60 rounded-2xl border border-slate-800/50 transition-all duration-300 ${blast.glow}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {entry.key}
                      </span>
                      {pct >= 40 && <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${blast.color}`}>
                        {blast.level}
                      </span>
                      <span className="text-sm font-black text-white tabular-nums">{entry.hits.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/30">
                    <div
                      className={`absolute inset-y-0 left-0 ${blast.barBg} rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_10px_currentColor]`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-2">
                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Impact Factor</span>
                    <span className={`text-[10px] font-black tabular-nums ${blast.color}`}>{pct}%</span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
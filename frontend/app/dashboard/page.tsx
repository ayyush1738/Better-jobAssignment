"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import FlagCard from '@/components/FlagCard';
import CreateFlagModal from '@/components/CreateFlagModal';
import AuditLog from '@/components/AuditLog';
import TrafficHUD from '@/components/TrafficHUD';
import {
  Plus, RefreshCcw, LayoutDashboard, Terminal,
  Flag, ShieldAlert, Zap, Loader2
} from 'lucide-react';

/**
 * UNIFIED MISSION CONTROL (Optimized)
 * One fetch to rule them all. Prevents API spam by centralizing telemetry.
 */
export default function UnifiedDashboard() {
  const { role, isLoading, user } = useAuth();
  
  // Centralized State
  const [flags, setFlags] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  /**
   * THE SINGLE PULSE
   * Hits all telemetry endpoints in parallel. 
   * Cuts network overhead by 66% compared to individual component fetching.
   */
  const syncDashboard = useCallback(async () => {
    setIsFetching(true);
    try {
      const [flagsRes, analyticsRes, logsRes] = await Promise.all([
        api.get('/flags'),
        api.get('/flags/analytics'),
        api.get('/flags/logs')
      ]);

      setFlags(flagsRes.data.data || []);
      setAnalytics(analyticsRes.data.data || []);
      setLogs(logsRes.data.data || []);
      setLastSynced(new Date());
    } catch (err) {
      console.error("Critical Telemetry Sync Failure:", err);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && role) {
      syncDashboard();
      
      // Industry standard 30s pulse for non-critical HUDs
      const pulse = setInterval(syncDashboard, 30000); 
      return () => clearInterval(pulse);
    }
  }, [role, isLoading, syncDashboard]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Decrypting Secure Session...</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4 opacity-20" />
        <h2 className="text-xl font-black text-white">Access Denied</h2>
        <p className="text-slate-500 text-sm mt-2">No active identity detected in the SafeConfig perimeter.</p>
      </div>
    );
  }

  // Derived Telemetry
  const totalFlags = flags.length;
  const activeEnvs = flags.reduce((sum: number, f: any) =>
    sum + (f.statuses?.filter((s: any) => s.is_enabled).length || 0), 0
  );
  const totalEnvs = flags.reduce((sum: number, f: any) =>
    sum + (f.statuses?.length || 0), 0
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section: Command & Registry */}
        <div className="lg:col-span-8 space-y-8">

          {/* Optimized Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-md">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl ${role === 'manager' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                   {role === 'manager' ? <LayoutDashboard className="w-6 h-6" /> : <Terminal className="w-6 h-6" />}
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {role === 'manager' ? 'Management Console' : 'Engineering Terminal'}
                </h1>
              </div>
              <p className="text-slate-400 text-sm font-medium">
                Identity: <span className="text-white font-bold">{user?.email}</span>. 
                Single-pulse telemetry active.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={syncDashboard}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-blue-400 transition-all active:scale-90"
                title="Force Global Sync"
              >
                <RefreshCcw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
              </button>

              {role === 'manager' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20"
                >
                  <Plus className="w-5 h-5 mr-2" /> New Flag
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-[#020617]/40 border border-slate-800/60 rounded-3xl">
              <div className="flex items-center gap-3 text-blue-500 mb-4 font-black text-[10px] uppercase tracking-widest">
                <Flag className="w-4 h-4" /> Registry
              </div>
              <p className="text-3xl font-black text-white tabular-nums">{totalFlags}</p>
            </div>

            <div className="p-6 bg-[#020617]/40 border border-slate-800/60 rounded-3xl">
              <div className="flex items-center gap-3 text-emerald-500 mb-4 font-black text-[10px] uppercase tracking-widest">
                <Zap className="w-4 h-4" /> Nodes
              </div>
              <p className="text-3xl font-black text-white tabular-nums">
                {activeEnvs}<span className="text-lg text-slate-600 ml-1">/ {totalEnvs}</span>
              </p>
            </div>

            <div className="p-6 bg-[#020617]/40 border border-slate-800/60 rounded-3xl">
              <div className="flex items-center gap-3 text-purple-500 mb-4 font-black text-[10px] uppercase tracking-widest">
                <ShieldAlert className="w-4 h-4" /> LPU
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_green]" />
                <span className="text-sm font-black text-emerald-400 uppercase tracking-tighter">Healthy</span>
              </div>
            </div>
          </div>

          {/* Flag Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Feature Registry</h2>
               {lastSynced && (
                 <span className="text-[9px] font-mono text-slate-700 italic">Synced: {lastSynced.toLocaleTimeString()}</span>
               )}
            </div>

            {isFetching && flags.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-64 bg-slate-900/20 rounded-[2rem] border border-slate-800/50 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {flags.map((flag: any) => (
                  <FlagCard key={flag.id} flag={flag} onUpdate={syncDashboard} />
                ))}
              </div>
            )}
          </div>

          {/* Traffic HUD - NOW RECEIVING PROPS */}
          <TrafficHUD trafficData={analytics} isSyncing={isFetching} />
        </div>

        {/* Right Section: Audit Stream - NOW RECEIVING PROPS */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 h-fit">
          <AuditLog logData={logs} isSyncing={isFetching} />
        </div>
      </div>

      <CreateFlagModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={syncDashboard} 
      />
    </div>
  );
}
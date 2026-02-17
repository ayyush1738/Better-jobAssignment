"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import TrafficHUD from '@/components/TrafficHUD';
import { 
  Activity, 
  BarChart3, 
  Globe, 
  Flame, 
  RefreshCcw, 
  TrendingUp, 
  ShieldAlert,
  Loader2 
} from 'lucide-react';

interface TrafficEntry {
    key: string;
    hits: number;
}

interface AuditEntry {
    action: string;
    ai_metadata: { risk_score: number } | null;
}

export default function AnalyticsPage() {
    const { role, isLoading } = useAuth();
    const [traffic, setTraffic] = useState<TrafficEntry[]>([]);
    const [auditStats, setAuditStats] = useState({ total: 0, blocks: 0, toggles: 0 });
    const [fetching, setFetching] = useState(true);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);

    /**
     * UNIFIED DATA FETCH
     * Aggregates traffic hits and audit logs to compute system performance.
     */
    const fetchData = useCallback(async () => {
        setFetching(true);
        try {
            const [trafficRes, logsRes] = await Promise.all([
                api.get('/flags/analytics'),
                api.get('/flags/logs'),
            ]);

            const trafficData = trafficRes.data.data || [];
            const logsData: AuditEntry[] = logsRes.data.data || [];

            setTraffic(trafficData);
            setAuditStats({
                total: logsData.length,
                blocks: logsData.filter(l => l.action.includes('BLOCK')).length,
                toggles: logsData.filter(l => l.action.includes('TOGGLE')).length,
            });
            setLastSynced(new Date());
        } catch (err) {
            console.error("Analytics fetch failure:", err);
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading && role) {
            fetchData();
            const pulse = setInterval(fetchData, 20000);
            return () => clearInterval(pulse);
        }
    }, [role, isLoading, fetchData]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Synchronizing Telemetry...</p>
            </div>
        );
    }

    if (!role) return <div className="p-20 text-center font-black text-slate-700 uppercase tracking-widest">Unauthorized Access Detected.</div>;

    const totalHits = traffic.reduce((sum, t) => sum + t.hits, 0);
    const sortedTraffic = [...traffic].sort((a, b) => b.hits - a.hits);
    const topFlag = sortedTraffic[0];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Navbar />

            <div className="space-y-8 mt-6">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-md">
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                            <Activity className="text-blue-500 w-8 h-8" />
                            Intelligence Oversight
                        </h1>
                        <p className="text-slate-400 text-sm font-medium mt-2">
                            Real-time blast radius computation and AI safety intervention metrics.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {lastSynced && (
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Last Intelligence Sync</span>
                                <span className="text-[10px] font-mono text-blue-400">
                                    {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </div>
                        )}
                        <button 
                            onClick={fetchData} 
                            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-blue-400 transition-all active:scale-90"
                        >
                            <RefreshCcw className={`w-5 h-5 ${fetching ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-8 bg-[#020617]/40 border border-slate-800/60 rounded-[2rem] hover:border-blue-500/30 transition-all group">
                        <div className="flex items-center gap-2 text-blue-400 mb-4 font-black text-[10px] uppercase tracking-[0.2em]">
                            <BarChart3 className="w-4 h-4" /> Global Hits
                        </div>
                        <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{totalHits.toLocaleString()}</p>
                    </div>

                    <div className="p-8 bg-[#020617]/40 border border-slate-800/60 rounded-[2rem] hover:border-emerald-500/30 transition-all group">
                        <div className="flex items-center gap-2 text-emerald-400 mb-4 font-black text-[10px] uppercase tracking-[0.2em]">
                            <TrendingUp className="w-4 h-4" /> Active Nodes
                        </div>
                        <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{traffic.length}</p>
                    </div>

                    <div className="p-8 bg-[#020617]/40 border border-slate-800/60 rounded-[2rem] hover:border-purple-500/30 transition-all group">
                        <div className="flex items-center gap-2 text-purple-400 mb-4 font-black text-[10px] uppercase tracking-[0.2em]">
                            <Globe className="w-4 h-4" /> Operations
                        </div>
                        <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{auditStats.toggles}</p>
                    </div>

                    <div className="p-8 bg-red-500/[0.03] border border-red-500/20 rounded-[2rem] hover:border-red-500/40 transition-all group">
                        <div className="flex items-center gap-2 text-red-500 mb-4 font-black text-[10px] uppercase tracking-[0.2em]">
                            <ShieldAlert className="w-4 h-4" /> AI Blocks
                        </div>
                        <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{auditStats.blocks}</p>
                    </div>
                </div>

                {/* Primary Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Traffic Distribution HUD */}
                    <div className="lg:col-span-7">
                        {/* FIX APPLIED HERE: Passing the required telemetry props */}
                        <TrafficHUD trafficData={traffic} isSyncing={fetching} />
                    </div>

                    <div className="lg:col-span-5 space-y-8">
                        {/* Top Flag Spotlight */}
                        {topFlag && (
                            <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-[2.5rem] p-8 shadow-xl">
                                <div className="flex items-center gap-2 mb-6">
                                    <Flame className="w-5 h-5 text-blue-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Critical Exposure Flag</span>
                                </div>
                                <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{topFlag.key}</h3>
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-400 text-sm font-bold">{topFlag.hits.toLocaleString()} total hits</span>
                                    <div className="px-3 py-1 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest">
                                        {totalHits > 0 ? Math.round((topFlag.hits / totalHits) * 100) : 0}% Impact
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Traffic Distribution Bar Chart */}
                        <div className="bg-[#020617]/40 border border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md">
                            <h3 className="text-xs font-black text-slate-400 mb-8 uppercase tracking-[0.3em]">Blast Radius Distribution</h3>
                            <div className="space-y-6">
                                {sortedTraffic.slice(0, 5).map((entry) => {
                                    const pct = totalHits > 0 ? Math.round((entry.hits / totalHits) * 100) : 0;
                                    return (
                                        <div key={entry.key} className="group">
                                            <div className="justify-between items-center mb-2 flex">
                                                <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-blue-400 transition-colors">{entry.key}</span>
                                                <span className="text-[10px] text-slate-500 font-black tabular-nums">{pct}%</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
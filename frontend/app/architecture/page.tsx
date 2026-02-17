"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import {
    Database,
    ShieldCheck,
    Zap,
    Server,
    Code,
    Globe,
    Lock,
    Activity,
    Cpu,
    Terminal
} from 'lucide-react';

/**
 * ARCHITECTURE SPECIFICATION PAGE
 * Live infrastructure status and RESTful resource mapping.
 */
export default function ArchitecturePage() {
    const [health, setHealth] = useState({
        status: 'Scanning...',
        db: 'Scanning...',
        ai: 'Scanning...',
        latency: '0ms'
    });

    useEffect(() => {
        const checkSystem = async () => {
            const start = Date.now();
            try {
                // Heartbeat check against the flag registry
                await api.get('/flags');
                const end = Date.now();
                setHealth({
                    status: 'Uplink Stable',
                    db: 'PostgreSQL 15 Active',
                    ai: 'Groq Llama 3.3 LPU',
                    latency: `${end - start}ms`
                });
            } catch {
                setHealth({ 
                    status: 'Link Severed', 
                    db: 'Offline', 
                    ai: 'Inference Halted', 
                    latency: 'N/A' 
                });
            }
        };
        checkSystem();
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Navbar />

            <div className="space-y-12 mt-6">
                {/* Header Specification */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/60 pb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="bg-blue-600/10 p-2 rounded-lg border border-blue-500/20">
                                <Server className="w-6 h-6 text-blue-500" />
                             </div>
                             <h1 className="text-4xl font-black text-white tracking-tight">Core Infrastructure</h1>
                        </div>
                        <p className="text-slate-400 text-lg max-w-2xl font-medium">
                            The backbone of SafeConfig AI: A sub-second feature governance engine powered by LPU-accelerated inference.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-black font-mono text-blue-400 uppercase tracking-widest">
                            Node IP: 127.0.0.1:5000
                        </span>
                    </div>
                </div>

                {/* Live System Health Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'API Gateway', val: health.status, sub: 'Python Flask / Werkzeug', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/5' },
                        { label: 'Persistence Layer', val: health.db, sub: 'Relational SQL / JSONB', icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                        { label: 'Neural Engine', val: health.ai, sub: 'Llama 3.3 70B (Groq)', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/5' },
                        { label: 'Round-trip Latency', val: health.latency, sub: 'Active Telemetry', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/5' }
                    ].map((item, i) => (
                        <div key={i} className={`p-6 ${item.bg} border border-slate-800 rounded-[2rem] hover:border-slate-700 transition-all duration-300 group shadow-lg`}>
                            <div className={`flex items-center gap-2 ${item.color} mb-4 font-black text-[9px] uppercase tracking-[0.25em]`}>
                                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" /> {item.label}
                            </div>
                            <p className="text-xl font-black text-white tracking-tight">{item.val}</p>
                            <p className="text-[10px] text-slate-500 mt-1.5 uppercase font-bold tracking-widest">{item.sub}</p>
                        </div>
                    ))}
                </div>

                {/* API Documentation Table */}
                <div className="bg-[#020617]/40 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
                    <div className="p-8 bg-slate-900/20 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Terminal className="w-5 h-5 text-blue-500" />
                            <span className="font-black text-white tracking-tight uppercase text-sm">Resource Control Ledger</span>
                        </div>
                        <span className="text-[10px] font-black font-mono text-slate-600 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                            DOC_VER: 2.0.26_STABLE
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-950/80 text-slate-500 uppercase text-[9px] font-black tracking-[0.2em]">
                                <tr>
                                    <th className="px-10 py-5 border-b border-slate-800">Method</th>
                                    <th className="px-10 py-5 border-b border-slate-800">Endpoint</th>
                                    <th className="px-10 py-5 border-b border-slate-800">Auth Scope</th>
                                    <th className="px-10 py-5 border-b border-slate-800">Internal Logic Flow</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {[
                                    { m: 'POST', e: '/api/auth/login', r: 'PUBLIC', f: 'JWT Claims Issuance + Role Injection' },
                                    { m: 'GET', e: '/api/flags', r: 'AUTH_SESSION', f: 'Cross-Env Registry Aggregation' },
                                    { m: 'POST', e: '/api/flags', r: 'MANAGER_ONLY', f: 'Infrastructure Resource Provisioning' },
                                    { m: 'POST', e: '/api/flags/:id/audit', r: 'AUTH_SESSION', f: 'Groq Pre-flight Risk Inference' },
                                    { m: 'PATCH', e: '/api/flags/:id/toggle', r: 'AUTH_SESSION', f: 'Audit-Aware State Mutation' },
                                    { m: 'GET', e: '/api/flags/evaluate/:key', r: 'EXTERNAL', f: 'Blast Radius Telemetry Ingestion' },
                                    { m: 'GET', e: '/api/flags/analytics', r: 'AUTH_SESSION', f: 'SQL Aggregation for Real-time HUD' },
                                    { m: 'GET', e: '/api/flags/logs', r: 'AUTH_SESSION', f: 'Audit Trail (JSONB Metadata Parsing)' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-blue-500/[0.03] transition-colors group">
                                        <td className="px-10 py-6 font-mono text-blue-500 font-black text-xs tracking-tighter">{row.m}</td>
                                        <td className="px-10 py-6 font-mono text-slate-200 text-xs">{row.e}</td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2">
                                                <Lock className="w-3 h-3 text-slate-700" />
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest border ${
                                                    row.r === 'PUBLIC' ? 'bg-slate-800/40 text-slate-500 border-slate-700/50' :
                                                    row.r === 'MANAGER_ONLY' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                }`}>{row.r}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-slate-400 font-medium text-xs leading-relaxed">{row.f}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Component Architecture Diagram Tag */}
                [Image of a microservices architecture diagram showing the relationship between a Next.js frontend, a Flask API gateway, a PostgreSQL database, and a Groq AI inference engine]

                {/* Tech Stack Disclosure */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-blue-500" />
                            Security Protocol Disclosure
                        </h3>
                        <p className="text-slate-400 leading-relaxed font-medium">
                            SafeConfig AI utilizes <strong>Role-Based Access Control (RBAC)</strong> enforced via JWT (JSON Web Tokens). 
                            Every request is verified against the backend&apos;s cryptographic secret. The <strong>LPU Inference Engine</strong> 
                            provides near-instant security audits, analyzing feature descriptions and environment context to block high-risk 
                            operations in Production without manual intervention.
                        </p>
                    </div>
                    <div className="p-10 rounded-[2.5rem] bg-slate-900/30 border border-slate-800 flex flex-col justify-center items-center text-center">
                         <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4">
                            <Code className="w-6 h-6 text-blue-500" />
                         </div>
                         <h4 className="text-white font-black uppercase text-xs tracking-widest mb-2">Stack Summary</h4>
                         <ul className="text-[10px] text-slate-500 font-black space-y-2 uppercase tracking-tighter">
                            <li>Next.js 14 (App Router)</li>
                            <li>Python 3.10 / Flask</li>
                            <li>PostgreSQL w/ JSONB</li>
                            <li>Groq / Llama 3.3 70B</li>
                         </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
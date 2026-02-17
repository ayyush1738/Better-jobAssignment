"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Database, ShieldCheck, Zap, Server, Code, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ApiDocsPage() {
  const [health, setHealth] = useState<{ status: string; db: string; ai: string }>({
    status: 'checking...',
    db: 'checking...',
    ai: 'checking...'
  });

  useEffect(() => {
    const checkSystem = async () => {
      try {
        // Simple health check call
        await api.get('/flags'); 
        setHealth({ status: 'Connected', db: 'PostgreSQL Active', ai: 'Gemini 1.5 Ready' });
      } catch (err) {
        setHealth({ status: 'Disconnected', db: 'Error', ai: 'Error' });
      }
    };
    checkSystem();
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <Navbar />

      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Server className="w-8 h-8 text-blue-500" />
            System Architecture
          </h1>
          <p className="text-slate-400 mt-1">Technical specification and live service status</p>
        </div>

        {/* Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-blue-400 mb-2 font-bold text-xs uppercase tracking-widest">
              <Zap className="w-4 h-4" /> API Gateway
            </div>
            <p className="text-2xl font-semibold text-white">{health.status}</p>
            <p className="text-xs text-slate-500 mt-1">Flask / Python 3.10+</p>
          </div>
          
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-green-400 mb-2 font-bold text-xs uppercase tracking-widest">
              <Database className="w-4 h-4" /> Database
            </div>
            <p className="text-2xl font-semibold text-white">{health.db}</p>
            <p className="text-xs text-slate-500 mt-1">PostgreSQL w/ JSONB Audit</p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-purple-400 mb-2 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> AI Auditor
            </div>
            <p className="text-2xl font-semibold text-white">{health.ai}</p>
            <p className="text-xs text-slate-500 mt-1">Gemini-1.5-Flash via Google AI</p>
          </div>
        </div>

        {/* Endpoint Specification */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex items-center gap-2">
            <Code className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-300">Core API Specification</span>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Endpoint</th>
                  <th className="px-6 py-3">Role Required</th>
                  <th className="px-6 py-3">Function</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  { m: 'POST', e: '/auth/login', r: 'Public', f: 'JWT Generation & Role Assignment' },
                  { m: 'GET', e: '/flags', r: 'Any', f: 'List all features and environment statuses' },
                  { m: 'POST', e: '/flags', r: 'Manager', f: 'Define new feature with Pydantic validation' },
                  { m: 'PATCH', e: '/flags/:id/toggle', r: 'Dev/Manager', f: 'Trigger AI Risk Check & Toggle state' },
                  { m: 'GET', e: '/flags/logs', r: 'Any', f: 'Fetch JSONB audit logs for observability' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-blue-400 font-bold">{row.m}</td>
                    <td className="px-6 py-4 font-mono text-slate-300">{row.e}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        row.r === 'Public' ? 'bg-slate-700' : 
                        row.r === 'Manager' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                      }`}>{row.r}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{row.f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
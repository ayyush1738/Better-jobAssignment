"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Clock, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuditEntry {
  id: number;
  flag_id: number;
  env_name: string;
  action: string;
  reason: string;
  ai_metadata: any;
  timestamp: string;
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      // In a real app, you'd create a specific endpoint for logs. 
      // For this MVP, we can fetch all flags and their logs if needed, 
      // but let's assume you have a /api/flags/logs endpoint.
      const res = await api.get('/flags'); // Assuming backend returns list
      // For now, we'll simulate or fetch from a dedicated endpoint if you added it
      // setLogs(res.data); 
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // In a professional app, we might use WebSockets, 
    // but for the demo, fetching on mount is perfect.
    fetchLogs();
  }, []);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Audit Trail
        </h2>
        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Live Activity</span>
      </div>

      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <p className="text-slate-500 text-sm italic">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No recent activity detected.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                  log.action.includes('ON') ? 'bg-green-500/10 text-green-500' : 
                  log.action.includes('OFF') ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-red-500/10 text-red-500'
                }`}>
                  {log.action}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <p className="text-sm text-slate-300">
                <span className="text-blue-400 font-mono">#{log.flag_id}</span> in 
                <span className="text-slate-100 font-medium ml-1">{log.env_name}</span>
              </p>

              <p className="text-xs text-slate-500 italic">"{log.reason}"</p>

              {log.ai_metadata && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-3 h-3 text-purple-400" />
                  <span className="text-[10px] text-purple-300 uppercase font-bold tracking-tighter">
                    AI Verified (Risk: {log.ai_metadata.risk_score}/10)
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
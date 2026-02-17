"use client";

import React, { useState } from 'react';
import api from '@/lib/api';
import { ShieldCheck, ShieldAlert, Globe, Beaker, Terminal, Loader2, AlertTriangle } from 'lucide-react';

interface EnvStatus {
  environment_name: string;
  environment_id: number;
  is_enabled: boolean;
}

interface Flag {
  id: number;
  name: string;
  key: string;
  description: string;
  statuses: EnvStatus[];
}

export default function FlagCard({ flag, onUpdate }: { flag: Flag, onUpdate: () => void }) {
  const [loadingEnvId, setLoadingEnvId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (envId: number, currentStatus: boolean) => {
    const reason = window.prompt(`Reason for toggling ${flag.key}? (Required for Audit)`);
    
    if (!reason || reason.length < 5) {
      alert("A valid reason (min 5 chars) is required to proceed.");
      return;
    }

    setLoadingEnvId(envId);
    setError(null);

    try {
      // Hits PATCH /api/flags/<id>/toggle
      await api.patch(`/flags/${flag.id}/toggle`, {
        environment_id: envId,
        reason: reason
      });
      onUpdate(); // Refresh parent data
    } catch (err: any) {
      // This is where we catch the AI BLOCK (403)
      const msg = err.response?.data?.error || "Update failed";
      setError(msg);
    } finally {
      setLoadingEnvId(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {flag.name}
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">
              {flag.key}
            </span>
          </h3>
          <p className="text-sm text-slate-400 mt-1 line-clamp-1">{flag.description}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 animate-in slide-in-from-top-1">
          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400 leading-tight">
            <span className="font-bold uppercase block mb-1">Safety Guardrail Active</span>
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {flag.statuses.map((status) => (
          <div 
            key={status.environment_id}
            className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/50"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                status.environment_name === 'Production' ? 'bg-red-500/10 text-red-500' :
                status.environment_name === 'Staging' ? 'bg-amber-500/10 text-amber-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                {status.environment_name === 'Production' ? <Globe className="w-4 h-4" /> : 
                 status.environment_name === 'Staging' ? <Beaker className="w-4 h-4" /> : 
                 <Terminal className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-tighter">
                  {status.environment_name}
                </p>
                <p className="text-[10px] text-slate-500 italic">
                  Currently: {status.is_enabled ? 'Active' : 'Disabled'}
                </p>
              </div>
            </div>

            <button
              disabled={loadingEnvId === status.environment_id}
              onClick={() => handleToggle(status.environment_id, status.is_enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                status.is_enabled ? 'bg-green-600' : 'bg-slate-700'
              }`}
            >
              <span className="sr-only">Toggle feature</span>
              {loadingEnvId === status.environment_id ? (
                <Loader2 className="w-3 h-3 animate-spin mx-auto text-white" />
              ) : (
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    status.is_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import FlagCard from '@/components/FlagCard';
import AuditLog from '@/components/AuditLog';
import { RefreshCcw, Code2, Terminal } from 'lucide-react';

export default function DeveloperDashboard() {
  const { role, isLoading } = useAuth();
  const [flags, setFlags] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchFlags = async () => {
    setIsFetching(true);
    try {
      const res = await api.get('/flags');
      setFlags(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  // Security Guard: Prevent unauthorized access to the Developer persona
  if (!isLoading && role !== 'developer' && role !== 'manager') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold text-red-500">Unauthorized</h1>
        <p className="text-slate-400 mt-2">You must assume the Developer persona to access these environment toggles.</p>
        <button onClick={() => window.location.href = '/'} className="mt-4 text-blue-500 underline">Switch Persona</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Navbar />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Toggle Operations */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Code2 className="w-8 h-8 text-green-500" />
                Engineering Console
              </h1>
              <p className="text-slate-400 mt-1 text-sm">Deploy and toggle features with real-time AI risk auditing</p>
            </div>
            
            <button 
              onClick={fetchFlags}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              Sync Flags
            </button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isFetching && flags.length === 0 ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800" />
              ))
            ) : flags.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                <Terminal className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-mono text-sm">No active feature deployments found.</p>
              </div>
            ) : (
              flags.map((flag: any) => (
                <FlagCard key={flag.id} flag={flag} onUpdate={fetchFlags} />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Observability Feed */}
        <div className="lg:col-span-4 h-[calc(100vh-200px)] sticky top-6">
          <AuditLog />
        </div>

      </div>
    </div>
  );
}
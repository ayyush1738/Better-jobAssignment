"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import FlagCard from '@/components/FlagCard';
import CreateFlagModal from '@/components/CreateFlagModal';
import AuditLog from '@/components/AuditLog';
import { Plus, RefreshCcw, LayoutDashboard, Database } from 'lucide-react';

export default function ManagerDashboard() {
  const { role, isLoading } = useAuth();
  const [flags, setFlags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Security Guard: Prevent flashing the dashboard if the user isn't a Manager
  if (!isLoading && role !== 'manager') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-slate-400 mt-2">Only authorized Managers can access this orchestration layer.</p>
        <button onClick={() => window.location.href = '/'} className="mt-4 text-blue-500 underline">Return Home</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Navbar />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Flag Management */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-blue-500" />
                Feature Management
              </h1>
              <p className="text-slate-400 mt-1 text-sm">Orchestrate and define safety-first toggles</p>
            </div>
            
            <div className="flex gap-2">
                <button 
                  onClick={fetchFlags}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
                >
                  <RefreshCcw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-5 h-5" />
                  Define Feature
                </button>
            </div>
          </div>

          {/* Flags Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isFetching && flags.length === 0 ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800" />
              ))
            ) : flags.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <Database className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500">No feature flags found. Start by creating one.</p>
              </div>
            ) : (
              flags.map((flag: any) => (
                <FlagCard key={flag.id} flag={flag} onUpdate={fetchFlags} />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Live Observability */}
        <div className="lg:col-span-4 h-[calc(100vh-200px)] sticky top-6">
          <AuditLog />
        </div>

      </div>

      <CreateFlagModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchFlags} 
      />
    </div>
  );
}
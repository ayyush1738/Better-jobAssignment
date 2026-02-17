"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Code2,
  LogOut,
  Cpu,
  Activity,
  Server,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const { role, logout, user } = useAuth();
  const pathname = usePathname();

  // Helper to determine active link styling
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="flex items-center justify-between py-6 mb-10 border-b border-slate-800/60 bg-[#020617]/50 backdrop-blur-xl sticky top-0 z-[60] px-6">

      {/* 1. Brand Identity & Global Navigation */}
      <div className="flex items-center gap-10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">
            SafeConfig <span className="text-blue-500">AI</span>
          </span>
        </Link>

        {/* Dynamic Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              isActive('/dashboard') ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <Link
            href="/analytics"
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              isActive('/analytics') ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Analytics
          </Link>
          <Link
            href="/architecture"
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              isActive('/architecture') ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Infrastructure
          </Link>
        </div>
      </div>

      {/* 2. User Intelligence & Actions */}
      <div className="flex items-center gap-6">
        
        {/* System Health Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Groq LPU Stable</span>
        </div>

        {/* Role & Identity Badge */}
        {role && (
          <div className={`flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl border bg-[#020617] shadow-2xl transition-all ${
            role === 'manager'
              ? 'border-blue-500/30 text-blue-400'
              : 'border-emerald-500/30 text-emerald-400'
          }`}>
            <div className={`p-1.5 rounded-lg ${role === 'manager' ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}>
              {role === 'manager' ? <ShieldCheck className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{role} Console</span>
              <span className="text-[9px] text-slate-500 font-medium truncate max-w-[120px]">
                {user?.email || 'Authenticated Session'}
              </span>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="group flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300"
          title="Terminate Session"
        >
          <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </nav>
  );
}
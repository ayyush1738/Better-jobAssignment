"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Code2, LogOut, Cpu } from 'lucide-react';

export default function Navbar() {
  const { role, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between py-4 mb-8 border-b border-slate-800">
      {/* Brand Identity */}
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          SafeConfig <span className="text-blue-500">AI</span>
        </span>
      </div>

      {/* Role & Actions */}
      <div className="flex items-center gap-4">
        {role && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${
            role === 'manager' 
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
              : 'bg-green-500/10 border-green-500/30 text-green-400'
          }`}>
            {role === 'manager' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
            {role} Persona
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Exit
        </button>
      </div>
    </nav>
  );
}
"use client";

import React, { useState } from 'react';
import api from '@/lib/api';
import { X, Plus, Info, Loader2, Sparkles } from 'lucide-react';

interface CreateFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateFlagModal({ isOpen, onClose, onSuccess }: CreateFlagModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  /**
   * AUTO-FORMATTER
   * Ensures the system key is always snake_case for backend compatibility.
   */
  const handleKeyChange = (val: string) => {
    const formattedKey = val
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    setFormData({ ...formData, key: formattedKey });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // POST /api/flags - Handled by FlagService.create_new_flag in backend
      const res = await api.post('/flags', formData);
      
      if (res.data.success) {
        onSuccess(); // Refresh the list in Dashboard
        onClose();   // Close the modal
        setFormData({ name: '', key: '', description: '' }); // Reset
      }
    } catch (err: any) {
      // Catch 403 (RBAC Block), 400 (Validation), or 409 (Conflict)
      const errorMsg = err.response?.data?.message || "Provisioning failed. Check logs.";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Glassmorphic Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-[#020617] border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_80px_rgba(30,58,138,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header Section */}
        <div className="flex items-center justify-between p-8 border-b border-slate-800/50 bg-slate-900/10">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Provision Feature</h3>
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] mt-1">Infrastructure Registry</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
               {error}
            </div>
          )}

          {/* Display Name Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Friendly Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Amazon Pay Integration"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-medium"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* System Key Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">System Key (Auto-Formatted)</label>
            <div className="relative">
              <input
                required
                type="text"
                placeholder="amazon_pay_v1"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pr-12 text-blue-400 font-mono text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-800"
                value={formData.key}
                onChange={(e) => handleKeyChange(e.target.value)}
              />
              <Sparkles className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
            </div>
          </div>

          {/* Description / Intent Specification */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Context Specification</label>
            <textarea
              required
              rows={3}
              placeholder="Specify the technical intent. Our LPU-powered AI uses this for risk auditing."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700 leading-relaxed resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            
            {/* AI Warning Context */}
            <div className="flex items-center gap-3 mt-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-[10px] text-blue-400/80 leading-tight font-bold uppercase tracking-tight">
                Warning: Detailed descriptions improve AI risk accuracy for high-traffic Production toggles.
              </p>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-3 transition-all mt-4 shadow-xl shadow-blue-900/20 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Provision Feature Flag
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
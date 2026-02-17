"use client";

import React, { useState } from 'react';
import api from '@/lib/api';
import { X, Plus, Info, Loader2 } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Hits the POST /api/flags route (Protected by Manager role in backend)
      await api.post('/flags', formData);
      onSuccess(); // Refresh the list
      onClose();   // Close modal
      setFormData({ name: '', key: '', description: '' }); // Reset
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to create flag";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-xl font-semibold">Define New Feature</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
            <input
              required
              type="text"
              placeholder="e.g. New Checkout UI"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Feature Key (snake_case)</label>
            <input
              required
              type="text"
              placeholder="e.g. checkout_v2_enabled"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.key}
              onChange={(e) => setFormData({...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Intent / Description</label>
            <textarea
              rows={3}
              placeholder="Describe what this feature does. The AI will use this for risk assessment."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <p className="flex items-start gap-2 mt-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              <Info className="w-3 h-3 text-blue-500 shrink-0" />
              This description is indexed by the AI Risk Auditor.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-4"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {isSubmitting ? 'Provisioning...' : 'Create Feature Flag'}
          </button>
        </form>
      </div>
    </div>
  );
}
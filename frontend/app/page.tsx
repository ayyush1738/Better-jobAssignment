"use client";

import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Code2, Loader2, Cpu, Terminal,
  Copy, CheckCircle2, Zap, Radio, Boxes
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleLogin = async (role: 'manager' | 'developer') => {
    setLoading(role);
    try {
      const credentials = {
        email: role === 'manager' ? 'manager@safeconfig.ai' : 'dev@safeconfig.ai',
        password: 'password123'
      };
      const res = await api.post('/auth/login', credentials);
      if (res.data.success) {
        const { access_token, role: userRole, email } = res.data.data;
        login(userRole, access_token, email);
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Auth Failure:", err);
      alert("Uplink Failed. Check if Flask is running on port 5000.");
    } finally {
      setLoading(null);
    }
  };

  const sdkCode = `// lib/safeconfig.ts
export const SafeConfig = {
  isEnabled: async (key: string, fallback = false) => {
    try {
      const res = await fetch(\`http://localhost:5000/api/flags/evaluate/\${key}\`, { 
        cache: 'no-store' 
      });
      const { data } = await res.json();
      return data.enabled;
    } catch { 
      return fallback; 
    }
  }
};`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sdkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center py-20 space-y-32 px-4 max-w-7xl mx-auto text-white min-h-screen">

      {/* SECTION 1: HERO */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
          <Cpu className="w-3 h-3" /> Neural Guardrail Protocol 2.6
        </div>
        <h1 className="text-7xl font-black tracking-tighter sm:text-9xl text-white">
          SafeConfig <span className="text-blue-600">AI</span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          Traffic-Aware feature management. Audit risk and govern deployments with real-time AI inference.
        </p>
      </div>

      {/* SECTION 2: ACCESS POINTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        <button onClick={() => handleLogin('manager')} className="group p-12 border border-slate-800 rounded-[2rem] bg-slate-900/50 hover:border-blue-500/50 transition-all text-left">
          <ShieldCheck className="w-12 h-12 text-blue-500 mb-8" />
          <h2 className="text-4xl font-black">Manager</h2>
          <p className="text-slate-500 text-lg mt-4">Full authority. Manage environments and override AI blocks.</p>
        </button>

        <button onClick={() => handleLogin('developer')} className="group p-12 border border-slate-800 rounded-[2rem] bg-slate-900/50 hover:border-emerald-500/50 transition-all text-left">
          <Code2 className="w-12 h-12 text-emerald-500 mb-8" />
          <h2 className="text-4xl font-black">Developer</h2>
          <p className="text-slate-500 text-lg mt-4">Operational access. Ship code and monitor live telemetry.</p>
        </button>
      </div>

      {/* SECTION 3: DEVELOPER QUICKSTART (THE DOCUMENTATION) */}
      <div className="w-full max-w-6xl space-y-12 py-24 border-t border-slate-900">

        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Terminal className="text-blue-500 w-6 h-6" />
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.5em]">Developer Integration</h3>
          </div>
          <p className="text-slate-500 font-medium">Follow these steps to gate your first feature with AI-backed safety.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* STEP 1: THE SDK */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2">Step 1: Setup the Engine</h4>
            <div className="bg-black rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">lib/safeconfig.ts</span>
                <button onClick={copyToClipboard} className="text-slate-500 hover:text-white">
                  {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
              </div>
              <pre className="p-8 text-[12px] font-mono text-blue-300 overflow-x-auto">
                <code>{sdkCode}</code>
              </pre>
            </div>
          </div>

          {/* STEP 2: THE EXAMPLE IMPLEMENTATION */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2">Step 2: Implementation Example</h4>
            <div className="bg-black rounded-3xl border border-slate-800 overflow-hidden shadow-2xl h-full">
              <div className="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">YourComponent.tsx</span>
                <Zap size={18} className="text-emerald-500" />
              </div>
              <div className="p-8 space-y-6">
                <p className="text-slate-400 text-sm">Use this **single line** to protect your feature. It automatically triggers an AI audit and logs traffic hits:</p>

                {/* HIGHLIGHTED ONE-LINER */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl font-mono text-emerald-400 text-[13px] shadow-lg shadow-emerald-500/5">
                  const isActive = await SafeConfig.isEnabled('new-feature-key');
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <p className="text-[10px] font-black text-slate-600 uppercase mb-3">Usage in UI:</p>
                  <pre className="text-[11px] font-mono text-slate-400">
                    {`return (
  <div>
    {isActive ? <NewComponent /> : <OldComponent />}
  </div>
);`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* STEP 3: TELEMETRY NARRATIVE */}
        <div className="bg-slate-900/30 border border-slate-800 p-10 rounded-[2rem] flex flex-col md:flex-row items-center gap-10">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
            <Radio size={32} />
          </div>
          <div>
            <h4 className="text-white font-bold text-xl mb-2">Automated Telemetry Tracking</h4>
            <p className="text-slate-500 text-base leading-relaxed">
              Every time your code calls <code className="text-blue-400">isEnabled()</code>, a ping is sent to our backend. This data is used by the AI to calculate your feature's <b>Blast Radius</b> in real-time. If traffic is too high, the system prevents accidental toggles.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-20 border-t border-slate-900 w-full opacity-40">
        <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">
          SafeConfig AI • Engineered for Mission-Critical Infrastructure
        </p>
      </div>

    </div>
  );
}
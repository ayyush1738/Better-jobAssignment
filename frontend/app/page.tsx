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
      alert("Uplink Failed. Ensure Flask is running on port 5000.");
    } finally {
      setLoading(null);
    }
  };

  const sdkCode = `// lib/safeconfig.ts
export const SafeConfig = {
  isEnabled: async (key: string, fallback = false) => {
    try {
      // This GET request performs a dual action:
      // 1. Fetches the boolean state from the LPU engine.
      // 2. Registers a telemetry 'hit' to calculate Blast Radius.
      const res = await fetch(\`http://localhost:5000/api/flags/evaluate/\${key}\`, { 
        cache: 'no-store' 
      });
      const { data } = await res.json();
      return data.enabled;
    } catch { 
      return fallback; // Fail-safe: logic defaults to fallback if offline.
    }
  }
};`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sdkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center py-20 space-y-32 px-4 max-w-6xl mx-auto">
      
      {/* ── SECTION 1: HERO NARRATIVE ── */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
          <Cpu className="w-3 h-3" /> Neural Guardrail Protocol 2.6
        </div>
        <h1 className="text-7xl font-black tracking-tighter sm:text-9xl bg-gradient-to-b from-white via-white to-slate-600 bg-clip-text text-transparent">
          SafeConfig <span className="text-blue-600">AI</span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          The world’s first <span className="text-white">Traffic-Aware</span> feature management system. 
          Audit risk, prevent outages, and govern deployments with real-time AI inference.
        </p>
      </div>

      {/* ── SECTION 2: PERSONA ACCESS (RBAC) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Manager Portal */}
        <button onClick={() => handleLogin('manager')} className="group relative p-12 border border-slate-800/80 rounded-[3rem] bg-slate-900/30 backdrop-blur-md hover:border-blue-500/50 hover:bg-slate-900/50 transition-all duration-500 text-left overflow-hidden shadow-2xl">
          <div className="absolute -top-10 -right-10 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
             <ShieldCheck size={300} />
          </div>
          {loading === 'manager' ? <Loader2 className="w-12 h-12 text-blue-500 mb-8 animate-spin" /> : <ShieldCheck className="w-12 h-12 text-blue-500 mb-8 group-hover:scale-110 transition-transform" />}
          <h2 className="text-4xl font-black text-white tracking-tight">Manager</h2>
          <p className="text-slate-500 text-base mt-4 leading-relaxed font-medium">
            Executive Governance. Define features, manage environments, and override AI safety blocks with full audit accountability.
          </p>
        </button>

        {/* Developer Portal */}
        <button onClick={() => handleLogin('developer')} className="group relative p-12 border border-slate-800/80 rounded-[3rem] bg-slate-900/30 backdrop-blur-sm hover:border-emerald-500/50 hover:bg-slate-900/50 transition-all duration-500 text-left overflow-hidden shadow-2xl">
          <div className="absolute -top-10 -right-10 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
             <Code2 size={300} />
          </div>
          {loading === 'developer' ? <Loader2 className="w-12 h-12 text-emerald-500 mb-8 animate-spin" /> : <Code2 className="w-12 h-12 text-emerald-500 mb-8 group-hover:scale-110 transition-transform" />}
          <h2 className="text-4xl font-black text-white tracking-tight">Developer</h2>
          <p className="text-slate-500 text-base mt-4 leading-relaxed font-medium">
            Operational Agility. Ship code behind flags and monitor live telemetry. Every toggle is pre-audited for infrastructure safety.
          </p>
        </button>
      </div>

      {/* ── SECTION 3: THE QUICKSTART (The "How-To") ── */}
      <div className="w-full max-w-5xl space-y-16 py-20 border-t border-slate-900">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Terminal className="text-blue-500 w-6 h-6" />
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.5em]">Developer Quickstart</h3>
          </div>
          <p className="text-slate-500 text-sm max-w-xl">
            Integrate SafeConfig AI into your existing codebase in under 60 seconds. 
            Automate your traffic telemetry and secure your deployment pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Code Snippet */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-8 py-5 bg-slate-900/50 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-4">lib/safeconfig.ts</span>
                </div>
                <button onClick={copyToClipboard} className="text-slate-500 hover:text-white transition-colors">
                  {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
              </div>
              <pre className="p-8 text-[12px] font-mono leading-relaxed text-blue-300/90 overflow-x-auto">
                <code>{sdkCode}</code>
              </pre>
            </div>
          </div>

          {/* Right: Descriptive Steps */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-10">
            
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-500/20 transition-all">
                <Boxes size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-1">01. Install the Bridge</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Save the SDK file to your project. This establishes a high-speed link between your UI and our Neural Auditor.
                </p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 group-hover:bg-emerald-500/20 transition-all">
                <Zap size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-emerald-400 font-bold text-lg mb-1">02. The One-Line Toggle</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Gate any component or logic block with a single asynchronous check. No heavy libraries or complex configuration required:
                </p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-500 shadow-inner">
                   {`if (await SafeConfig.isEnabled('new-checkout')) { ... }`}
                </div>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0 group-hover:bg-purple-500/20 transition-all">
                <Radio size={24} />
              </div>
              <div>
                <h4 className="text-purple-400 font-bold text-lg mb-1">03. Real-Time Telemetry</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  The moment this code runs, your dashboard’s <b className="text-slate-300">Blast Radius HUD</b> updates. The AI uses these "pings" to calculate the risk of your next deployment.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="text-center pt-20 border-t border-slate-900 w-full opacity-50">
        <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.6em]">
          SafeConfig AI • Engineered for Mission-Critical Infrastructure
        </p>
      </div>

    </div>
  );
}
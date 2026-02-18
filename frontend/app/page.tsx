"use client";

import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Code2, Cpu, Terminal,
  Copy, CheckCircle2, Zap, Radio
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Included this so the documentation example has a state to reference
  const [showWork, setShowWork] = useState(false);

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
const API_BASE = "https://better-job-assignment.vercel.app/api/flags";

export const SafeConfig = {
  // Add 'environment' as a parameter (defaulting to 'production')
  async isEnabled(key: string, environment: string = 'production', fallback = false): Promise<boolean> {
    try {
      // Pass the environment to your backend via a query parameter
      const res = await fetch(\`\${API_BASE}/evaluate/\${key}?env=\${environment}\`, { 
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
        <h1 className="text-7xl font-black tracking-tighter sm:text-9xl text-white">
          SafeConfig <span className="text-blue-600">AI</span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          Traffic-Aware feature management. Audit risk and govern deployments with real-time AI inference.
        </p>
      </div>

      {/* SECTION 2: ACCESS POINTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        <button
          onClick={() => handleLogin('manager')}
          disabled={loading !== null}
          className="group p-12 border border-slate-800 rounded-[2rem] bg-slate-900/50 hover:border-blue-500/50 transition-all text-left disabled:opacity-50"
        >
          <ShieldCheck className="w-12 h-12 text-blue-500 mb-8" />
          <h2 className="text-4xl font-black">Manager</h2>
          <p className="text-slate-500 text-lg mt-4">Full authority. Manage environments and override AI blocks.</p>
        </button>

        <button
          onClick={() => handleLogin('developer')}
          disabled={loading !== null}
          className="group p-12 border border-slate-800 rounded-[2rem] bg-slate-900/50 hover:border-emerald-500/50 transition-all text-left disabled:opacity-50"
        >
          <Code2 className="w-12 h-12 text-emerald-500 mb-8" />
          <h2 className="text-4xl font-black">Developer</h2>
          <p className="text-slate-500 text-lg mt-4">Operational access. Ship code and monitor live telemetry.</p>
        </button>
      </div>

      {/* SECTION 3: DEVELOPER QUICKSTART */}
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

          {/* STEP 2: IMPLEMENTATION */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2">Step 2: Implementation Example</h4>
            <div className="bg-black rounded-3xl border border-slate-800 overflow-hidden shadow-2xl h-full flex flex-col">
              <div className="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">COMPONENT.tsx</span>
                <Zap size={18} className="text-emerald-500" />
              </div>
              <div className="p-8 space-y-6 flex-grow">
                <p className="text-slate-400 text-sm leading-relaxed">
                  Initialize the detector and pass your <b>case-sensitive</b> tag <code className="text-blue-400">'show_my_work'</code>.
                </p>

                <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 font-mono text-[10px] text-blue-300 space-y-4 overflow-x-auto">
                  <div>
                    <p className="text-slate-500 mb-1">// 1. Environment Detection</p>
                    <pre className="text-blue-200">
{`const [var, setVar] = useState(false);

const getEnv = () => {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return 'Development';
  if (host.includes('vercel.app')) return 'Staging';
  return 'Production';
};`}
                    </pre>
                  </div>
                  
                  <div>
                    <p className="text-slate-500 mb-1">// 2. Execution</p>
                    <div className="text-emerald-400 space-y-1">
                      <p>const currentEnv = getEnv();</p>
                      <p>SafeConfig.isEnabled('feature_tag', currentEnv)</p>
                      <p className="pl-4">.then((status) =&gt; &#123;</p>
                      <p className="pl-8 text-slate-500 font-italic">// Use 'status' to update state</p>
                      <p className="pl-8">setVar(status);</p>
                      <p className="pl-4">&#125;);</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <p className="text-[10px] font-black text-slate-600 uppercase mb-3">Usage in UI:</p>
                  <pre className="text-[11px] font-mono text-slate-400 bg-slate-900/40 p-3 rounded-lg">
{`{var && (
  <Feature title="Feature Title" />
)}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: TELEMETRY NARRATIVE */}
        <div className="bg-slate-900/30 border mt-40 border-slate-800 p-10 rounded-[2rem] flex flex-col md:flex-row items-center gap-10">
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
    </div>
  );
}
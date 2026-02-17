"use client";

import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { ShieldCheck, Code2 } from "lucide-react";

export default function LandingPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (role: 'manager' | 'developer') => {
    try {
      // 1. Get the JWT from our Flask Backend
      const res = await api.post('/auth/login', { role });
      const { access_token } = res.data;

      // 2. Save to Global Context
      login(role, access_token);

      // 3. Redirect to the appropriate dashboard folder
      router.push(`/${role}`);
    } catch (err) {
      alert("Failed to connect to backend. Is Flask running on port 5000?");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-blue-500">
          SafeConfig AI
        </h1>
        <p className="text-slate-400">Select your persona to enter the dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Manager Card */}
        <button 
          onClick={() => handleLogin('manager')}
          className="group p-8 border border-slate-800 rounded-2xl bg-slate-900/50 hover:border-blue-500 transition-all text-left"
        >
          <ShieldCheck className="w-10 h-10 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold">Manager</h2>
          <p className="text-slate-400 text-sm mt-2">Create new features and define safety policies.</p>
        </button>

        {/* Developer Card */}
        <button 
          onClick={() => handleLogin('developer')}
          className="group p-8 border border-slate-800 rounded-2xl bg-slate-900/50 hover:border-green-500 transition-all text-left"
        >
          <Code2 className="w-10 h-10 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold">Developer</h2>
          <p className="text-slate-400 text-sm mt-2">Toggle features across environments with AI safety checks.</p>
        </button>
      </div>
    </div>
  );
}
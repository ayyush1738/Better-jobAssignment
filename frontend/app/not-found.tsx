import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Cpu, Terminal } from 'lucide-react';

/**
 * CUSTOM 404 - SECTOR NOT FOUND
 * Reinforces the "Infrastructure Security" theme even during navigation errors.
 */
export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] space-y-12 px-4">
            
            {/* Visual Warning: Glow + Shield */}
            <div className="relative">
                <div className="absolute inset-0 bg-red-600/20 blur-[100px] rounded-full animate-pulse" />
                <div className="relative p-8 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] shadow-2xl">
                    <ShieldAlert className="w-20 h-20 text-red-500" />
                </div>
            </div>

            {/* Error Typography */}
            <div className="text-center space-y-4">
                <h1 className="text-8xl font-black text-white tracking-tighter sm:text-9xl">
                    404
                </h1>
                <div className="inline-block px-4 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.4em]">
                        Sector Perimeter Breach
                    </p>
                </div>
                <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                    The requested coordinate does not exist within the <span className="text-slate-300 font-bold">SafeConfig AI</span> network perimeter. 
                    Inference halted.
                </p>
            </div>

            {/* Navigation Recovery */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
                <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Command
                </Link>
                <Link
                    href="/"
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest rounded-2xl border border-slate-800 transition-all active:scale-[0.98]"
                >
                    <Cpu className="w-4 h-4" />
                    Re-Launch
                </Link>
            </div>

            {/* System Status Footer */}
            <div className="flex items-center gap-3 pt-12">
                <Terminal className="w-3 h-3 text-slate-700" />
                <p className="text-slate-700 text-[9px] uppercase tracking-[0.3em] font-black">
                    Error Protocol: Unauthorized Sector Access • 0x404_SEC_VIOLATION
                </p>
            </div>
        </div>
    );
}
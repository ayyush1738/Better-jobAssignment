import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SafeConfig AI | Mission Control",
  description: "AI-Augmented Feature Flag Governance Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-[#020617] text-slate-50 antialiased selection:bg-blue-500/30 selection:text-white`}>
        
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15]" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
        </div>

        {/* --- LOGIC LAYER: AUTHENTICATION --- */}
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            
            {/* Global Navigation - Persistent across all routes */}
            <Navbar />

            {/* Viewport Content Area */}
            {/* Using max-w-7xl ensures a consistent 'Enterprise' alignment */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 pb-20">
              {children}
            </main>

            {/* Global Footer - Protocol Metadata */}
            <footer className="border-t border-slate-900/50 bg-slate-950/20 backdrop-blur-md py-8">
              <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.4em]">
                  SafeConfig AI Protocol • V.2.0.26
                </p>
                <div className="flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Secured Node: JAIPUR_IN_01</span>
                </div>
              </div>
            </footer>

          </div>
        </AuthProvider>

      </body>
    </html>
  );
}
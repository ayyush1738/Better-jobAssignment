import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark"> 
      <body className="bg-slate-950 text-slate-50 antialiased">
        <AuthProvider>
          {/* Main container to center content and add padding */}
          <main className="min-h-screen max-w-7xl mx-auto p-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { 
  Server, 
  Terminal, 
  ShieldCheck, 
  RefreshCw, 
  ChevronLeft, 
  LayoutDashboard 
} from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const { user, login, loading, error, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [successMode, setSuccessMode] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      setSuccessMode(true);
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSignIn = async () => {
    await login();
  };

  return (
    <div className="relative min-h-screen bg-[#050816] text-slate-100 flex items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-cyber-cyan/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-cyber-cyan rounded-full animate-ping opacity-25" />
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-cyber-purple rounded-full animate-ping opacity-25" />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-cyber-green rounded-full animate-ping opacity-20" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <button 
          onClick={() => navigate("/")}
          className="mb-8 inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Terminal
        </button>

        {/* Center Glass Card */}
        <div className="glass-panel rounded-2xl border border-white/5 relative bg-[#0E1325]/85 p-8 shadow-2xl purple-glow">
          {/* Neon Border Highlight */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-orange rounded-2xl opacity-10 blur pointer-events-none" />

          {/* Logo Brand Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex relative p-4 rounded-2xl bg-gradient-to-tr from-purple-650 to-indigo-700 shadow-xl shadow-purple-500/20 mx-auto">
              {/* Backing glow */}
              <div className="absolute inset-0 bg-cyber-purple/50 rounded-2xl blur-lg animate-pulse" />
              <Server className="w-8 h-8 text-white relative z-10" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 text-2xl font-extrabold text-white tracking-tight">
                <span>SmartCluster</span>
                <span className="text-xs bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/25 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest font-semibold uppercase block mt-1">
                Cloud Intelligence Workspace
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-bold text-white">Welcome back</h2>
              <p className="text-xs text-slate-400">Access your secure production clusters analytics and optimize resources proactively.</p>
            </div>

            {error && (
              <div className="p-3 bg-cyber-red/10 border border-cyber-red/25 text-cyber-red rounded-xl text-xs font-mono flex items-start gap-2">
                <span className="font-bold flex-shrink-0">⚠️ SRE_AUTH_ERR:</span>
                <span>{error}</span>
              </div>
            )}

            {successMode ? (
              <div className="p-6 bg-cyber-green/10 border border-cyber-green/25 text-cyber-green rounded-xl text-center space-y-3 font-mono">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyber-green" />
                <p className="text-xs font-bold uppercase tracking-wider">Establishing telemetry session...</p>
                <p className="text-[10px] text-slate-400">Loading auth profiles, please standby.</p>
              </div>
            ) : (
              <button
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-semibold text-xs tracking-wide shadow-lg shadow-white/5 transition-all outline-none border border-white/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                    Bypassing gateway...
                  </>
                ) : (
                  <>
                    {/* Google original vector icon */}
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.227 0 3.145 2.736 1.136 6.727l4.13 3.038z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.454 12.273c0-.827-.074-1.62-.21-2.386H12v4.51h6.42a5.53 5.53 0 0 1-2.4 3.633l3.715 2.88c2.173-2 3.719-4.943 3.719-8.637z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.266 14.235A7.127 7.127 0 0 1 4.91 12c0-.792.137-1.554.356-2.235L1.136 6.727A11.892 11.892 0 0 0 0 12c0 1.92.455 3.736 1.255 5.355l4.01-3.12z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.973-1.077 7.964-2.92l-3.715-2.88c-1.03.69-2.34 1.1-4.249 1.1-3.9 0-7.21-2.636-8.39-6.19l-4.13 3.12C1.727 20.309 5.8 24 12 24z"
                      />
                    </svg>
                    Continue with Google Auth
                  </>
                )}
              </button>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyber-green" /> SSL Protected
            </span>
            <span>Version: 3.1.2-Cloud</span>
          </div>
        </div>

        {/* Security disclaimer */}
        <div className="mt-6 text-center text-[10px] text-slate-500 max-w-sm mx-auto leading-relaxed">
          Google Single Sign-On verifies platform privileges. Access is audited under SOC2 security standards.
        </div>
      </div>
    </div>
  );
}

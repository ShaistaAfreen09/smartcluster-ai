import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Terminal } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
      <div className="absolute top-[30%] left-[30%] w-[400px] h-[400px] bg-cyber-red/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="w-full max-w-md glass-panel rounded-2xl border border-cyber-red/20 bg-[#0E1325]/85 p-8 shadow-2xl relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyber-red to-cyber-orange rounded-t-2xl" />

        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyber-red/10 border border-cyber-red/25 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-cyber-red animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-white uppercase tracking-wider font-mono flex items-center justify-center gap-2">
              <span>Access Refused</span>
              <span className="text-[10px] bg-cyber-red/15 text-cyber-red border border-cyber-red/25 px-1.5 py-0.5 rounded">
                403
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Your security clearance does not allow monitoring or operating this subsystem. Action logged in cluster telemetry files.
            </p>
          </div>

          <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-left font-mono text-[10px] text-slate-400 space-y-1.5">
            <div className="flex justify-between">
              <span>SRE_LOG_ALERT:</span>
              <span className="text-cyber-red font-bold">UNAUTHORIZED</span>
            </div>
            <div className="flex justify-between">
              <span>TIMESTAMP:</span>
              <span>{new Date().toISOString()}</span>
            </div>
            <div className="flex justify-between">
              <span>GATEWAY:</span>
              <span>gke-smartcluster-auth</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl font-semibold text-xs transition duration-200 cursor-pointer text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

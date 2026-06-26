import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { 
  Terminal, 
  Cpu, 
  Activity, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  Server, 
  LineChart, 
  ArrowUpRight, 
  CheckCircle2, 
  Workflow, 
  Coins,
  Globe
} from "lucide-react";
import { motion } from "motion/react";

export default function Landing() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const handleDemoLaunch = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#050816] via-[#0A0F1F] to-[#050816] text-slate-100 overflow-x-hidden font-sans">
      {/* Decorative Cyber Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* Absolute floating neon entities */}
      <div className="absolute top-[15%] left-[10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-[40%] right-[12%] w-[450px] h-[450px] bg-cyan-533 bg-cyber-cyan/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[15%] w-80 h-80 bg-emerald-500/5 rounded-full blur-[110px] pointer-events-none" />

      {/* Global Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-cyber-cyan shadow-lg shadow-purple-500/20">
              <Server className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyber-green rounded-full shadow-md shadow-emerald-500/50" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">SmartCluster</span>
                <span className="text-[10px] bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/25 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase">AI</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold uppercase block">
                Enterprise Autonomous Platform
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-cyber-cyan transition-colors">Features</a>
            <a href="#architecture" className="hover:text-cyber-purple transition-colors">Architecture</a>
            <a href="#pricing" className="hover:text-cyber-orange transition-colors">Enterprise Systems</a>
            <span className="text-white/10">|</span>
            <span className="text-[11px] font-mono text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping" />
              GKE-PROVISIONER-EAST v2.4
            </span>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link 
                to="/dashboard" 
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-xs text-white shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 border border-purple-500/30"
              >
                Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs font-bold text-slate-300 hover:text-white transition">Sign In</Link>
                <Link 
                  to="/login" 
                  className="px-5 py-2 rounded-xl bg-transparent hover:bg-white/5 font-bold text-xs text-cyber-cyan border border-cyber-cyan/30 shadow-md shadow-cyan-500/5 hover:border-cyber-cyan/70 transition-all"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 px-6 max-w-7xl mx-auto text-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner text-[11px] font-mono text-cyber-cyan tracking-wider uppercase font-bold mb-8"
        >
          <Zap className="w-3.5 h-3.5 animate-bounce text-cyber-cyan" />
          Predictive Auto-Scalers Live & Ready
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight mb-6"
        >
          AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-orange">Kubernetes Intelligence</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12"
        >
          Monitor clusters, predict workloads, and automate infrastructure optimization using advanced AI models. Prevent SLAs bottlenecks prior to traffic spikes.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20"
        >
          <button 
            onClick={handleDemoLaunch}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-sm text-white shadow-lg shadow-purple-500/20 border border-purple-500/40 transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02]"
          >
            Launch Free Console <Zap className="w-4 h-4 text-cyber-cyan" />
          </button>
          
          <button 
            onClick={handleDemoLaunch}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-sm text-slate-300 hover:text-white border border-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            View Dashboard Demo <ArrowUpRight className="w-4 h-4 text-cyber-cyan" />
          </button>
        </motion.div>

        {/* Console Showcase Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto rounded-2xl border border-white/10 bg-[#0E1325]/80 p-1.5 shadow-2xl shadow-purple-950/20"
        >
          {/* Neon side accents */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-orange rounded-2xl opacity-15 blur pointer-events-none" />
          
          <div className="rounded-xl overflow-hidden bg-[#0A0F1F] border border-white/5 relative">
            {/* Topbar frame */}
            <div className="bg-[#050816] px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyber-red/80" />
                <span className="w-3 h-3 rounded-full bg-cyber-orange/80" />
                <span className="w-3 h-3 rounded-full bg-cyber-green/80" />
                <span className="text-xs font-mono text-slate-500 ml-4">https://console.smartcluster.ai/cluster-prod-1</span>
              </div>
              <span className="px-2.5 py-0.5 bg-cyber-cyan/10 rounded font-mono text-[10px] text-cyber-cyan uppercase font-bold tracking-widest">PROACTIVE-ACTIVE</span>
            </div>

            {/* Inner dummy screen */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="col-span-2 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h4 className="font-bold text-sm text-white">Dynamic Regression Autoscale Curves</h4>
                    <p className="text-[10px] text-slate-500">Predicted Pod Count vs Traffic Incoming Rate</p>
                  </div>
                  <Terminal className="text-cyber-cyan w-4 h-4 animate-pulse" />
                </div>
                {/* Simulated Chart Visual */}
                <div className="h-44 bg-[#050816] rounded-xl border border-white/5 p-4 relative flex items-end overflow-hidden cyan-glow">
                  <div className="absolute top-3 left-3 flex gap-4 text-[9px] font-mono text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-cyber-cyan" /> Workload Traffic</span>
                    <span className="flex items-center gap-1"><span className="w-4 h-0.5 border-t border-dashed border-cyber-purple" /> AI Target Limit</span>
                  </div>
                  
                  {/* Wave pattern */}
                  <svg className="w-full h-full text-cyber-cyan/10" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <path d="M0,45 Q15,10 30,35 T60,5 T90,40 T100,20 L100,50 L0,50 Z" fill="currentColor" />
                    <path d="M0,45 Q15,10 30,35 T60,5 T90,40 T100,20" stroke="#00F5FF" strokeWidth="1.5" fill="none" />
                    {/* Dashed predicted */}
                    <path d="M0,40 Q15,12 30,30 T60,10 T90,35 T100,15" stroke="#8B5CF6" strokeDasharray="3,3" strokeWidth="1.5" fill="none" />
                  </svg>
                  
                  {/* Flashing target node */}
                  <div className="absolute top-[20%] left-[60%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <span className="w-3 h-3 bg-cyber-purple rounded-full animate-ping absolute" />
                    <span className="w-2.5 h-2.5 bg-cyber-cyan rounded-full relative shadow-md shadow-cyber-cyan" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#111827]/40 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">AUTOMATION DECISION</span>
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-bold text-white uppercase">GKE Node Resize</h5>
                    <span className="text-[10px] bg-cyber-green/10 text-cyber-green border border-cyber-green/20 px-1.5 py-0.5 rounded font-mono">EXECUTED</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Successfully scaled `payment-service` to 12 pods (20 mins prior to predicted load spike).</p>
                </div>

                <div className="p-4 bg-[#111827]/40 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">MONTHLY SRE GAINS</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-cyber-green">+41.2%</span>
                    <span className="text-xs text-slate-400">Node Packing Efficiency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="py-24 border-t border-white/5 relative z-10 bg-[#0A0F1F]/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <span className="text-xs text-cyber-purple font-mono uppercase tracking-widest font-bold block">Autonomous Intelligence Strata</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Engineered for Scaled Infrastructure</h2>
            <p className="text-sm text-slate-400">Discover custom integrations designed by SRE architects to automate predictive scaling and slash operational overhead costs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* FEATURECARD 1 */}
            <div className="p-6 rounded-2xl border border-white/5 bg-[#111827]/50 hover:border-cyber-cyan/30 hover:bg-[#111827]/80 hover:shadow-xl transition-all duration-300 group">
              <div className="p-3 w-fit rounded-xl bg-cyber-cyan/10 text-cyber-cyan mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyber-cyan transition-colors">Real-time telemetry</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Observe dynamic CPU, memory, socket buffers, and core namespaces health continuously. Zero-lag scraping from GKE environments.
              </p>
            </div>

            {/* FEATURECARD 2 */}
            <div className="p-6 rounded-2xl border border-white/5 bg-[#111827]/50 hover:border-cyber-purple/30 hover:bg-[#111827]/80 hover:shadow-xl transition-all duration-300 group">
              <div className="p-3 w-fit rounded-xl bg-cyber-purple/10 text-cyber-purple mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyber-purple transition-colors">AI Predictions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ordinary least squares estimation and ensembles map expected resource loads hours in advance, allowing you to prepare namespaces completely.
              </p>
            </div>

            {/* FEATURECARD 3 */}
            <div className="p-6 rounded-2xl border border-white/5 bg-[#111827]/50 hover:border-cyber-green/30 hover:bg-[#111827]/80 hover:shadow-xl transition-all duration-300 group">
              <div className="p-3 w-fit rounded-xl bg-cyber-green/10 text-cyber-green mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyber-green transition-colors">Auto Optimization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive proactive replicas suggestions and resource parameters tailored via Gemini model insights. Reduce cloud over-provisioning spend.
              </p>
            </div>

            {/* FEATURECARD 4 */}
            <div className="p-6 rounded-2xl border border-white/5 bg-[#111827]/50 hover:border-cyber-orange/30 hover:bg-[#111827]/80 hover:shadow-xl transition-all duration-300 group">
              <div className="p-3 w-fit rounded-xl bg-cyber-orange/10 text-cyber-orange mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyber-orange transition-colors">Enterprise Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track security profiles, anomaly events, and pod isolation faults with fully-featured IAM rules and instant automated rollbacks control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE ARCHITECTURE DEMO PANEL */}
      <section id="architecture" className="py-24 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-mono text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/20 px-3 py-1 rounded w-fit uppercase font-bold block">
                Control Loop Evolution
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Standard HPA Reacts Late.<br/><span className="text-cyber-cyan">SmartCluster scaling coordinates early.</span>
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Most cloud platforms scale by monitoring current utilization limits. When load spikes, native controllers request pods, triggers image downloads, and boots containers. By then, users suffer from extreme request delays and service connection drops.
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                SmartCluster analyzes systemic seasonality and usage regressions. It schedules deployments 60 minutes *prior* to ingress, securing optimal pods before requests arrive, and compresses nodes during downtime to minimize idle cloud spend.
              </p>
              
              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyber-cyan flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300"><strong className="text-white">Active Queue Squeeze</strong>: Cuts queue latency periods by over 68%</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyber-purple flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300"><strong className="text-white">Node Packing Algorithms</strong>: Optimizes cluster packing layout density</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300"><strong className="text-white">Full Cluster Topology Control</strong>: Maps namespaces, pod parameters, and resource limitations visually</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0A0F1F] border border-white/5 relative space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Workflow className="text-cyber-purple w-4 h-4" /> Live Operational Flow
                </span>
                <span className="text-[10px] text-cyber-green font-mono">AUTONOMIC-CONTROL-ON</span>
              </div>

              {/* Staggered process items in CSS */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#111827]/40 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-500 font-mono">01</span>
                    <span className="text-[11px] text-slate-300">Scrape GKE & Prometheus buffers</span>
                  </div>
                  <span className="text-[10px] text-cyber-cyan font-mono">Every 5s</span>
                </div>

                <div className="p-3 rounded-lg bg-[#111827]/40 border border-cyber-purple/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-cyber-purple font-mono">02</span>
                    <span className="text-[11px] text-slate-300 font-medium">Predict 24h regression trajectories</span>
                  </div>
                  <span className="text-[10px] text-cyber-purple font-mono">Linear Fit</span>
                </div>

                <div className="p-3 rounded-lg bg-[#111827]/40 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-500 font-mono">03</span>
                    <span className="text-[11px] text-slate-300">Identify outlier performance metrics</span>
                  </div>
                  <span className="text-[10px] text-cyber-orange font-mono">94% Confidence</span>
                </div>

                <div className="p-3 rounded-lg bg-cyber-green/5 border border-cyber-green/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-cyber-green font-mono">04</span>
                    <span className="text-[11px] text-cyber-green font-medium">Proactively commit replica scaling limits</span>
                  </div>
                  <span className="text-[10px] bg-cyber-green/20 text-cyber-green border border-cyber-green/30 px-1.5 py-0.5 rounded font-mono uppercase font-bold">ACTUATED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION */}
      <section id="pricing" className="py-24 border-t border-white/5 relative z-10 bg-[#050816]/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs text-cyber-orange font-mono uppercase tracking-widest font-bold block">Predictable SaaS Billing</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Flexible Plans for Growing Infrastructure</h2>
            <p className="text-sm text-slate-400">Scale SmartCluster across thousands of cloud Kubernetes nodes without breaking your budget constraint thresholds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* PLAN 1 */}
            <div className="p-8 rounded-2xl border border-white/5 bg-[#111827]/40 hover:border-white/10 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-300">Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">Free</span>
                  <span className="text-xs text-slate-400 font-mono">/ Month</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Perfect for test environments, SRE sandboxes, and offline simulation profiles.</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-slate-300">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyber-cyan" /> <span>Up to 3 Kubernetes Nodes</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyber-cyan" /> <span>1 Namespace monitoring</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyber-cyan" /> <span>Linear regression fit</span></div>
              </div>

              <button 
                onClick={handleDemoLaunch}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 border border-white/10 hover:border-white/30 transition-all"
              >
                Launch Sandbox console
              </button>
            </div>

            {/* PLAN 2 - PRO */}
            <div className="p-8 rounded-2xl border border-cyber-purple/40 bg-[#0A0F1F] hover:shadow-2xl hover:shadow-purple-950/20 transition-all flex flex-col justify-between relative overflow-hidden space-y-6 scale-105">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-cyber-purple to-indigo-600 px-4 py-1 text-[9px] font-mono text-white tracking-widest uppercase font-bold rounded-bl-xl border-l border-b border-white/10">POPULAR</div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-cyber-purple">Professional Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$29</span>
                  <span className="text-xs text-slate-400 font-mono">/ Month</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">Enterprise automation with active agent controllers and prediction routines.</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-slate-300">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyber-purple" /> <span>Up to 50 active GKE Nodes</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyber-purple" /> <span>Unlimited Cluster Namespaces</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyber-purple" /> <span>Proactive replica autoscalers</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyber-purple" /> <span>Active anomaly alert routing</span></div>
              </div>

              <button 
                onClick={handleDemoLaunch}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-500/20 border border-purple-500/40 transition-all"
              >
                Request 14-day Trial
              </button>
            </div>

            {/* PLAN 3 */}
            <div className="p-8 rounded-2xl border border-white/5 bg-[#111827]/40 hover:border-white/10 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-cyber-orange">Enterprise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">Custom</span>
                  <span className="text-xs text-slate-400 font-mono">/ Systems</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Dedicated clusters, SSO login protection, compliance, and custom regressors mapping.</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-slate-300">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyber-orange" /> <span>Unlimited Nodes & Clusters</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyber-orange" /> <span>Custom scikit-learn models</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyber-orange" /> <span>Prometheus + Datadog adapters</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyber-orange" /> <span>SLA 99.999% response backing</span></div>
              </div>

              <button 
                onClick={handleDemoLaunch}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 border border-white/10 hover:border-white/30 transition-all"
              >
                Contact Cloud Architects
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#050816] relative z-10 text-slate-500 text-xs py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">SmartCluster</span>
              <span className="text-[9px] bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/25 px-1 py-0.5 rounded font-mono font-bold uppercase tracking-wider">AI</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              SaaS cloud orchestrator bringing linear regressions and artificial intelligence solutions into cloud Kubernetes engine performance.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase mb-4 tracking-wider">Product</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-white transition">Telemetry metrics</a></li>
              <li><a href="#" className="hover:text-white transition">Proactive scale</a></li>
              <li><a href="#" className="hover:text-white transition">Gemini recommendations</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing tiers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase mb-4 tracking-wider">Documentation</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-white transition">API reference specs</a></li>
              <li><a href="#" className="hover:text-white transition">SRE guides</a></li>
              <li><a href="#" className="hover:text-white transition">GKE manifest patterns</a></li>
              <li><a href="#" className="hover:text-white transition">Security audit rules</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase mb-4 tracking-wider">Contact & Trust</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-white transition">SRE Helpdesk</a></li>
              <li><a href="#" className="hover:text-white transition">GDPR Compliance</a></li>
              <li><a href="#" className="hover:text-white transition">System Status Status</a></li>
              <li><a href="mailto:ishq.hainhi@gmail.com" className="hover:text-white transition">Developer email</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 SmartCluster AI Inc. All systems green and operational. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Use</a>
            <a href="#" className="hover:text-slate-300">Security Disclosures</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

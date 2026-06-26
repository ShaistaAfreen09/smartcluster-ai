import React, { useState } from "react";
import { 
  Server, 
  Layers, 
  Activity, 
  Cpu, 
  Network, 
  Zap,
  Globe,
  Database,
  Terminal,
  Grid
} from "lucide-react";
import { motion } from "motion/react";

export default function TopologyMap() {
  const [activeNamespace, setActiveNamespace] = useState<string>("production-api");
  const [selectedNodeId, setSelectedNodeId] = useState<number>(1);

  const namespaces = ["production-api", "payment-service", "data-lake", "kube-system"];

  // Kubernetes topology database structure
  const workerNodes = [
    { id: 1, name: "gke-node-pool-core-9a", ip: "10.128.0.22", status: "Ready", cpu: "42%", mem: "58%" },
    { id: 2, name: "gke-node-pool-core-9b", ip: "10.128.0.23", status: "Ready", cpu: "55%", mem: "71%" },
    { id: 3, name: "gke-node-pool-spot-c2", ip: "10.128.1.10", status: "Spot-Active", cpu: "28%", mem: "44%" }
  ];

  const podsByNamespace: Record<string, Array<{ id: string; name: string; status: string; node: number; cpu: string; containers: string[]; traffic: string }>> = {
    "production-api": [
      { id: "pod-api-1", name: "ingress-gateway-6d8b-ff1", status: "Running", node: 1, cpu: "14%", containers: ["envoy-proxy", "fluentbit-sidecar"], traffic: "450 RPS" },
      { id: "pod-api-2", name: "user-profile-service-7e21", status: "Running", node: 1, cpu: "24%", containers: ["fastapi-app", "redis-cache-sidecar"], traffic: "210 RPS" },
      { id: "pod-api-3", name: "auth-broker-0a12", status: "Running", node: 2, cpu: "18%", containers: ["go-auth", "vault-sync"], traffic: "180 RPS" }
    ],
    "payment-service": [
      { id: "pod-pay-1", name: "payment-service-8f12-vv2", status: "Running", node: 2, cpu: "35%", containers: ["node-express-worker", "stripe-client"], traffic: "95 RPS" },
      { id: "pod-pay-2", name: "payment-service-8f12-xv3", status: "Ready", node: 3, cpu: "12%", containers: ["node-express-worker"], traffic: "40 RPS" }
    ],
    "data-lake": [
      { id: "pod-data-1", name: "postgres-primary-ff09", status: "Running", node: 2, cpu: "45%", containers: ["postgresql-15", "pgpool-admin"], traffic: "920 Queries/s" },
      { id: "pod-data-2", name: "redis-cache-cluster-0", status: "Running", node: 3, cpu: "32%", containers: ["redis-server-7"], traffic: "1400 Queries/s" }
    ],
    "kube-system": [
      { id: "pod-kube-1", name: "kube-dns-cluster-dns6", status: "Running", node: 1, cpu: "2%", containers: ["coredns"], traffic: "Internal DNS" },
      { id: "pod-kube-2", name: "prometheus-node-exporter-ff", status: "Running", node: 2, cpu: "4%", containers: ["node-exporter"], traffic: "Metric Scrape" }
    ]
  };

  const selectedPods = podsByNamespace[activeNamespace] || [];

  return (
    <div className="bg-white dark:bg-[#0A0F1F] rounded-2xl border border-slate-200 dark:border-white/5 p-6 font-sans relative shadow-sm dark:shadow-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-150 dark:border-white/5 pb-4 mb-6 gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="text-cyber-cyan w-4.5 h-4.5 animate-pulse" />
            Dynamic GKE Cluster Topology Map
          </h4>
          <p className="text-[10px] text-slate-500 mt-1">Real-time scheduling topology mapping namespaces, worker VMs, and active pod replicas</p>
        </div>

        {/* Namespace Pills */}
        <div className="flex flex-wrap gap-2">
          {namespaces.map((ns) => (
            <button
              key={ns}
              onClick={() => setActiveNamespace(ns)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider font-bold uppercase transition-all cursor-pointer border ${
                activeNamespace === ns
                  ? "bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan text-glow-cyan"
                  : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              }`}
            >
              {ns}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        
        {/* LEFT: Kubernetes Master Core / Worker Nodes */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-[#050816]/70 border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between text-[10px] font-mono font-bold tracking-wider uppercase text-[#8B5CF6]">
            <span>Worker Node Pool</span>
            <Server className="w-3.5 h-3.5" />
          </div>

          <div className="space-y-3">
            {workerNodes.map((node) => {
              const belongsPodsCount = selectedPods.filter(p => p.node === node.id).length;
              const isSelected = selectedNodeId === node.id;
              
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all relative cursor-pointer ${
                    isSelected 
                      ? "bg-slate-50 dark:bg-[#111827] border-cyber-purple dark:border-cyber-purple purple-glow" 
                      : "bg-white dark:bg-[#111827]/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Cpu className={`w-4 h-4 ${isSelected ? "text-cyber-purple animate-pulse" : "text-slate-500"}`} />
                      {node.name}
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-[#00FF85]/10 text-cyber-green px-1.5 py-0.2 rounded">
                      Ready
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                    <div>CPU allocation: <b className="text-slate-800 dark:text-white">{node.cpu}</b></div>
                    <div>Memory pool: <b className="text-slate-800 dark:text-white">{node.mem}</b></div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-white/5 mt-3 pt-2 flex items-center justify-between text-[9px] font-mono text-slate-500">
                    <span>IP address: {node.ip}</span>
                    <span className="text-cyber-cyan font-bold block">{belongsPodsCount} Pods in namespace</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MIDDLE: Animated Connection Lines Web (SVG Overlay) */}
        <div className="hidden lg:block lg:col-span-2 relative h-full min-h-[300px]">
          {/* Animated SVG connection arrows */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-full h-full text-slate-700 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Dynamic pulsing path lines to illustrate scheduling flow */}
              <path d="M0,25 Q50,25 100,20" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="3,3" className="opacity-50" />
              <path d="M0,50 Q50,50 100,45" fill="none" stroke="#00F5FF" strokeWidth="2" />
              <path d="M0,75 Q50,75 100,75" fill="none" stroke="#00FF85" strokeWidth="1" strokeDasharray="5,5" />
              
              {/* Pulse dash */}
              <circle r="2.5" fill="#00F5FF" className="neon-glow-pulse">
                <animateMotion dur="3s" repeatCount="indefinite" path="M0,50 Q50,50 100,45" />
              </circle>
              <circle r="2" fill="#8B5CF6">
                <animateMotion dur="2.4s" repeatCount="indefinite" path="M0,25 Q50,25 100,20" />
              </circle>
            </svg>
          </div>
        </div>

        {/* RIGHT: Selected Pods & Internal Containers Grid */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-[#050816]/70 border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between text-[10px] font-mono font-bold tracking-wider uppercase text-cyber-cyan">
            <span>Running Pods: Namespace: {activeNamespace}</span>
            <Activity className="w-3.5 h-3.5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedPods.map((pod) => (
              <div 
                key={pod.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/40 dark:bg-[#111827]/30 hover:bg-slate-100/60 dark:hover:bg-[#111827]/60 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-800 dark:text-white truncate max-w-[80%]" title={pod.name}>
                      {pod.name}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-cyber-green" />
                  </div>
                  <span className="text-[9px] text-[#8B5CF6] font-mono mt-0.5 block">Worker VM Mapping: node-{pod.node}</span>
                </div>

                {/* Container tags */}
                <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-white/5">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Containers ({pod.containers.length})</span>
                  <div className="flex flex-wrap gap-1">
                    {pod.containers.map((c, idx) => (
                      <span 
                        key={idx}
                        className="text-[9px] font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 hover:border-cyber-cyan/30 transition-colors"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-2 border-t border-slate-100 dark:border-white/5">
                  <span className="flex items-center gap-1">
                    <Grid className="w-3 h-3 text-cyber-cyan" /> Traffic: <b className="text-slate-700 dark:text-white">{pod.traffic}</b>
                  </span>
                  <span>CPU: <b className="text-[#00FF85]">{pod.cpu}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

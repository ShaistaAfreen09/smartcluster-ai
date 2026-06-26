import React from "react";
import { 
  ShieldCheck, 
  Cpu, 
  HardDrive, 
  Layers, 
  Activity, 
  Clock,
  ArrowUpRight,
  TrendingDown
} from "lucide-react";
import { useMetrics } from "../../hooks/useMetrics";

interface KPICardsProps {
  performanceMultiplier: number;
}

export default function KPICards({ performanceMultiplier }: KPICardsProps) {
  const { clusterStatus, nodes, pods, wsConnected } = useMetrics();

  // Calculated fallback values
  const fallbackCpuVal = Math.min(100, Math.round(47 * performanceMultiplier));
  const fallbackMemVal = Math.min(100, Math.round(64 * ((performanceMultiplier + 1) / 2)));
  const fallbackPodsVal = Math.round(348 * performanceMultiplier);

  // Compute live values if available
  const hasLiveNodes = nodes && nodes.length > 0;
  
  const liveCpuVal = hasLiveNodes
    ? Math.round(nodes.reduce((sum, n) => sum + n.cpuUtilization, 0) / nodes.length)
    : fallbackCpuVal;

  const liveMemVal = hasLiveNodes
    ? Math.round(nodes.reduce((sum, n) => sum + n.memoryUtilization, 0) / nodes.length)
    : fallbackMemVal;

  const totalCores = hasLiveNodes
    ? nodes.reduce((sum, n) => sum + n.cpuCapacity, 0)
    : 32;

  const totalMemoryGB = hasLiveNodes
    ? nodes.reduce((sum, n) => sum + n.memoryCapacity, 0)
    : 256;

  const podsCount = pods && pods.length > 0 ? pods.length : fallbackPodsVal;
  
  const readyNodesCount = hasLiveNodes ? nodes.filter(n => n.status === "Ready").length : 12;
  const totalNodesCount = hasLiveNodes ? nodes.length : 12;

  const healthScore = clusterStatus && typeof clusterStatus.podHealthPercentage === "number"
    ? `${clusterStatus.podHealthPercentage.toFixed(1)}%` 
    : "99.98%";

  const cards = [
    {
      id: "health",
      title: "Cluster SRE Health",
      value: healthScore,
      details: clusterStatus?.status ? `Status: ${clusterStatus.status}` : "Status: Healthy",
      icon: ShieldCheck,
      color: "text-cyber-green",
      borderColor: "border-cyber-green/15",
      glow: "green-glow",
      subInfo: clusterStatus?.failedPods ? `${clusterStatus.failedPods} failing pods logged` : "Zero SLA incidents logged"
    },
    {
      id: "cpu",
      title: "Aggregate CPU Limits",
      value: `${liveCpuVal}%`,
      details: `${(totalCores * (liveCpuVal / 100)).toFixed(1)} / ${totalCores} vCPU`,
      icon: Cpu,
      color: "text-cyber-cyan",
      borderColor: "border-cyber-cyan/15",
      glow: "cyan-glow",
      subInfo: wsConnected ? "📡 WebSockets Realtime" : "🔄 REST Polling Core"
    },
    {
      id: "memory",
      title: "Memory Commit Pools",
      value: `${liveMemVal}%`,
      details: `${(totalMemoryGB * (liveMemVal / 100)).toFixed(0)} / ${totalMemoryGB} GB`,
      icon: HardDrive,
      color: "text-cyber-purple",
      borderColor: "border-cyber-purple/15",
      glow: "purple-glow",
      subInfo: "HPA buffer: 35% safe limit"
    },
    {
      id: "nodes",
      title: "Active Worker Nodes",
      value: `${readyNodesCount} / ${totalNodesCount}`,
      details: readyNodesCount === totalNodesCount ? "All instances active" : `${totalNodesCount - readyNodesCount} offline nodes`,
      icon: Layers,
      color: "text-cyber-green",
      borderColor: "border-cyber-green/10",
      glow: "",
      subInfo: "GKE node-pools: OK"
    },
    {
      id: "pods",
      title: "Total Running Pods",
      value: podsCount.toString(),
      details: `${pods.filter(p => p.status !== "Running" && p.status !== "Completed").length} unstable or pending`,
      icon: Activity,
      color: "text-cyber-orange",
      borderColor: "border-cyber-orange/15",
      glow: "",
      subInfo: `+${Math.max(1, Math.round(podsCount * 0.05))} launched proactively`
    }
  ];

  return (
    <div id="saas-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div 
            key={card.id}
            className={`p-4 bg-white dark:bg-[#0A0F1F] rounded-2xl border border-slate-200 dark:${card.borderColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative shadow-sm dark:shadow-none dark:${card.glow}`}
          >
            {/* Soft backdrop glow element */}
            <div className="absolute top-2 right-2 opacity-5 blur-md pointer-events-none">
              <Icon className={`w-16 h-16 ${card.color}`} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono tracking-wider text-slate-500 dark:text-slate-400 capitalize">{card.title}</span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>

            <div className="mt-3">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{card.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-300 font-mono mt-0.5">{card.details}</p>
            </div>

            <div className="border-t border-slate-100 dark:border-white/5 mt-3 pt-2.5 flex items-center justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500">
              <span>{card.subInfo}</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

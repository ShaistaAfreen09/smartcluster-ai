import React, { useState } from "react";
import { 
  ClusterStatus, 
  NodeSimulator, 
  PodSimulator 
} from "../types";
import { 
  Server, 
  Cpu, 
  Layers, 
  Activity, 
  RefreshCw, 
  Flame, 
  PowerOff, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Zap, 
  Network 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ClusterTopologyProps {
  status: ClusterStatus | null;
  loading: boolean;
  onRefresh: () => void;
  onSetWorkload: (type: "Standard" | "Spike" | "Underloaded" | "Periodic") => void;
  onScaleDeployment: (depName: string, replicas: number) => void;
}

export default function ClusterTopology({
  status,
  loading,
  onRefresh,
  onSetWorkload,
  onScaleDeployment
}: ClusterTopologyProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [scalingTarget, setScalingTarget] = useState<string | null>(null);
  const [customReplicas, setCustomReplicas] = useState<number>(3);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!status) {
    return (
      <div id="topology-loading-state" className="flex items-center justify-center p-12 min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading live Kubernetes simulation state...</p>
        </div>
      </div>
    );
  }

  const { nodes, deployments, namespaces, pods, activeWorkloadType, summary } = status;

  const handleScaleSubmit = (depName: string) => {
    onScaleDeployment(depName, customReplicas);
    setScalingTarget(null);
    setSuccessMsg(`Requested scaling patch for deployment/${depName} to ${customReplicas} replicas`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const getWorkloadStyle = (type: string) => {
    switch (type) {
      case "Spike":
        return "bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-700 dark:text-amber-300";
      case "Underloaded":
        return "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-300";
      case "Periodic":
        return "bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-700 dark:text-blue-300";
      default:
        return "bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300";
    }
  };

  return (
    <div id="cluster-topology-view" className="space-y-6">
      {/* Topology Title and Active Profile Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="text-blue-500" />
            Live Cluster Console
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time topology, node scheduling map & container allocations from virtual kube-scheduler.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="btn-refresh-cluster"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Sync Metrics
          </button>
        </div>
      </div>

      {/* SUCCESS POPUP ALERT */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TOPOLOGY SUMMARY BENTO GRID */}
      <div id="bento-grid-topology-summary" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cluster Capacity</span>
            <Server className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalNodes}</span>
            <span className="text-xs text-slate-400">Nodes Active</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {summary.totalCpuCapacity} Cores / {summary.totalMemCapacity} GiB RAM
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Pods</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalPods}</span>
            <span className="text-xs text-green-500">Live</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {namespaces.length} namespaces
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Kubernetes Scheduler Load</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary.currentCpuAllocated}
            </span>
            <span className="text-xs text-slate-400">m</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Total CPU currently requested
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Traffic Ingress</span>
            <Network className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary.currentTrafficRPS}
            </span>
            <span className="text-xs text-slate-400">RPS</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Live request rate to cluster gateway
          </div>
        </div>
      </div>

      {/* CLUSTER WORKLOAD INJECTOR AND STRESS LAB */}
      <div id="workload-stress-lab" className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 dark:backdrop-blur-sm shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="text-red-500 w-5 h-5 animate-pulse" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Workload & Stress Generation Panel
          </h3>
          <span className="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            Active: {activeWorkloadType}
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Simulate research-grade core scenarios from Kubernetes SRE operations. Inject traffic storms, ML training cycles, or underloaded environments to trigger scheduling shifts and auto-scaling evaluations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => onSetWorkload("Standard")}
            className={`p-3 text-left border rounded-xl transition-all ${
              activeWorkloadType === "Standard"
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-xs text-slate-900 dark:text-white">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              Standard Production
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Cyclical web server traffic, stable pod schedules (150-250 RPS).</p>
          </button>

          <button
            onClick={() => onSetWorkload("Spike")}
            className={`p-3 text-left border rounded-xl transition-all ${
              activeWorkloadType === "Spike"
                ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/20"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-xs text-slate-900 dark:text-white">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Workload Surge Spike
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Simulates high-demand events (e.g. flash sales) pushing ingress (up to 700 RPS).</p>
          </button>

          <button
            onClick={() => onSetWorkload("Periodic")}
            className={`p-3 text-left border rounded-xl transition-all ${
              activeWorkloadType === "Periodic"
                ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-500/20"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-xs text-slate-900 dark:text-white">
              <Activity className="w-3.5 h-3.5 text-purple-500" />
              Periodic Fluctuating
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Alternating peak and trough traffic cycles representing shift schedules.</p>
          </button>

          <button
            onClick={() => onSetWorkload("Underloaded")}
            className={`p-3 text-left border rounded-xl transition-all ${
              activeWorkloadType === "Underloaded"
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-xs text-slate-900 dark:text-white">
              <PowerOff className="w-3.5 h-3.5 text-emerald-500" />
              Underloaded Standby
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Idle weekend standby patterns, ideal for testing resource scale-downs and cost compression.</p>
          </button>
        </div>
      </div>

      {/* CLUSTER NODES TOPOLOGY GRID MAP */}
      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-8">
        Active Node Pool Allocation Map
      </h3>
      <div id="node-pool-allocation-map" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {nodes.map((node) => {
          const nodePods = pods.filter(p => p.node === node.name);
          const isSelected = selectedNode === node.name;
          
          return (
            <div
              key={node.name}
              onClick={() => setSelectedNode(isSelected ? null : node.name)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                isSelected 
                  ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/10 bg-white dark:bg-slate-900" 
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/30"
              }`}
            >
              {/* Node Title Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Cpu className={`w-5 h-5 ${node.role === "control-plane" ? "text-purple-500" : "text-blue-500"}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 dark:text-white truncate max-w-[170px]" title={node.name}>
                      {node.name.replace("gke-smartcluster-", "")}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 capitalize">{node.role} • {node.ip}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">{node.status}</span>
                </div>
              </div>

              {/* Resource progress-bars */}
              <div className="mt-5 space-y-3">
                {/* CPU usage */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 dark:text-slate-400">Node CPU Allocation</span>
                    <span className="font-medium text-slate-950 dark:text-white">{node.cpuUsagePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        node.cpuUsagePercent > 80 
                          ? "bg-red-500" 
                          : node.cpuUsagePercent > 60 
                            ? "bg-amber-500" 
                            : "bg-blue-500"
                      }`}
                      style={{ width: `${node.cpuUsagePercent}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">Allocated: {node.cpuAllocated}m / {node.cpuCapacity * 1000}m</span>
                </div>

                {/* Memory usage */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 dark:text-slate-400">Node Memory Allocation</span>
                    <span className="font-medium text-slate-950 dark:text-white">{node.memUsagePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        node.memUsagePercent > 80 
                          ? "bg-red-500" 
                          : node.memUsagePercent > 60 
                            ? "bg-amber-500" 
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${node.memUsagePercent}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">Allocated: {node.memAllocated}Mi / {node.memCapacity * 1024}Mi</span>
                </div>
              </div>

              {/* Scheduled Pod Mapping Dots */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                  Scheduled Pod Cells ({nodePods.length})
                </span>
                <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
                  {nodePods.map((p) => (
                    <span
                      key={p.id}
                      title={`Pod: ${p.name}\nStatus: ${p.status}\nCPU: ${p.cpuUsage}m`}
                      className={`inline-block w-4 h-4 rounded-md text-[8px] font-bold flex items-center justify-center transition-all ${
                        p.deployment === "ml-prediction-worker"
                          ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800/60"
                          : p.deployment === "api-gateway"
                            ? "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/60"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {p.deployment.substring(0, 1).toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED ACTIVE DEPLOYMENTS MANAGEMENT */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/40 overflow-hidden shadow-sm mt-8">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">Active Deployments (Dynamic Pod Controllers)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Scale target replicas under each active pods controller below.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800/60">
                <th className="p-4 rounded-tl-lg">Controller Name</th>
                <th className="p-4">Namespace</th>
                <th className="p-4 text-center">Status (Replicas)</th>
                <th className="p-4">Scaling Strategy</th>
                <th className="p-4">Labels</th>
                <th className="p-4 text-right rounded-tr-lg">Operator Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {deployments.map((dep) => (
                <tr key={dep.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {dep.name}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {dep.namespace}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                      {dep.availableReplicas} / {dep.replicas} Up-to-date
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-mono">{dep.strategy}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(dep.labels).map(([k, v]) => (
                        <span key={k} className="text-[9px] font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-1 rounded">
                          {k}={v}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {scalingTarget === dep.name ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={customReplicas}
                          onChange={(e) => setCustomReplicas(parseInt(e.target.value) || 1)}
                          className="w-12 p-1 border rounded dark:bg-slate-800 dark:border-slate-700 text-center font-bold"
                        />
                        <button
                          onClick={() => handleScaleSubmit(dep.name)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setScalingTarget(null)}
                          className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 p-1 rounded hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setScalingTarget(dep.name);
                          setCustomReplicas(dep.replicas);
                        }}
                        className="text-blue-500 hover:text-blue-600 font-semibold inline-flex items-center gap-1"
                      >
                        <AdjustScaleIcon className="w-3 h-3" />
                        Scale Replicas
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLUSTER CONTAINER INSTANCE LIST */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/40 overflow-hidden shadow-sm mt-8">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white">Active Kubernetes Pods Overview (Live Nodes Map)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Detailed container execution workloads currently active on GKE scheduler.</p>
        </div>
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800/60">
              <tr>
                <th className="p-4">Pod Name</th>
                <th className="p-4">State</th>
                <th className="p-4">Assigned Node</th>
                <th className="p-4">CPU Usage (Req / Limit)</th>
                <th className="p-4">RAM Allocation (Req / Limit)</th>
                <th className="p-4 text-center">Restarts</th>
                <th className="p-4 text-right">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {pods.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all font-mono">
                  <td className="p-4 font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={p.name}>
                    {p.name}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{p.node.replace("gke-smartcluster-", "")}</td>
                  <td className="p-4 text-slate-900 dark:text-white">
                    <span className="font-semibold">{p.cpuUsage}m</span>
                    <span className="text-slate-400 text-[10px]"> / {p.cpuRequest}m | {p.cpuLimit}m</span>
                  </td>
                  <td className="p-4 text-slate-900 dark:text-white">
                    <span className="font-semibold">{p.memUsage}Mi</span>
                    <span className="text-slate-400 text-[10px]"> / {p.memRequest}Mi | {p.memLimit}Mi</span>
                  </td>
                  <td className="p-4 text-center text-slate-400 font-semibold">{p.restarts}</td>
                  <td className="p-4 text-right text-slate-500 dark:text-slate-400">{p.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Visual Icons helpers
function AdjustScaleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M4 14h6v6" />
      <path d="m4 20 10-10" />
      <path d="M20 10h-6V4" />
      <path d="m20 4-10 10" />
    </svg>
  );
}

import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import AppLayout from "../components/layout/AppLayout";
import KPICards from "../components/dashboard/KPICards";
import InsightsPanel from "../components/dashboard/InsightsPanel";
import TopologyMap from "../components/dashboard/TopologyMap";
import TelemetryCharts from "../components/dashboard/TelemetryCharts";
import ScalingSimulator from "../components/ScalingSimulator";
import RecommendationEngine from "../components/RecommendationEngine";
import PredictiveAnalytics from "../components/PredictiveAnalytics";

import { useMetrics } from "../hooks/useMetrics";

import { 
  Sliders, 
  RefreshCw, 
  Zap, 
  Terminal, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Database, 
  CheckCircle2, 
  Lock, 
  Share2,
  Activity,
  Sparkles
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSection = searchParams.get("section") || "overview";
  const [activeSection, setActiveSection] = useState<string>(initialSection);
  const [settingsTab, setSettingsTab] = useState<"account" | "preferences" | "security">("account");
  const [selectedCluster, setSelectedCluster] = useState<string>("gke-core-prod-01");

  // React to search param changes
  React.useEffect(() => {
    const section = searchParams.get("section");
    if (section && section !== activeSection) {
      setActiveSection(section);
    }
  }, [searchParams]);

  // Synchronize state changes back to searchParams (for visual consistency and back navigation)
  const handleActiveSectionChange = (section: string) => {
    setActiveSection(section);
    setSearchParams({ section });
  };
  
  // High fidelity interactive stress multiplier state
  const [performanceMultiplier, setPerformanceMultiplier] = useState<number>(1.0);
  const [scenarioName, setScenarioName] = useState<string>("Standard Stable Operations");

  // Consume our real-time reactive metrics engine
  const { loading: assetsLoading, nodes: nodesList, pods: podsList, deployments: deploymentsList, refresh: refreshMetrics } = useMetrics();

  // Live Machine Learning Prediction States
  const [predictionData, setPredictionData] = useState<any>(null);
  const [predictionsLoading, setPredictionsLoading] = useState<boolean>(false);

  const fetchPredictions = async () => {
    setPredictionsLoading(true);
    try {
      const r = await fetch("/api/cluster/predict");
      if (!r.ok) throw new Error("Could not fetch predictions");
      const d = await r.json();
      setPredictionData(d);
    } catch (e) {
      console.error("Failed to query live GKE predictions:", e);
    } finally {
      setPredictionsLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeSection === "predictions") {
      fetchPredictions();
    }
  }, [activeSection]);

  const triggerScenario = async (multiplier: number, name: string) => {
    setPerformanceMultiplier(multiplier);
    setScenarioName(name);

    // Map multiplier to backend workload profile type
    let workloadType = "Standard";
    if (multiplier === 1.8) workloadType = "Spike";
    else if (multiplier === 0.4) workloadType = "Underloaded";

    try {
      await fetch("/api/cluster/set-workload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: workloadType })
      });
      
      // Re-fetch active GKE assets if viewing listings to sync state instantly
      if (["nodes", "pods", "deployments"].includes(activeSection)) {
        refreshMetrics();
      }
    } catch (e) {
      console.error("Failed to sync workload state to server:", e);
    }
  };

  return (
    <AppLayout 
      activeSection={activeSection} 
      setActiveSection={handleActiveSectionChange}
      selectedCluster={selectedCluster}
      setSelectedCluster={setSelectedCluster}
    >
      {/* 1. OVERVIEW VIEWPORT */}
      {activeSection === "overview" && (
        <div id="dashboard-overview-canvas" className="space-y-8 animate-fade-in">
          
          {/* Top Control Header Accent */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0A0F1F] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
            <div>
              <span className="text-[10px] font-mono text-cyber-purple font-extrabold uppercase tracking-widest block">Operational Scenario Control Panel</span>
              <h3 className="text-base font-extrabold text-[#0D1B2A] dark:text-white mt-1 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyber-cyan" />
                Active Workload Simulation Lab
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Inject custom load multipliers or trigger pre-configured scenario spikes to observe autonomic SRE actions.</p>
            </div>

            {/* Quick Actions Actions */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => triggerScenario(1.0, "Standard Stable Operations")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all border ${
                  performanceMultiplier === 1.0 
                    ? "bg-slate-100 dark:bg-[#111827] text-cyber-cyan border-cyber-cyan font-bold" 
                    : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
              >
                Stable (1.0x)
              </button>

              <button 
                onClick={() => triggerScenario(1.8, "Flash Sale Surge Triggered")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all border ${
                  performanceMultiplier === 1.8 
                    ? "bg-slate-100 dark:bg-[#111827] text-cyber-purple border-cyber-purple font-bold" 
                    : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
              >
                Flash Surge (1.8x)
              </button>

              <button 
                onClick={() => triggerScenario(0.4, "Weekend Minimal Load Range")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all border ${
                  performanceMultiplier === 0.4 
                    ? "bg-slate-100 dark:bg-[#111827] text-cyber-green border-cyber-green font-bold" 
                    : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
              >
                Weekend Drop (0.4x)
              </button>
            </div>
          </div>

          {/* DYNAMIC SCENARIO TELEMETRY TICKER */}
          <div className="flex items-center justify-between text-xs font-mono p-3 bg-cyber-cyan/5 border border-cyber-cyan/15 rounded-xl text-cyber-cyan text-glow-cyan">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyber-cyan animate-pulse" />
              SRE_WORKSPACE_SIM_EVENT: <b className="text-slate-800 dark:text-white uppercase">{scenarioName}</b>
            </span>
            <span>Multiplier: <b>{performanceMultiplier}x</b></span>
          </div>

          {/* KPI Cards Grid */}
          <KPICards performanceMultiplier={performanceMultiplier} />

          {/* AI Insights Digest Frame */}
          <InsightsPanel />

          {/* Kubernetes Visual Topology Map */}
          <TopologyMap />

          {/* Telemetry Curves Plots */}
          <TelemetryCharts />

        </div>
      )}

      {/* 2. CLUSTERS VIEWPORT */}
      {activeSection === "clusters" && (
        <div className="space-y-6 animate-fade-in p-6 bg-white dark:bg-[#0A0F1F] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
          <div className="border-b border-slate-150 dark:border-white/5 pb-4 mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="text-cyber-cyan animate-pulse" /> Active GKE cluster Registry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">SRE cluster inventory details across regional cloud infrastructures.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#111827]/35 space-y-3">
              <span className="text-[10px] text-cyber-cyan uppercase font-bold tracking-widest font-mono">PRIMARY PRODUCTION</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">gke-core-prod-01</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">Asia East 1 | 12 active worker instances | 348 replica deployments</p>
              <div className="text-[10px] font-mono text-slate-500 py-1.5 border-t border-slate-200 dark:border-white/5">Status: Operational (99.98% SLA)</div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#111827]/35 space-y-3 opacity-60">
              <span className="text-[10px] text-cyber-purple uppercase font-bold tracking-widest font-mono">EDGE LATENCY ACCEL</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">gke-edge-asia-02</h4>
              <p className="text-xs text-slate-650 dark:text-slate-400">Singapore Edge | 6 active instances | 140 replica deployments</p>
              <div className="text-[10px] font-mono text-slate-500 py-1.5 border-t border-slate-200 dark:border-white/5">Status: Synced</div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#111827]/35 space-y-3 opacity-60">
              <span className="text-[10px] text-cyber-orange uppercase font-bold tracking-widest font-mono">EUROPE COMPLIANCE BILLING</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">gke-billing-eu-03</h4>
              <p className="text-xs text-slate-650 dark:text-slate-400">Frankfurt West 4 | 4 active instances | 80 replica deployments</p>
              <div className="text-[10px] font-mono text-slate-500 py-1.5 border-t border-slate-200 dark:border-white/5">Status: Synced</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. NODES/PODS/DEPLOYMENTS/NAMESPACES LIST CHANNELS */}
      {(activeSection === "nodes" || activeSection === "pods" || activeSection === "deployments" || activeSection === "namespaces") && (
        <div className="space-y-6 animate-fade-in p-6 bg-white dark:bg-[#0A0F1F] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
          <div className="border-b border-slate-150 dark:border-white/5 pb-4 mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 capitalize">
              <Database className="text-cyber-cyan" /> Deployed Cluster {activeSection} Assets
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time GKE telemetry manifest tables of targeted cluster {selectedCluster}</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#050816]/70 rounded-xl border border-slate-200 dark:border-white/5 space-y-3 font-mono text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2 text-cyber-orange">
              <Info className="w-4 h-4 shrink-0" />
              <span>LOG: Retreiving direct GKE metadata manifests for cluster {selectedCluster}</span>
            </div>
            
            {assetsLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                <RefreshCw className="w-6 h-6 text-cyber-cyan animate-spin mb-2" />
                <span>SCRAPING_GKE_CONTAINER_RUNTIME_METADATA_STREAM...</span>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-white/5 rounded-lg overflow-hidden">
                {activeSection === "nodes" && (
                  <>
                    <div className="grid grid-cols-5 bg-slate-100 dark:bg-[#111827] p-2.5 font-bold uppercase tracking-wider text-[10px] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/5">
                      <span>Node Name</span>
                      <span>CPU capacity</span>
                      <span>CPU utilization</span>
                      <span>RAM capacity</span>
                      <span>RAM utilization</span>
                    </div>
                    <div className="divide-y divide-slate-150 dark:divide-white/5">
                      {nodesList.map((n, idx) => (
                        <div key={idx} className="grid grid-cols-5 p-2.5">
                          <span className="text-slate-900 dark:text-white font-bold truncate pr-2">{n.name}</span>
                          <span>{n.cpuCapacity} Cores</span>
                          <span className={n.cpuUtilization > 80 ? "text-cyber-red font-bold" : "text-cyber-cyan font-bold"}>{n.cpuUtilization}%</span>
                          <span>{n.memoryCapacity} GB</span>
                          <span className={n.memoryUtilization > 80 ? "text-cyber-red font-bold" : "text-cyber-purple font-bold"}>{n.memoryUtilization}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeSection === "pods" && (
                  <>
                    <div className="grid grid-cols-5 bg-slate-100 dark:bg-[#111827] p-2.5 font-bold uppercase tracking-wider text-[10px] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/5">
                      <span>Pod Name</span>
                      <span>Namespace</span>
                      <span>CPU usage</span>
                      <span>Memory usage</span>
                      <span>Restarts / Status</span>
                    </div>
                    <div className="divide-y divide-slate-150 dark:divide-white/5">
                      {podsList.map((p, idx) => (
                        <div key={idx} className="grid grid-cols-5 p-2.5">
                          <span className="text-slate-900 dark:text-white font-bold truncate pr-3">{p.name}</span>
                          <span className="text-slate-500 dark:text-slate-400 text-[10px]">{p.namespace}</span>
                          <span className="text-[#00FF85]">{p.cpuUsage}m</span>
                          <span>{p.memoryUsage}Mi</span>
                          <span className={p.restartCount > 0 ? "text-cyber-orange" : "text-cyber-green font-bold"}>
                            {p.restartCount} rests | {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeSection === "deployments" && (
                  <>
                    <div className="grid grid-cols-4 bg-slate-100 dark:bg-[#111827] p-2.5 font-bold uppercase tracking-wider text-[10px] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/5">
                      <span>Deployment name</span>
                      <span>Namespace</span>
                      <span>Active / Desired</span>
                      <span>Scaling Status</span>
                    </div>
                    <div className="divide-y divide-slate-150 dark:divide-white/5">
                      {deploymentsList.map((d, idx) => (
                        <div key={idx} className="grid grid-cols-4 p-2.5">
                          <span className="text-slate-900 dark:text-white font-bold">{d.name}</span>
                          <span>{d.namespace}</span>
                          <span>{d.replicas} / {d.desiredReplicas} replicas</span>
                          <span className="text-cyber-purple font-bold uppercase tracking-wide text-[10px]">{d.autoscalingState}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeSection === "namespaces" && (
                  <>
                    <div className="grid grid-cols-4 bg-slate-100 dark:bg-[#111827] p-2.5 font-bold uppercase tracking-wider text-[10px] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/5">
                      <span>Namespace ID</span>
                      <span>Resource Quotas</span>
                      <span>Network Policies</span>
                      <span>Audited Status</span>
                    </div>
                    <div className="divide-y divide-slate-150 dark:divide-white/5">
                      {["default", "kube-system", "monitoring", "smartcluster-apps"].map((ns, idx) => (
                        <div key={idx} className="grid grid-cols-4 p-2.5">
                          <span className="text-slate-900 dark:text-white font-bold">{ns}</span>
                          <span>{ns === "kube-system" ? "None" : ns === "monitoring" ? "High Budget" : "16 vCPU, 64 GB limit"}</span>
                          <span className={ns === "default" ? "text-cyber-orange font-bold" : "text-cyber-green font-bold"}>
                            {ns === "default" ? "In Progress" : "Enforced"}
                          </span>
                          <span className="text-cyber-cyan font-bold">MONITORED</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. CPU/MEMORY/NETWORK SPECIFIC MONITORING VIEW */}
      {(activeSection === "cpu" || activeSection === "memory" || activeSection === "network" || activeSection === "storage") && (
        <div className="space-y-6 animate-fade-in p-6 bg-white dark:bg-[#0A0F1F] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
          <div className="border-b border-slate-150 dark:border-white/5 pb-4 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 capitalize">
                <Activity className="text-cyber-orange animate-pulse" /> microscopic telemetry: {activeSection}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Granular Prometheus scrapers charting realtime socket counters.</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 dark:bg-white/5 border border-slate-250 dark:border-white/10 px-3 py-1 rounded text-slate-600 dark:text-slate-300">PromQL scrapers</span>
          </div>

          <TelemetryCharts />
        </div>
      )}

      {/* 5. PREDICTION MODEL REGRESSSIONS VIEWER */}
      {activeSection === "predictions" && (
        <div className="p-6 bg-white dark:bg-[#0A0F1F] rounded-2xl border border-slate-200 dark:border-white/5 space-y-6 animate-fade-in shadow-sm dark:shadow-none">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="text-cyber-purple text-glow-purple" /> Machine Learning Regression Projections
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Regression lines predicting cluster workloads based on dynamic historical ingress models</p>
          </div>
          
          {/* Include original predictive analytics module cleanly */}
          <PredictiveAnalytics predictionData={predictionData} loading={predictionsLoading} />
        </div>
      )}

      {/* 6. AI RECOMMENDATIONS & DYNAMIC YAML PATCH REGISTRY */}
      {activeSection === "recommendations" && (
        <div className="p-6 bg-white dark:bg-[#0A0F1F] rounded-2xl border border-slate-200 dark:border-white/5 space-y-6 animate-fade-in shadow-sm dark:shadow-none">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-cyber-green text-glow-green" /> Autonomic SRE Code Patching
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gemini AI model output files suggesting LimitRanges, namespace limits, and replicas quotas.</p>
          </div>

          <RecommendationEngine onRefreshAll={() => {}} />
        </div>
      )}

      {/* 7. AUTOSCALING COMPARATIVE SIMULATOR (ORIGINAL AUDIT SIMULATOR) */}
      {activeSection === "autoscaling" && (
        <div className="p-6 bg-white dark:bg-[#0A0F1F] rounded-2xl border border-slate-200 dark:border-white/5 space-y-6 animate-fade-in shadow-sm dark:shadow-none">
          <div className="border-b border-slate-150 dark:border-white/5 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="text-cyber-cyan" /> Comparative Scaling SRE Audit Logbook
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Validate reactive Horizonal Pod Autoscaler thresholds compared directly with pro-active AI scheduling triggers.</p>
          </div>

          <ScalingSimulator />
        </div>
      )}

      {/* 8. SETTINGS VIEWPORTS */}
      {activeSection === "settings" && (
        <div className="space-y-6 animate-fade-in p-6 bg-white dark:bg-[#0A0F1F] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none max-w-3xl">
          <div className="border-b border-slate-150 dark:border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="text-cyber-cyan" /> SRE Platform Configurations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage secure user sessions, scrape telemetry boundaries, and credentials metadata.</p>
            </div>

            {/* Sub-tabs selector */}
            <div className="flex bg-slate-100 dark:bg-[#0A0F1F] border border-slate-200 dark:border-white/5 p-1 rounded-xl font-mono text-[10px] font-bold">
              <button
                onClick={() => setSettingsTab("account")}
                className={`px-3 py-1.5 rounded-lg transition ${settingsTab === "account" ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200/50 dark:border-white/5" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
              >
                ACCOUNT
              </button>
              <button
                onClick={() => setSettingsTab("preferences")}
                className={`px-3 py-1.5 rounded-lg transition ${settingsTab === "preferences" ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200/50 dark:border-white/5" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
              >
                PREFERENCES
              </button>
              <button
                onClick={() => setSettingsTab("security")}
                className={`px-3 py-1.5 rounded-lg transition ${settingsTab === "security" ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200/50 dark:border-white/5" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
              >
                SECURITY
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Account Tab */}
            {settingsTab === "account" && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-5 bg-slate-50 dark:bg-[#111827]/40 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row gap-4 items-center">
                  <img
                    src={user?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                    alt="Account Avatar"
                    className="w-14 h-14 rounded-xl border-2 border-cyber-cyan shadow-md shadow-cyber-cyan/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-center sm:text-left space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {user?.displayName || "Alex Mercer"}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {user?.email || "alex.mercer@smartcluster.ai"}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1 justify-center sm:justify-start">
                      <span className="text-[9px] bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/15 px-2 py-0.5 rounded font-extrabold uppercase">
                        Role: {user?.workspaceRole || "Admin"}
                      </span>
                      <span className="text-[9px] bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/15 px-2 py-0.5 rounded font-extrabold">
                        Verified OAuth 2.0
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#111827]/40 rounded-xl border border-slate-200 dark:border-white/5 space-y-3">
                  <h5 className="text-slate-900 dark:text-white font-bold text-xs">Access Clusters Configuration</h5>
                  <div className="flex flex-col gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                    {user?.clusterAccess?.map((cluster) => (
                      <div key={cluster} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyber-green" />
                        <span>{cluster} <b className="text-cyber-cyan uppercase">[PROD_ACCESS]</b></span>
                      </div>
                    )) || (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyber-green" />
                          <span>gke-core-prod-01 <b className="text-cyber-cyan uppercase">[PROD_ACCESS]</b></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyber-green" />
                          <span>gke-edge-asia-02 <b className="text-cyber-cyan uppercase">[PROD_ACCESS]</b></span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#111827]/40 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
                  <span className="text-slate-500 dark:text-slate-450 block text-[10px]">Session Gateway Verification Code</span>
                  <span className="text-slate-900 dark:text-white font-semibold break-all text-[9px] select-all bg-slate-100 dark:bg-[#050816] p-2 rounded block">
                    {user?.uid || "sre-lead-98-simulated"}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[9px] block pt-1">
                    Last Gateway Connection: {user?.loginTimestamp ? new Date(user.loginTimestamp).toLocaleString() : new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {settingsTab === "preferences" && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-slate-50 dark:bg-[#111827]/40 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                  <h5 className="text-slate-900 dark:text-white font-bold">Autonomic Orchestration Hook</h5>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Toggle proactive deployment triggers automatically. Keeps cluster in active sizing state.</p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyber-green animate-pulse" />
                    <span className="text-cyber-green font-bold text-[10px]">HOOK_ACTIVE_AUTONOMIC</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#111827]/40 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                  <h5 className="text-slate-900 dark:text-white font-bold">Scraping intervals (Seconds)</h5>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Set metric ingestion bounds. Lower is higher precision, but adds vCPU load to master server nodes.</p>
                  <input 
                    type="number" 
                    defaultValue={5} 
                    className="bg-white dark:bg-[#050816] rounded border border-slate-200 dark:border-white/10 px-3 py-1.5 focus:outline-none focus:border-cyber-cyan text-slate-900 dark:text-white w-24"
                  />
                </div>
              </div>
            )}

            {/* Security Tab */}
            {settingsTab === "security" && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-slate-50 dark:bg-[#111827]/40 rounded-xl border border-slate-200 dark:border-white/5 space-y-2.5">
                  <h5 className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyber-purple" /> Credentials Security
                  </h5>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Manage Gemini secret tokens and Firebase Client setups through environment keys, securing variables privately.</p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-cyber-green font-extrabold">
                    <ShieldCheck className="w-3.5 h-3.5" /> SECURE_SSL_SESSION_ACTIVE
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#111827]/40 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                  <h5 className="text-slate-900 dark:text-white font-bold">Role Capabilities Audit</h5>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Below is the list of platform permissions granted under your current RBAC security level:</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <span className="text-cyber-green">✔</span> READ_METRICS
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <span className="text-cyber-green">✔</span> VIEW_PREDICTIONS
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      {user?.workspaceRole === "Operator" || user?.workspaceRole === "Admin" ? (
                        <span className="text-cyber-green">✔</span>
                      ) : (
                        <span className="text-cyber-red">✘</span>
                      )}
                      MANUAL_SCALING
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      {user?.workspaceRole === "Admin" ? (
                        <span className="text-cyber-green">✔</span>
                      ) : (
                        <span className="text-cyber-red">✘</span>
                      )}
                      WRITE_SYSTEM_CONFIG
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </AppLayout>
  );
}

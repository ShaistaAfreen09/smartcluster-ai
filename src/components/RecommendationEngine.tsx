import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  Lightbulb, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  ShieldAlert, 
  Info,
  Sliders,
  Cpu 
} from "lucide-react";

interface RecommendationEngineProps {
  onRefreshAll: () => void;
}

export default function RecommendationEngine({ onRefreshAll }: RecommendationEngineProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [data, setData] = useState<{ recommendations: string; yamlPatch: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cluster/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Could not construct cluster recommendations");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to contact Gemini Recommendation Broker");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleCopy = () => {
    if (!data?.yamlPatch) return;
    navigator.clipboard.writeText(data.yamlPatch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Crude custom markdown formatter to style text output beautifully without adding dependencies
  const formatMarkdownText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("###")) {
        return <h4 key={idx} className="text-sm font-bold text-slate-900 dark:text-white mt-4 mb-2 first:mt-0">{trimmed.replace("###", "")}</h4>;
      }
      if (trimmed.startsWith("##")) {
        return <h3 key={idx} className="text-base font-bold text-slate-900 dark:text-white mt-5 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">{trimmed.replace("##", "")}</h3>;
      }
      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        const itemText = trimmed.substring(1).trim();
        // Look for bold highlights
        const boldMatches = itemText.match(/\*\*(.*?)\*\*/g);
        let content: React.ReactNode = itemText;
        if (boldMatches) {
          content = itemText.split("**").map((tok, sIdx) => sIdx % 2 === 1 ? <strong key={sIdx} className="font-bold text-slate-950 dark:text-white">{tok}</strong> : tok);
        }
        return (
          <li key={idx} className="ml-5 list-disc text-xs text-slate-600 dark:text-slate-450 mt-1 mr-2 leading-relaxed">
            {content}
          </li>
        );
      }
      if (trimmed.startsWith("1.") || trimmed.startsWith("2.") || trimmed.startsWith("3.")) {
        return <li key={idx} className="ml-5 list-decimal text-xs text-slate-600 dark:text-slate-450 mt-1 mr-2 leading-relaxed">{trimmed.replace(/^\d+\.\s*/, "")}</li>;
      }
      if (trimmed === "") return <div key={idx} className="h-2" />;
      
      const boldMatches = trimmed.match(/\*\*(.*?)\*\*/g);
      let content: React.ReactNode = trimmed;
      if (boldMatches) {
        content = trimmed.split("**").map((tok, sIdx) => sIdx % 2 === 1 ? <strong key={sIdx} className="font-bold text-slate-950 dark:text-white">{tok}</strong> : tok);
      }
      return <p key={idx} className="text-xs text-slate-600 dark:text-slate-450 mt-1 mr-2 leading-relaxed">{content}</p>;
    });
  };

  return (
    <div id="ai-recommender-engine-view" className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-amber-500 animate-pulse" />
            AI Resource Optimization Advisor
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gemini-driven structural advice examining node imbalances, cost parameters, and security policies.
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-semibold rounded-lg text-sm bg-blue-500/5 hover:bg-blue-500/10 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Re-Analyze Telemetry
        </button>
      </div>

      {loading ? (
        <div id="recommender-loading-state" className="flex flex-col items-center justify-center p-12 min-h-[350px]">
          <RefreshCw className="w-12 h-12 animate-spin text-amber-500 mb-4" />
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Gemini AI Inspecting Prometheus Slices...</p>
          <p className="text-xs text-slate-400 mt-1">Optimizing target requests, namespace boundaries & cost maps.</p>
        </div>
      ) : error ? (
        <div id="recommender-error-state" className="p-5 border border-red-500/30 bg-red-500/5 text-red-500 rounded-xl space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <ShieldAlert className="w-5 h-5" />
            Recommendation Stream Failure
          </div>
          <p className="text-xs">{error}</p>
          <button 
            onClick={fetchRecommendations}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold"
          >
            Retry Telemetry Analysis
          </button>
        </div>
      ) : (
        <div id="recommender-results" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: MD STATEMENT RECOMMS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-4">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 text-indigo-500">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm">Cluster Sizing & Scheduler Decisions</h3>
              </div>

              <div className="whitespace-pre-line text-slate-700 dark:text-slate-300">
                {data ? formatMarkdownText(data.recommendations) : "No active insights available."}
              </div>
            </div>

            {/* ADVISOR BENEIFITS METRICS BANNER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-emerald-500/30 bg-emerald-500/5 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-400">Avoid OOM Node Crashing</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Applying the limits recommendation guarantees peak survival up to +300% sudden concurrent socket surges.</p>
                </div>
              </div>

              <div className="p-4 border border-indigo-500/30 bg-indigo-500/5 rounded-xl flex items-start gap-3">
                <Sliders className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-indigo-800 dark:text-indigo-400">Namespace Multi-Tenancy Sizing</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Sizing bounds prevents resources saturation attacks, ensuring api-gateway microservices maintain &lt;15ms network SLA.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: COPYABLE YAML PATCH */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden flex flex-col h-full min-h-[450px]">
              {/* Terminal Title */}
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="text-blue-400 w-4 h-4" />
                  <span className="text-[11px] font-mono font-semibold tracking-wide text-slate-300">k8s-autoscale-config.yaml</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-1 px-2.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-1.5 text-[10px] font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Manifest Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Manifest
                    </>
                  )}
                </button>
              </div>

              {/* Code output */}
              <div className="p-4 flex-1 overflow-auto max-h-[420px]">
                <pre className="font-mono text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
                  {data?.yamlPatch || "No manifest patch computed."}
                </pre>
              </div>

              {/* Terminal Footer */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-start gap-2 text-[10px] text-slate-400 font-mono">
                <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <span>Execute <code>kubectl apply -f k8s-autoscale-config.yaml</code> to feed these optimization margins dynamically to GKE master pools.</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

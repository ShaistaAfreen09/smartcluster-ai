import React from "react";
import { 
  Sparkles, 
  Activity, 
  AlertOctagon, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight, 
  Coins, 
  Copy, 
  Check 
} from "lucide-react";

export default function InsightsPanel() {
  const [copiedUid, setCopiedUid] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUid(id);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const insights = [
    {
      id: "pred-cpu",
      type: "PREDICTION",
      title: "High CPU Congestion Forecasted",
      desc: "Incoming ingress payload trend indicates CPU usage will reach 89% limits within 20 minutes.",
      confidence: "94%",
      metric: "Predicted load spikes count: 3",
      icon: TrendingUp,
      colorClass: "text-cyber-purple bg-cyber-purple/10 border-cyber-purple/20",
      actionText: "Accept pre-scale parameters",
      actionCmd: "kubectl scale deployment user-profile-service --replicas=8"
    },
    {
      id: "scale-rec",
      type: "SCALING ADVISOR",
      title: "Optimize Payment-Service pod limit",
      desc: "Increase payment-service target base capacity to survive downstream transaction checkout peaks safely.",
      confidence: "98%",
      metric: "Replicas: 5 → 8 recommended",
      icon: Sparkles,
      colorClass: "text-cyber-green bg-cyber-green/10 border-cyber-green/20",
      actionText: "Apply manifest patch",
      actionCmd: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: payment-service\nspec:\n  replicas: 8"
    },
    {
      id: "cost-opt",
      type: "COST EFFICIENCY",
      title: "Consolidate Undersized worker VMs",
      desc: "Node utilization patterns prove GKE instance pools can pack pods tightly. Re-organize resources now.",
      confidence: "91%",
      metric: "Monthly Savings: $1,250 verified",
      icon: Coins,
      colorClass: "text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/20",
      actionText: "Optimize VM cluster pool",
      actionCmd: "gcloud container node-pools rollback gke-cluster-pool"
    },
    {
      id: "anomaly-detect",
      type: "ANOMALY DETECTION",
      title: "Ingress Network spike alert",
      desc: "Unusual load traffic profile identified in `ingress-controller-east-01` namespace matching DDoS threat models.",
      confidence: "87%",
      metric: "Payload mismatch: 4.8MB sockets size",
      icon: AlertOctagon,
      colorClass: "text-cyber-red bg-cyber-red/10 border-cyber-red/20",
      actionText: "Trigger emergency sandbox rules",
      actionCmd: "kubectl apply -f rate-limiting-policy.yaml"
    }
  ];  return (
    <div className="bg-white dark:bg-[#0A0F1F] rounded-2xl border border-slate-200 dark:border-white/5 p-6 font-sans shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyber-purple/15 text-cyber-purple">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">SmartCluster AI Insights Digest</h4>
            <p className="text-[10px] text-slate-500">Autonomic recommendation arrays generated under active Gemini metrics evaluation</p>
          </div>
        </div>
        <span className="text-[9px] font-mono bg-cyber-purple/10 border border-cyber-purple/20 text-cyber-purple font-bold px-2 py-0.5 rounded tracking-widest uppercase">
          AI CONTROL ON
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {insights.map((ins) => {
          const Icon = ins.icon;
          const isCopied = copiedUid === ins.id;
          return (
            <div 
              key={ins.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#111827]/40 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300 relative overflow-hidden"
            >
              {/* Highlight ribbon */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.8 rounded-lg ${ins.colorClass} border`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold tracking-wider text-slate-500 uppercase">{ins.type}</span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{ins.title}</h5>
                  </div>
                </div>
                
                <div className="text-right leading-none">
                  <span className="text-[10px] font-bold text-cyber-green font-mono">{ins.confidence}</span>
                  <span className="text-[8px] font-mono text-slate-500 block mt-0.5 uppercase tracking-widest font-semibold">CONFIDENCE</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">{ins.desc}</p>
              
              <div className="p-3 bg-slate-100 dark:bg-[#050816]/75 rounded-lg border border-slate-200 dark:border-white/5 flex items-center justify-between font-mono text-[10px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{ins.metric}</span>
                <button
                  onClick={() => handleCopy(ins.id, ins.actionCmd)}
                  className="p-1 px-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1 cursor-pointer"
                  title="Copy command to clipboard"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono tracking-wider">RECOMMENDED ACTION</span>
                <button className="text-[10px] items-center gap-1 text-cyber-cyan hover:underline transition font-bold flex">
                  {ins.actionText} <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

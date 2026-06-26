import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { 
  Server, 
  Layers, 
  Cpu, 
  Activity, 
  Heart, 
  TrendingUp, 
  Sparkles, 
  GitFork, 
  Settings, 
  ChevronRight, 
  LogOut, 
  CheckCircle2, 
  Eye, 
  Zap, 
  AlertOctagon, 
  HardDrive, 
  Lock, 
  Scale, 
  DollarSign,
  Bot
} from "lucide-react";
import { motion } from "motion/react";

interface SidebarProps {
  onNavClick?: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export default function Sidebar({ onNavClick, activeSection, setActiveSection }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: "Overview",
      items: [
        { id: "overview", label: "Overview", icon: Layers, glowColor: "cyber-cyan" },
        { id: "clusters", label: "Clusters", icon: Server, glowColor: "cyber-purple" },
        { id: "nodes", label: "Nodes", icon: Cpu, glowColor: "cyber-green" },
        { id: "pods", label: "Pods", icon: Activity, glowColor: "cyber-cyan" },
        { id: "deployments", label: "Deployments", icon: GitFork, glowColor: "cyber-purple" },
        { id: "namespaces", label: "Namespaces", icon: HardDrive, glowColor: "cyber-orange" }
      ]
    },
    {
      title: "Monitoring",
      items: [
        { id: "cpu", label: "CPU Metrics", icon: Cpu, glowColor: "cyber-orange" },
        { id: "memory", label: "Memory Metrics", icon: Heart, glowColor: "cyber-red" },
        { id: "network", label: "Network", icon: Activity, glowColor: "cyber-cyan" },
        { id: "storage", label: "Storage", icon: HardDrive, glowColor: "cyber-purple" }
      ]
    },
    {
      title: "AI Engine",
      items: [
        { id: "ai-assistant", label: "AI SRE Chat", icon: Bot, glowColor: "cyber-purple" },
        { id: "predictions", label: "Predictions", icon: TrendingUp, glowColor: "cyber-purple" },
        { id: "anomalies", label: "Anomaly Detection", icon: AlertOctagon, glowColor: "cyber-red" },
        { id: "recommendations", label: "Recommendations", icon: Sparkles, glowColor: "cyber-green" }
      ]
    },
    {
      title: "Infrastructure",
      items: [
        { id: "autoscaling", label: "Autoscaling", icon: Scale, glowColor: "cyber-cyan" },
        { id: "policies", label: "Policies", icon: Lock, glowColor: "cyber-purple" },
        { id: "costs", label: "Cost Optimization", icon: DollarSign, glowColor: "cyber-green" }
      ]
    },
    {
      title: "Config",
      items: [
        { id: "settings", label: "Settings", icon: Settings, glowColor: "cyber-orange" }
      ]
    }
  ];

  const handleMenuClick = (id: string) => {
    if (id === "ai-assistant") {
      navigate("/ai-assistant");
    } else {
      if (location.pathname === "/ai-assistant") {
        navigate(`/dashboard?section=${id}`);
      } else {
        setActiveSection(id);
      }
    }
    if (onNavClick) {
      onNavClick();
    }
  };

  return (
    <aside className="w-72 bg-white dark:bg-[#0A0F1F] border-r border-slate-200 dark:border-white/5 flex flex-col h-screen sticky top-0 font-sans shrink-0 overflow-y-auto transition-colors duration-350">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-[#050816]/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-cyber-cyan shadow-md shadow-purple-500/25">
            <Server className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white">SmartCluster</span>
              <span className="text-[9px] bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/25 px-1 py-0.2 rounded font-mono font-bold tracking-wider uppercase">AI</span>
            </div>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono tracking-wide font-medium uppercase block mt-0.5">
              Cloud Intelligence Platform
            </span>
          </div>
        </div>
      </div>

      {/* Menu Groups */}
      <nav className="p-4 flex-1 space-y-6">
        {menuGroups.map((group, gIdx) => (
          <div key={group.title} className="space-y-1.5">
            <h5 className="text-[10px] font-mono font-bold tracking-widest text-[#8B5CF6]/85 dark:text-[#8B5CF6]/85 uppercase px-3">
              {group.title}
            </h5>
            <div className="space-y-[2px]">
              {group.items.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isActive 
                        ? "bg-slate-100 dark:bg-[#111827] text-slate-900 dark:text-white border-l-2 border-cyber-cyan shadow-sm dark:purple-glow" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-cyber-cyan text-glow-cyan" : "text-slate-400 dark:text-slate-500"}`} />
                      <span>{item.label}</span>
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse shadow-md shadow-cyan-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Persistent User Profile Card Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-[#050816]/75 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={user?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"} 
              alt="User profile" 
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-white/10"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-cyber-green rounded-full border border-2 border-slate-100 dark:border-[#0A0F1F] shadow" />
          </div>
          <div className="min-w-0 flex-1">
            <h6 className="text-xs font-bold text-slate-905 text-slate-900 dark:text-white truncate">{user?.displayName || "SRE Platform Architect"}</h6>
            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block truncate">{user?.workspaceRole || "Global SRE Operator"}</span>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#FF3B5C]/20 bg-[#FF3B5C]/5 text-xs font-bold text-cyber-red hover:bg-[#FF3B5C]/15 transition-all text-left truncate"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Terminate session
        </button>
      </div>
    </aside>
  );
}

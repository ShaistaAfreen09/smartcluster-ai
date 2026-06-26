import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  Globe, 
  Terminal, 
  ChevronDown, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  History,
  X,
  Server,
  Layers,
  Database,
  TrendingUp,
  Sliders,
  BadgeAlert,
  LogOut
} from "lucide-react";

interface TopNavbarProps {
  onMenuToggle: () => void;
  selectedCluster: string;
  setSelectedCluster: (cluster: string) => void;
  activeSection?: string;
  setActiveSection?: (sec: string) => void;
}

interface SearchItem {
  id: string;
  title: string;
  category: "Infrastructure" | "Monitoring" | "AI Engine";
  targetSection: string;
  details: string;
  icon: "cluster" | "pod" | "deployment" | "namespace" | "cpu" | "memory" | "network" | "storage" | "forecast" | "anomaly" | "recommendation";
}

const SEARCH_DATABASE: SearchItem[] = [
  { id: "s1", title: "gke-core-prod-01", category: "Infrastructure", targetSection: "overview", details: "Primary production cluster - US Central region", icon: "cluster" },
  { id: "s2", title: "gke-edge-asia-02", category: "Infrastructure", targetSection: "overview", details: "Edge API gateway cluster - Asia Pacific region", icon: "cluster" },
  { id: "s3", title: "gke-billing-eu-03", category: "Infrastructure", targetSection: "overview", details: "Compliant financial workloads - Europe West region", icon: "cluster" },
  { id: "s4", title: "payment-service", category: "Infrastructure", targetSection: "pods", details: "Payment processing transaction API pods", icon: "pod" },
  { id: "s5", title: "api-gateway", category: "Infrastructure", targetSection: "pods", details: "Ingress proxy and routing authorization gateways", icon: "pod" },
  { id: "s6", title: "ml-prediction-worker", category: "Infrastructure", targetSection: "deployments", details: "Autoscaling deployment workers for predictions", icon: "deployment" },
  { id: "s7", title: "kube-system", category: "Infrastructure", targetSection: "namespaces", details: "Standard system-level Kubernetes nodes and controllers", icon: "namespace" },
  { id: "s8", title: "monitoring", category: "Infrastructure", targetSection: "namespaces", details: "Prometheus metrics cluster collectors and alerting stacks", icon: "namespace" },
  { id: "s9", title: "smartcluster-apps", category: "Infrastructure", targetSection: "namespaces", details: "Core user business microservices and namespaces", icon: "namespace" },
  { id: "s10", title: "CPU Core Utilization telemetry", category: "Monitoring", targetSection: "telemetry", details: "Live cpu core cycles usage and CPU saturation arrays", icon: "cpu" },
  { id: "s11", title: "Memory (RAM) consumption metrics", category: "Monitoring", targetSection: "telemetry", details: "Memory active limits, reservations and pool metrics", icon: "memory" },
  { id: "s12", title: "Network RPS socket rate", category: "Monitoring", targetSection: "telemetry", details: "Live socket transaction rates and pack traffic load", icon: "network" },
  { id: "s13", title: "Storage volume metrics (PV)", category: "Monitoring", targetSection: "telemetry", details: "Persistent Volume stats and disk read/write throughput", icon: "storage" },
  { id: "s14", title: "AI load forecasting trends", category: "AI Engine", targetSection: "predictions", details: "Imminent resource saturation and trendline graphs", icon: "forecast" },
  { id: "s15", title: "Telemetry anomaly analysis logs", category: "AI Engine", targetSection: "predictions", details: "Outlying behavior vectors and cluster leak diagnostics", icon: "anomaly" },
  { id: "s16", title: "Autonomic scaling optimization guide", category: "AI Engine", targetSection: "recommendations", details: "Recommended scaling offsets and scheduling patches", icon: "recommendation" }
];

export default function TopNavbar({ 
  onMenuToggle, 
  selectedCluster, 
  setSelectedCluster,
  activeSection,
  setActiveSection
}: TopNavbarProps) {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleTheme } = useThemeStore();
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showClusterDropdown, setShowClusterDropdown] = useState<boolean>(false);

  // Custom Profile Account Dropdown state
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Search Engine state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const [filteredResults, setFilteredResults] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationContainerRef = useRef<HTMLDivElement>(null);

  // Realistic telemetry alerts
  const [alerts, setAlerts] = useState([
    { id: 1, title: "CRITICAL: memory threshold over 82% in payment-service pods", level: "CRITICAL", time: "1 min ago", read: false },
    { id: 2, title: "INFO: Autonomic replica adjustment triggers scaling-up for worker deployment", level: "INFO", time: "10 min ago", read: false },
    { id: 3, title: "WARNING: High CPU scheduling queue congestion detected inside monitoring zone", level: "WARNING", time: "25 min ago", read: false },
    { id: 4, title: "SUCCESS: HPA node boundaries successfully deployed via recom-patch-2", level: "SUCCESS", time: "1h ago", read: true }
  ]);

  const clustersList = user?.clusterAccess || ["gke-core-prod-01", "gke-edge-asia-02", "gke-billing-eu-03"];

  // Search event listeners
  useEffect(() => {
    // Load recent searches
    const cached = localStorage.getItem("smartcluster_recent_searches");
    if (cached) {
      try {
        setRecentSearches(JSON.parse(cached));
      } catch (e) {
        setRecentSearches([]);
      }
    }

    // Handle clicks outside dropdowns
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notificationContainerRef.current && !notificationContainerRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      setSelectedIndex(-1);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matches = SEARCH_DATABASE.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q) || 
      item.details.toLowerCase().includes(q)
    );
    setFilteredResults(matches);
    setSelectedIndex(matches.length > 0 ? 0 : -1);
  }, [searchQuery]);

  const toggleSelectCluster = (clusterName: string) => {
    setSelectedCluster(clusterName);
    setShowClusterDropdown(false);
  };

  const markAllRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
  };

  const dismissAlert = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const handleSelectSearchItem = (item: SearchItem) => {
    // Add to recent
    const updatedRecent = [
      item.title,
      ...recentSearches.filter(s => s !== item.title)
    ].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem("smartcluster_recent_searches", JSON.stringify(updatedRecent));

    // Handle navigation/cluster swapping
    if (item.icon === "cluster") {
      setSelectedCluster(item.title);
    }
    if (setActiveSection) {
      setActiveSection(item.targetSection);
    }
    
    // Clear search
    setSearchQuery("");
    setShowSearchDropdown(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleRecentSearchClick = (term: string) => {
    setSearchQuery(term);
    // Find matching default item if any
    const exactMatch = SEARCH_DATABASE.find(item => item.title.toLowerCase() === term.toLowerCase());
    if (exactMatch) {
      handleSelectSearchItem(exactMatch);
    }
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("smartcluster_recent_searches");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSearchDropdown(false);
      searchInputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!showSearchDropdown) {
        setShowSearchDropdown(true);
        return;
      }
      setSelectedIndex(prev => (prev + 1 < filteredResults.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
        handleSelectSearchItem(filteredResults[selectedIndex]);
      } else if (searchQuery.trim()) {
        const bestMatch = filteredResults[0];
        if (bestMatch) {
          handleSelectSearchItem(bestMatch);
        }
      }
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-cyber-cyan/35 text-slate-900 dark:text-slate-100 font-semibold rounded-sm px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  const renderSearchItemIcon = (iconName: string) => {
    switch (iconName) {
      case "cluster": return <Globe className="w-3.5 h-3.5 text-cyber-cyan" />;
      case "pod": return <Layers className="w-3.5 h-3.5 text-cyber-green" />;
      case "deployment": return <Server className="w-3.5 h-3.5 text-cyber-purple" />;
      case "namespace": return <Database className="w-3.5 h-3.5 text-cyber-orange" />;
      case "cpu": return <Cpu className="w-3.5 h-3.5 text-cyber-red" />;
      case "memory": return <Sliders className="w-3.5 h-3.5 text-[#e11d48]" />;
      case "network": return <TrendingUp className="w-3.5 h-3.5 text-[#06b6d4]" />;
      case "storage": return <Database className="w-3.5 h-3.5 text-slate-400" />;
      default: return <Server className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/75 dark:bg-[#050816]/75 backdrop-blur-md border-b border-slate-200 dark:border-white/5 py-4 px-6 flex items-center justify-between font-sans transition-colors duration-350">
      
      {/* Left: Mobile hamburger & Active Workspace Selector */}
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition text-slate-600 dark:text-slate-300 pointer-events-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowClusterDropdown(!showClusterDropdown)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-[#0A0F1F] hover:bg-slate-50 dark:hover:bg-[#111827] border border-slate-200 dark:border-white/5 transition text-left cursor-pointer shadow-sm shadow-slate-100 dark:shadow-black/30"
          >
            <span className="w-2 h-2 rounded-full bg-cyber-green animate-ping" />
            <div className="text-left leading-none">
              <span className="text-[9px] font-mono font-bold tracking-widest text-cyber-purple uppercase block">Cluster Context</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 inline-flex items-center gap-1.5">
                {selectedCluster} <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </span>
            </div>
          </button>

          {showClusterDropdown && (
            <div className="absolute top-13 left-0 w-64 rounded-xl bg-white dark:bg-[#0A0F1F] border border-slate-200 dark:border-white/5 p-2 shadow-2xl z-50">
              <div className="text-[10px] font-mono text-slate-500 p-2 border-b border-slate-100 dark:border-white/5 uppercase tracking-wider">
                Select Active Workspace
              </div>
              <div className="space-y-1 mt-1.5">
                {clustersList.map((clusterName) => (
                  <button
                    key={clusterName}
                    onClick={() => toggleSelectCluster(clusterName)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-705 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyber-cyan font-semibold" />
                      <span>{clusterName}</span>
                    </span>
                    {selectedCluster === clusterName && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-green" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Global Search, Alarm, Theme Switcher */}
      <div className="flex items-center gap-4">
        
        {/* Global Search */}
        <div ref={searchContainerRef} className="hidden md:flex items-center relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input 
            ref={searchInputRef}
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchDropdown(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search clusters, pods, telemetry..." 
            className="w-full bg-slate-100 dark:bg-[#0A0F1F]/65 border border-slate-300/60 dark:border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 dark:text-slate-300 focus:outline-none focus:border-cyber-cyan transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-1 focus:ring-cyber-cyan/30"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 hover:text-slate-950 dark:hover:text-white text-slate-400 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Intelligent Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-11 left-0 w-96 rounded-2xl bg-white dark:bg-[#0A0F1F] border border-slate-200 dark:border-white/10 shadow-2xl p-3 z-50 text-left">
              {/* Query Results */}
              {searchQuery.trim() ? (
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pb-1.5 border-b border-slate-105 border-slate-100 dark:border-white/5 mb-1.5 flex justify-between">
                    <span>Search Matches ({filteredResults.length})</span>
                    <span className="text-[9px] lowercase text-slate-400 dark:text-slate-500 font-sans">use arrow keys to browse</span>
                  </div>
                  
                  {filteredResults.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 dark:text-slate-500 font-mono text-xs">
                      <BadgeAlert className="w-6 h-6 mx-auto mb-2 text-cyber-orange opacity-40" />
                      <span>NO_RECORDS_MATCH_&apos;{searchQuery}&apos;</span>
                    </div>
                  ) : (
                    <div className="space-y-0.5 max-h-72 overflow-y-auto">
                      {filteredResults.map((item, index) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSearchItem(item)}
                          className={`w-full p-2 rounded-xl flex items-start gap-3 text-left cursor-pointer transition-all ${
                            index === selectedIndex 
                              ? "bg-slate-50 dark:bg-white/5 border-l-2 border-cyber-cyan pl-2.5" 
                              : "hover:bg-slate-50/50 dark:hover:bg-white/2"
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 mt-0.5">
                            {renderSearchItemIcon(item.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {highlightMatch(item.title, searchQuery)}
                              </span>
                              <span className="text-[9px] font-mono font-semibold text-slate-400 px-1.5 py-0.2 rounded-full border border-slate-100 dark:border-white/5 uppercase bg-slate-50 dark:bg-white/2 shrink-0">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug truncate">
                              {highlightMatch(item.details, searchQuery)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Recent Search Log list */
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-widest pb-1.5 border-b border-slate-100 dark:border-white/5 mb-1.5">
                    <span>Recent Searches</span>
                    {recentSearches.length > 0 && (
                      <button 
                        onClick={clearRecentSearches}
                        className="text-[9px] text-cyber-purple hover:underline cursor-pointer lowercase font-sans font-semibold"
                      >
                        clear history
                      </button>
                    )}
                  </div>
                  
                  {recentSearches.length === 0 ? (
                    <div className="py-4 text-center text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                      <History className="w-4 h-4 mx-auto mb-1.5 text-slate-400/40" />
                      <span>SRE search records empty.</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {recentSearches.map((term, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleRecentSearchClick(term)}
                          className="flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-slate-650 hover:text-slate-950 dark:text-slate-450 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate flex-1">{term}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Theme Switch */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-[#0A0F1F] hover:bg-slate-100 dark:hover:bg-[#111827] border border-slate-200 dark:border-white/5 transition-all text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-white shadow-sm shadow-slate-100 dark:shadow-black/10 cursor-pointer"
          title="Toggle Global Theme"
        >
          {darkMode ? <Sun className="w-4.5 h-4.5 text-cyber-orange" /> : <Moon className="w-4.5 h-4.5 text-cyber-purple font-bold" />}
        </button>

        {/* Dynamic Alerts Bell */}
        <div className="relative" ref={notificationContainerRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-white dark:bg-[#0A0F1F] hover:bg-slate-100 dark:hover:bg-[#111827] border border-slate-200 dark:border-white/5 transition-all text-slate-500 dark:text-slate-405 hover:text-slate-850 dark:hover:text-white shadow-sm shadow-slate-100 dark:shadow-black/10 cursor-pointer relative"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-cyber-red animate-pulse border-2 border-white dark:border-[#0A0F1F] shadow" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-13 right-0 w-80 rounded-2xl bg-white dark:bg-[#0A0F1F] border border-slate-200 dark:border-white/5 p-3.5 shadow-2xl z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-150 border-slate-100 dark:border-white/5 pb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white font-mono uppercase tracking-wider">Alert Center ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-cyber-cyan hover:underline hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Clear alerts
                  </button>
                )}
              </div>

              <div className="space-y-2 mt-2 max-h-80 overflow-y-auto pr-0.5">
                {alerts.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 dark:text-slate-505 font-mono text-xs">
                    <CheckCircle2 className="w-8 h-8 text-cyber-green mx-auto mb-2 opacity-50" />
                    <span>ALL_SYMBOLS_STABLE_ONLINE</span>
                  </div>
                ) : (
                  alerts.map((al) => (
                    <div 
                      key={al.id} 
                      className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1 transition-all relative group ${
                        al.read 
                          ? "bg-slate-50/50 dark:bg-white/2 border-slate-100 dark:border-white/5 opacity-60" 
                          : "bg-white dark:bg-white/5 border-slate-200 dark:border-cyber-cyan/20"
                      }`}
                    >
                      <button
                        onClick={(e) => dismissAlert(al.id, e)}
                        className="absolute right-2 top-2 p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition duration-150"
                        title="Dismiss notification"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      <div className="flex items-center justify-between pr-3">
                        <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                          al.level === "CRITICAL" ? "bg-cyber-red/15 text-cyber-red" :
                          al.level === "WARNING" ? "bg-cyber-order/15 bg-cyber-orange/15 text-cyber-orange" : 
                          al.level === "SUCCESS" ? "bg-cyber-green/15 text-cyber-green" : "bg-cyber-purple/15 text-cyber-purple"
                        }`}>
                          {al.level}
                        </span>
                        <span className="text-[8px] text-slate-400 font-mono shrink-0 pr-1">{al.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-700 dark:text-slate-200 leading-normal font-medium mt-1">{al.title}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Global SRE Access Status */}
        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0A0F1F] border border-slate-200 dark:border-white/5 font-mono text-[10px] text-slate-500 dark:text-slate-400 shadow-sm shadow-slate-100 dark:shadow-black/10">
          <Terminal className="w-3.5 h-3.5 text-cyber-cyan animate-pulse font-bold" />
          <span>SESSION: <b className="text-slate-805 text-slate-800 dark:text-white uppercase font-extrabold">ACTIVE</b></span>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0A0F1F] hover:bg-slate-50 dark:hover:bg-white/10 transition duration-150 cursor-pointer shadow-sm shadow-slate-100 dark:shadow-black/10 select-none"
          >
            <img
              src={user?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
              alt="User profile"
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:flex flex-col text-left font-mono">
              <span className="text-[10px] font-bold text-slate-800 dark:text-white leading-none truncate max-w-[100px]">
                {user?.displayName || "Alex Mercer"}
              </span>
              <span className="text-[8px] text-cyber-cyan font-bold uppercase leading-none mt-1">
                {user?.workspaceRole || "Admin"}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-slate-200 dark:border-cyber-cyan/20 bg-white dark:bg-[#0A0F1F]/95 backdrop-blur-xl p-3 shadow-2xl z-50 text-xs font-mono space-y-3 dark:shadow-[0_0_20px_rgba(0,242,254,0.05)]">
              {/* Header profile info */}
              <div className="p-2 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                <img
                  src={user?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                  alt="Profile details"
                  className="w-10 h-10 rounded-xl border border-slate-200 dark:border-cyber-cyan/15 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="overflow-hidden">
                  <h4 className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                    {user?.displayName || "Alex Mercer"}
                  </h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                    {user?.email || "alex.mercer@smartcluster.ai"}
                  </p>
                  <span className="inline-block text-[8px] font-bold bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 px-1.5 py-0.5 rounded mt-1">
                    Role: {user?.workspaceRole || "Admin"}
                  </span>
                </div>
              </div>

              {/* Quick links list */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (setActiveSection) setActiveSection("settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition duration-150 text-left cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyber-purple" />
                  <span>SRE Settings</span>
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (setActiveSection) setActiveSection("overview");
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition duration-150 text-left cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 text-cyber-cyan" />
                  <span>Cluster Panel</span>
                </button>
              </div>

              {/* Sign out section */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-cyber-red/80 hover:bg-cyber-red/5 hover:text-cyber-red transition duration-150 text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Gate Termination</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

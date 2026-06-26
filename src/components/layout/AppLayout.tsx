import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import MobileSidebar from "./MobileSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  selectedCluster: string;
  setSelectedCluster: (cluster: string) => void;
}

export default function AppLayout({ 
  children, 
  activeSection, 
  setActiveSection,
  selectedCluster,
  setSelectedCluster
}: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen w-screen bg-deep-base text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* 1. Desktop Persistent Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
      </div>

      {/* 2. Mobile Pop-out Sidebar */}
      <MobileSidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />

      {/* 3. Main View Canvas Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopNavbar 
          onMenuToggle={() => setMobileSidebarOpen(true)} 
          selectedCluster={selectedCluster}
          setSelectedCluster={setSelectedCluster}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        
        {/* Dynamic Inner Component viewport */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#050816] dark:to-[#0A0F1F]">
          {children}
        </main>
      </div>
    </div>
  );
}

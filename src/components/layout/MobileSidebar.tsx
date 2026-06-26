import React from "react";
import Sidebar from "./Sidebar";
import { X } from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export default function MobileSidebar({ isOpen, onClose, activeSection, setActiveSection }: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Background shade overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/40 dark:bg-[#050816]/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content sliding out */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-[#0A0F1F] outline-none">
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition text-slate-600 dark:text-slate-300 pointer-events-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          onNavClick={onClose} 
        />
      </div>
    </div>
  );
}

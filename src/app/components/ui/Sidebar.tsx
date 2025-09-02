"use client";

import { X, ChevronRight } from "lucide-react";
import { ActiveTab } from "@/types";
import { useSidebar } from "@/app/context/SidebarContext";
import { useEffect, useState } from "react";
import Link from "next/link";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const navItems: { icon: string; label: string; tab: ActiveTab }[] = [
  //use lucide-react icons here
  { icon: "🏠", label: "Home", tab: "home" },
  { icon: "🔍", label: "Explore", tab: "explore" },
  { icon: "📚", label: "My Library", tab: "library" },
  { icon: "📌", label: "Saved", tab: "saved"},
];

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { userId, sidebarCollapsed, toggleSidebar } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-42";

  return (
    <>
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-gray-900 border-r border-gray-800 flex flex-col ${sidebarWidth}`}
        aria-label="Sidebar navigation"
      >
        {/* {sidebar header} */}
        <div className="py-4 px-2 flex items-center justify-end">
          <button
            onClick={toggleSidebar}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            className="py-2 px-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* {sidebar nav items} */}
        <nav
          className={`flex flex-col flex-grow py-4 px-2 ${
            sidebarCollapsed ? "items-center" : ""
          }`}
        >
          <ul className="space-y-2">
            {navItems.map(({ icon, label, tab }) => {
              const isActive = activeTab === tab;

              return (
                <li key={tab}>
                  <Link
                    href={
                      tab === "home"
                        ? "/dashboard"
                        : tab === "explore"
                        ? "/explore"
                        : tab === "library"
                        ? "/dashboard/my-collection"
                        : tab === "saved"
                        ? ""
                        : "#"
                    }
                    onClick={() => {
                      setActiveTab(tab);
                      if (isMobile) toggleSidebar();
                    }}
                    className={`group flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                      ${sidebarCollapsed ? "justify-center" : "w-full"}
                      ${
                        isActive
                          ? "bg-blue-500/20 text-blue-300"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                    aria-current={isActive ? "page" : undefined}
                    title={sidebarCollapsed ? label : undefined}
                  >
                    <span className="text-lg">{icon}</span>
                    {!sidebarCollapsed && (
                      <span className="whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out">
                        {label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 mt-auto border-t border-gray-800">
          {/* //use Link here too */}
          <Link
            href={`/profile/${userId}`}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Go to Profile"
            title={sidebarCollapsed ? "Profile" : undefined}
          >
            <span className="text-lg">👤</span>
            {!sidebarCollapsed && <span>Profile</span>}
          </Link>
        </div>
      </aside>
    </>
  );
};

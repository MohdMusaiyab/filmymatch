"use client";

import {
  X,
  ChevronRight,
  Home,
  Compass,
  BookOpen,
  Bookmark,
  User,
} from "lucide-react";
import { ActiveTab } from "@/types";
import { useSidebar } from "@/app/context/SidebarContext";
import { useEffect, useState } from "react";
import Link from "next/link";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const navItems: { label: string; tab: ActiveTab; icon: React.ReactNode }[] = [
  { label: "Home", tab: "home", icon: <Home className="w-5 h-5" /> },
  { label: "Explore", tab: "explore", icon: <Compass className="w-5 h-5" /> },
  {
    label: "My Library",
    tab: "library",
    icon: <BookOpen className="w-5 h-5" />,
  },
  { label: "Saved", tab: "saved", icon: <Bookmark className="w-5 h-5" /> },
];

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { userId, sidebarCollapsed, toggleSidebar } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-64";

  return (
    <>
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-white/70 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-white shadow-lg flex flex-col 
          ${sidebarCollapsed ? "items-center" : ""}
          ${sidebarWidth}`}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className="py-4 px-2 flex items-center justify-end">
          <button
            onClick={toggleSidebar}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            className="p-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col flex-grow mb-8">
          <ul className="space-y-1 px-6">
            {navItems.map(({ label, tab, icon }) => {
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
                        ? "/dashboard/saved"
                        : "#"
                    }
                    onClick={() => {
                      setActiveTab(tab);
                      if (isMobile) toggleSidebar();
                    }}
                    className={`flex items-center gap-3 py-3 rounded-lg text-md font-medium transition-colors
                      ${
                        sidebarCollapsed
                          ? "justify-center px-3"
                          : "justify-start px-4"
                      }
                      ${
                        isActive
                          ? "bg-blue-300/20 text-accent-blue"
                          : "text-gray-900 hover:bg-blue-200/20"
                      }
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                    aria-current={isActive ? "page" : undefined}
                    title={sidebarCollapsed ? label : undefined}
                  >
                    {icon}
                    {!sidebarCollapsed && <span>{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 mt-auto">
          <Link
            href={`/profile/${userId}`}
            className={`flex items-center gap-3 py-3 rounded-lg text-md font-medium transition-colors
      ${sidebarCollapsed ? "justify-center px-3" : "justify-start px-4"}
      text-gray-900 hover:bg-blue-200/20
      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            aria-label="Go to Profile"
            title={sidebarCollapsed ? "Profile" : undefined}
          >
            <User className="w-5 h-5" />
            {!sidebarCollapsed && <span>Profile</span>}
          </Link>
        </div>
      </aside>
    </>
  );
};

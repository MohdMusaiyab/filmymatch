"use client";

import { X, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ActiveTab } from "@/types";
import { useSidebar } from "@/app/context/SidebarContext";
import { useEffect, useState } from "react";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const navItems: { icon: string; label: string; tab: ActiveTab }[] = [
  { icon: "🏠", label: "Home", tab: "home" },
  { icon: "🔍", label: "Explore", tab: "explore" },
  { icon: "📚", label: "My Library", tab: "library" },
];

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { userId, sidebarCollapsed, toggleSidebar } = useSidebar();
  const router = useRouter();
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
                  <button
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab === "home") router.push("/dashboard");
                      if (tab === "explore") router.push("/explore");
                      if (tab === "library") router.push(`/dashboard/my-collection`);
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
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 mt-auto border-t border-gray-800">
          <button
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Go to Profile"
            title={sidebarCollapsed ? "Profile" : undefined}
            onClick={()=>router.push(`/profile/${userId}`)}
          >
            <span className="text-lg">👤</span>
            {!sidebarCollapsed && <span>Profile</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

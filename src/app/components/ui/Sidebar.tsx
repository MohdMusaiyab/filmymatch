'use client';
import { X, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation'; 
import { ActiveTab } from '@/types';

interface SidebarProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const navItems: { icon: string; label: string; tab: ActiveTab }[] = [
  { icon: '🏠', label: 'Home', tab: 'home' },
  { icon: '🔍', label: 'Explore', tab: 'explore' },
  { icon: '📚', label: 'My Library', tab: 'library' },
];

export const Sidebar = ({
  sidebarCollapsed,
  toggleSidebar,
  activeTab,
  setActiveTab,
}: SidebarProps) => {
  const router = useRouter();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-60 transition-all duration-300 border-r border-gray-800 bg-gray-900 text-white ${sidebarCollapsed ? 'w-16' : 'w-64'
        } flex flex-col`}
      aria-label="Sidebar navigation"
    >
      {/* Header */}
      <div className={`p-4 flex items-center border-b border-gray-800 ${sidebarCollapsed ? 'justify-center' : 'justify-between'
        }`}>
        {!sidebarCollapsed ? (
          <>
            <h2 className="text-xl font-bold tracking-tight">Snippit</h2>
            <button
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="p-2 rounded-lg hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            className="p-2 rounded-lg hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-2">
          {navItems.map(({ icon, label, tab }) => {
            const isActive = activeTab === tab;
            return (
              <li key={tab}>
                <button
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === 'home') router.push('/dashboard'); 
                  }}
                  className={`group flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                  aria-current={isActive ? 'page' : undefined}
                  title={sidebarCollapsed ? label : undefined}
                >
                  <span className="text-lg">{icon}</span>
                  {!sidebarCollapsed && <span>{label}</span>}
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
          title={sidebarCollapsed ? 'Profile' : undefined}
        >
          <span className="text-lg">👤</span>
          {!sidebarCollapsed && <span>Profile</span>}
        </button>
      </div>
    </aside>
  );
};

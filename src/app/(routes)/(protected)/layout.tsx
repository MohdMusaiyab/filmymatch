"use client";

import React, { useState } from "react";
import { ActiveTab } from "@/types";
import { Header } from "@/app/components/general/Header";
import { SidebarProvider, useSidebar } from "@/app/context/SidebarContext";
import { Sidebar } from "@/app/components/ui/Sidebar";

const InnerLayout = ({ children }: { children: React.ReactNode }) => {
  // const { sidebarCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const { sidebarCollapsed } = useSidebar();
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-row flex-grow overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div
          className={`flex-grow overflow-auto hide-scrollbar transition-all duration-300`}
        >
          <div className={`${sidebarCollapsed ? "ml-24" : ""} min-h-screen mx-auto px-4 md:px-6 mt-6 transition-all duration-300 ease-in-out`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// split layout -> LayoutWrapper and InnerLayout ( a hook (useSidebar) can't be called at
// the same level where the provider (SidebarProvider) is defined.

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <InnerLayout>{children}</InnerLayout>
  </SidebarProvider>
);

export default LayoutWrapper;

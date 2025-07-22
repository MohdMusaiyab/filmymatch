"use client";

import React , {useState} from "react";
import { ActiveTab } from "@/types";
import Footer from "@/app/components/general/Footer";
import { Header } from "@/app/components/general/Header";
import { SidebarProvider, useSidebar } from "@/app/context/SidebarContext";
import {Sidebar} from "@/app/components/ui/Sidebar";

const InnerLayout = ({ children }: { children: React.ReactNode }) => {
  const { sidebarCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-row flex-grow overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div
          className={`flex-grow overflow-auto hide-scrollbar transition-all duration-300 ${
            sidebarCollapsed ? "pl-16" : "pl-40"
          }`}
        >
          {children}
        </div>
      </div>
      <Footer />
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

"use client";

import React from "react";
import Footer from "@/app/components/general/Footer";
import { Header } from "@/app/components/general/Header";
import { SidebarProvider } from "@/app/context/SidebarContext";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex-grow overflow-auto hide-scrollbar">
          {children}
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default layout;

import { Header } from "@/app/components/general/Header";

import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex-grow overflow-auto">{children}</div>
    </div>
  );
};

export default layout;

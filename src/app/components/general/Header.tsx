"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";

import Logo from "@/assets/logo-colored.png";
import Button from "@/app/components/Button";
import { useSidebar } from "@/app/context/SidebarContext";

export const Header = () => {
  const { sidebarCollapsed } = useSidebar();

  return (
    <header
      className={`sticky top-0 py-4 sm:pr-4 md:pr-8 pr-12 flex justify-between items-center transition-all duration-300 bg-white border-b border-gray-200 ${
        sidebarCollapsed ? "pl-24" : "pl-64"
      }`}
    >
      <div>
        <Image
          src={Logo}
          alt="Company Logo"
          width={90}
          height={90}
          className="ml-6 hidden md:block"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Link href="/dashboard/create-post" className="hidden md:block">
          <Button type="button" variant="custom-blue" size="md">
            + Create Snippet
          </Button>
        </Link>

        <Link href="/dashboard/create-post" className="block md:hidden">
          <Button
            type="button"
            variant="custom-blue"
            size="sm"
            className="rounded-full w-10 h-10 md:w-8 md:h-8 flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
};

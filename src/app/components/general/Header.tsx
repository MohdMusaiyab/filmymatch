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
      className={`sticky top-0 py-4 sm:pr-4 md:pr-8 pr-12 flex justify-between items-center transition-all duration-300 bg-black ${
        sidebarCollapsed ? "pl-24" : "pl-54"
      }`}
    >
      <div>
        <Image
          src={Logo}
          alt="Company Logo"
          width={90}
          height={90}
          className="m-auto hidden md:block"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-800 rounded-full px-4 py-2.5 sm:px-5 w-36 sm:w-48 md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
        />

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

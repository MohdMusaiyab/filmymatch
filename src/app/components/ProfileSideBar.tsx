"use client";

import { useSession } from "next-auth/react";
import React from "react";
import { Settings, Bookmark, User2, LogOut } from "lucide-react";
import Link from "next/link";

interface ProfileSideBarProps {
  userId: string;
}

const ProfileSideBar: React.FC<ProfileSideBarProps> = ({ userId }) => {
  const { data: session, status } = useSession();

  const isOwner = session?.user?.id === userId;

  if (!isOwner) return null;

  return (
    <aside className="w-full md:w-64 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg text-white space-y-6">
      <div className="text-xl font-semibold text-center">My Panel</div>

      <ul className="space-y-3">
        <li>
          <Link
            href="/dashboard/profile/edit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-zinc-800 transition"
          >
            <Settings size={18} />
            Edit Profile
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/profile/collection"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-zinc-800 transition"
          >
            <Bookmark size={18} />
            My Collections
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/account"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-zinc-800 transition"
          >
            <User2 size={18} />
            Account Settings
          </Link>
        </li>
        <li>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-zinc-800 transition">
            <LogOut size={18} />
            Logout
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default ProfileSideBar;

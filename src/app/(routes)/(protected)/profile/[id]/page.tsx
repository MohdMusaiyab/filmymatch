"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getUserProfile } from "@/actions/user/getUserProfile";
import FollowButton from "@/app/components/FollowButton";
import ProfileSideBar from "@/app/components/ProfileSideBar";
import { Snippet } from "@/app/components/ui/Snippet";
import { toast } from "sonner";
import { Edit, Settings } from "lucide-react";

const UserProfilePage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id || typeof id !== "string") return;

      const res = await getUserProfile({ userId: id });
      if (res.success) {
        setProfileData(res.data);
      } else {
        toast.error(res.error?.message || "Failed to load profile");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-20 text-zinc-300">Loading profile...</div>
    );

  if (!profileData)
    return (
      <div className="text-center py-20 text-red-500">Profile not found.</div>
    );

  const { profile, posts, highlights, permissions } = profileData;

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-6">
      {/* Left Sidebar */}
      <div className="md:w-64">
        <ProfileSideBar userId={profile.id} />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Profile Header */}
        <div className="flex gap-16 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg text-white space-y-4">
          {/* avatar */}
          <div className="flex intems-center justify-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-zinc-700">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-2xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* username+edit+setting+stats+bio */}
          <div className="flex flex-col gap-3">
            {/* header */}
            <div className="flex items-center justify-start gap-4">
              <h2 className="text-xl font-semibold">{profile.username}</h2>
              <Link
                href={`/profile/edit`}
                className="flex items-center justify-center gap-1 bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded-md text-sm"
              >
                <Edit size={16} /> Edit Profile
              </Link>

              {/* another menu opens */}
              <Link href={"profile/setting"}>
                <Settings size={18} />
              </Link>
            </div>

            {/* stats */}
            <div className="flex items-center justify-start gap-4">
              <div className="flex flex-col items-center justify-center text-white">
                <p className="text-md font-medium">
                  {profile.stats.totalPosts}
                </p>
                <p className="text-sm font-light">Total Posts</p>
              </div>
              <div className="flex flex-col items-center justify-center text-white">
                <p className="text-md font-medium">
                  {profile.stats.collections}
                </p>
                <p className="text-sm font-light">Collections</p>
              </div>
              <div className="flex flex-col items-center justify-center text-white">
                <p className="text-md font-medium">{profile.stats.followers}</p>
                <p className="text-sm font-light">Followers</p>
              </div>
              <div className="flex flex-col items-center justify-center text-white">
                <p className="text-md font-medium">{profile.stats.following}</p>
                <p className="text-sm font-light">Following</p>
              </div>
            </div>

            {/* bio */}
            <div>
              <p className="text-sm text-zinc-400">
                {profile.bio || "No bio yet."}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg text-white space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-zinc-700">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-2xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold">{profile.username}</h2>
              <p className="text-sm text-zinc-400">
                {profile.bio || "No bio yet."}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Joined {new Date(profile.joinDate).toLocaleDateString()}
              </p>
            </div>

            <FollowButton userId={profile.id} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-sm text-zinc-300">
            <div>
              <p className="font-medium text-white">
                {profile.stats.totalPosts}
              </p>
              <p>Total Posts</p>
            </div>
            <div>
              <p className="font-medium text-white">
                {profile.stats.followers}
              </p>
              <p>Followers</p>
            </div>
            <div>
              <p className="font-medium text-white">
                {profile.stats.following}
              </p>
              <p>Following</p>
            </div>
            <div>
              <p className="font-medium text-white">
                {profile.stats.collections}
              </p>
              <p>Collections</p>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Posts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.items.length > 0 ? (
              posts.items.map((post: any) => (
                <Snippet
                  key={post.id}
                  post={{
                    ...post,
                    images: [], // optional unless needed
                    user: {
                      id: profile.id,
                      username: profile.username,
                      avatar: profile.avatar,
                    },
                    linkTo: `/dashboard/my-posts/${post.id}`,
                  }}
                  menuOpen={null}
                  toggleMenu={() => {}}
                  showActions={false}
                />
              ))
            ) : (
              <p className="text-zinc-500 col-span-full">No posts available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

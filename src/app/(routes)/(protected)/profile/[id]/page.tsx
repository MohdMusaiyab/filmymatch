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
  const [isPanel, setIsPanel] = useState(false);

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

  const handleToggleSetting = () => setIsPanel((prev) => !prev);

  if (loading) {
    return (
      <div className="text-center py-20 text-zinc-300">Loading profile...</div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-20 text-red-500">Profile not found.</div>
    );
  }

  const { profile, posts, highlights, permissions } = profileData;

  return (
  <>
    {/* overlay */}
    {isPanel && (
      <div
        className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center"
        onClick={() => setIsPanel(false)}
      >
        <div
          className="relative z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <ProfileSideBar userId={profile.id} onClose={() => setIsPanel(false)} />
        </div>
      </div>
    )}

    {/* Main Content */}
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-6">
      <div className="flex-1 space-y-8">
        
        {/* Profile Header */}
        <div className="flex gap-16 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg text-white">
          
          {/* Avatar */}
          <div className="flex items-center justify-center">
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

          {/* Username, Stats, Buttons */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-normal">{profile.username}</h2>
              <FollowButton userId={profile.id} />
              <Link
                href="/profile/edit"
                className="flex items-center gap-1 text-white bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 px-2 py-1 rounded-md text-sm"
              >
                <Edit size={16} />
                Edit Profile
              </Link>
              <button onClick={handleToggleSetting}>
                <Settings size={18} />
              </button>
            </div>

            <div className="flex gap-4">
              {[
                { label: "posts", count: profile.stats.totalPosts },
                { label: "collections", count: profile.stats.collections },
                { label: "followers", count: profile.stats.followers },
                { label: "following", count: profile.stats.following },
              ].map(({ label, count }) => (
                <div key={label} className="flex items-center gap-1">
                  <p className="text-md font-medium">{count}</p>
                  <p className="text-sm font-light text-zinc-300">{label}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-zinc-200">
              {profile.bio || "No bio yet."}
            </p>
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
                    images: [],
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
              <p className="text-zinc-500 col-span-full">
                No posts available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  </>
);

};

export default UserProfilePage;

"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getUserProfile } from "@/actions/user/getUserProfile";
import FollowButton from "@/app/components/FollowButton";
import ProfileSideBar from "@/app/components/ProfileSideBar";
import { Snippet } from "@/app/components/ui/Snippet";
import { getUserCollections } from "@/actions/collection";
// import { getUserSavedPosts } from "@/actions/post";
import { toast } from "sonner";
import { Edit, Settings, Library, Bookmark, Grid3X3 } from "lucide-react";

const UserProfilePage = () => {
  const { data: session } = useSession();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [isPanel, setIsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "collections" | "saved">(
    "posts"
  );
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id || typeof id !== "string") return;
      console.log(id);

      const res = await getUserProfile({ userId: id });

      if (res.success) {
        setProfileData(res.data);

        const collectionsRes = await getUserCollections(id);
        if (collectionsRes.success) {
          setCollections(collectionsRes.data ?? []);
        }
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

  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     if (!id || typeof id !== "string") return;

  //     const res = await getUserProfile({ userId: id });

  //     if (res.success) {
  //       setProfileData(res.data);

  //       // Fetch collections
  //       const collectionsRes = await getUserCollections(id);
  //       if (collectionsRes.success) {
  //         setCollections(collectionsRes.data ?? []);
  //       }

  //       // // Fetch saved posts
  //       // const savedRes = await getUserSavedPosts(id);
  //       // if (savedRes.success) {
  //       //   setSavedPosts(savedRes.data);
  //       // }
  //     } else {
  //       toast.error(res.error?.message || "Failed to load profile");
  //     }

  //     setLoading(false);
  //   };

  //   fetchProfile();
  // }, [id]);

  const { profile, posts, highlights, permissions } = profileData;

  return (
    <>
      {/* overlay panel*/}
      {isPanel && (
        <div
          className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center"
          onClick={() => setIsPanel(false)}
        >
          <div className="relative z-50" onClick={(e) => e.stopPropagation()}>
            <ProfileSideBar
              userId={profile.id}
              onClose={() => setIsPanel(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col md:flex-row mx-auto">
        <div className="flex-1 space-y-10">
          {/* Profile Header */}
          <div className="flex gap-18 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-lg text-white">
            {/* Avatar */}
            <div className="flex items-center justify-center">
              <div className="w-26 h-26 rounded-full overflow-hidden border border-zinc-700">
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
                {id === session?.user?.id && (
                  <>
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
                  </>
                )}
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

          {/* Posts/Collections/Saved grid*/}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex items-center gap-2 pb-2 text-sm uppercase tracking-wide ${
                  activeTab === "posts"
                    ? "border-b-2 border-zinc-300 text-white"
                    : "text-zinc-400"
                }`}
              >
                <Grid3X3 size={18} />
                Posts
              </button>
              <button
                onClick={() => setActiveTab("collections")}
                className={`flex items-center gap-2 pb-2 text-sm uppercase tracking-wide ${
                  activeTab === "collections"
                    ? "border-b-2 border-zinc-300 text-white"
                    : "text-zinc-400"
                }`}
              >
                <Library size={18} />
                Collections
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex items-center gap-2 pb-2 text-sm uppercase tracking-wide ${
                  activeTab === "saved"
                    ? "border-b-2 border-zinc-300 text-white"
                    : "text-zinc-400"
                }`}
              >
                <Bookmark size={18} />
                Saved
              </button>
            </div>

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {activeTab === "posts" &&
                  (posts.items.length > 0 ? (
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
                    <p className="text-zinc-500 col-span-full text-center">
                      No posts available.
                    </p>
                  ))}

                {activeTab === "collections" &&
                  (collections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {collections.map((collection) => (
                        <Link
                          key={collection.id}
                          href={`/explore/collection/${collection.id}`}
                          className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow hover:shadow-lg transition duration-200"
                        >
                          {collection.coverImage && (
                            <img
                              src={collection.coverImage}
                              alt={collection.name}
                              className="w-full h-40 object-cover rounded-lg mb-4"
                            />
                          )}
                          <h3 className="text-white text-lg font-semibold mb-1">
                            {collection.name}
                          </h3>
                          <p className="text-zinc-400 text-sm line-clamp-2 mb-2">
                            {collection.description}
                          </p>
                          <div className="text-zinc-500 text-xs">
                            {collection.posts.length}{" "}
                            {collection.posts.length === 1 ? "post" : "posts"} •{" "}
                            {new Date(
                              collection.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 col-span-full text-center mt-10">
                      No collections to show.
                    </p>
                  ))}

                {/* {activeTab === "saved" &&
                      (savedPosts.length > 0 ? (
                        savedPosts.map((post: any) => (
                          <Snippet
                            key={post.id}
                            post={{
                              ...post,
                              user: {
                                id: post.user.id,
                                username: post.user.username,
                                avatar: post.user.avatar,
                              },
                              linkTo: `/dashboard/my-posts/${post.id}`,
                            }}
                            menuOpen={null}
                            toggleMenu={() => {}}
                            showActions={false}
                          />
                        ))
                      ) : (
                        <p className="text-zinc-500 col-span-full text-center">
                          No saved posts.
                        </p>
                      ))} */}
                {activeTab === "saved" && (
                  <p className="text-zinc-500 col-span-full text-center">
                    Saved posts coming soon...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;

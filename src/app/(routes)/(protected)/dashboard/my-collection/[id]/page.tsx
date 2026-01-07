"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  deleteCollection,
  getMyCollectionById,
  removePostFromCollection,
  updateCollection,
} from "@/actions/collection";
import {
  Loader2,
  Trash2,
  Upload,
  X,
  Check,
  Edit,
  Users,
  Lock,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Plus,
  Globe,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

import { useDropzone } from "react-dropzone";

import api from "@/lib/api";
import Image from "next/image";
import { Snippet } from "@/app/components/ui/Snippet";
import Button from "@/app/components/Button";
import Dropdown from "@/app/components/inputFields/Dropdown";
const DEFAULT_COVER_IMAGE =
  "https://thumbs.dreamstime.com/b/book-open-cover-reveals-tree-growing-its-pages-bathed-radiant-light-ideal-fantasy-nature-themed-book-354676529.jpg";
interface Post {
  id: string;
  title: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE" | "FOLLOWERS";
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

interface CollectionData {
  id: string;
  name: string;
  description: string | null;
  isDraft: boolean;
  coverImage: string | null;
  visibility: "PUBLIC" | "PRIVATE" | "FOLLOWERS";
  userId: string;
  posts: Post[];
  updatedAt: Date;
  createdAt: Date;
}

export default function CollectionDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const collectionId = params.id;
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [editData, setEditData] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingPostId, setRemovingPostId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (!acceptedFiles.length || !isEditing || !editData) return;
      await handleImageUpload(acceptedFiles[0]);
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const response = await api.post("/upload/presigned-url", {
        fileName: file.name,
        fileType: file.type,
      });

      const presignedData = response.data.data;

      const uploadResponse = await fetch(presignedData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) throw new Error("Upload failed");

      setEditData((prev) =>
        prev
          ? {
              ...prev,
              coverImage: presignedData.fileUrl,
            }
          : null
      );

      toast.success("Cover image uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload image", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!collectionId) {
        throw new Error("Missing collection ID");
      }

      const response = await getMyCollectionById(collectionId);

      if (!response.success) {
        throw new Error(response.error?.message || "Failed to load collection");
      }

      if (!response.data) {
        throw new Error("Collection data not found");
      }

      setCollection(response.data);
      setEditData(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  const handleRemovePost = async (postId: string) => {
    if (!collectionId || !postId || !collection) return;

    try {
      setRemovingPostId(postId);

      const result = await removePostFromCollection(collectionId, postId);

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to remove post");
      }

      setCollection((prev) =>
        prev
          ? {
              ...prev,
              posts: prev.posts.filter((post) => post.id !== postId),
            }
          : null
      );

      setEditData((prev) =>
        prev
          ? {
              ...prev,
              posts: prev.posts.filter((post) => post.id !== postId),
            }
          : null
      );

      toast.success("Post removed from collection");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove post"
      );
    } finally {
      setRemovingPostId(null);
    }
  };

  const handleSave = async () => {
    if (!collectionId || !editData) return;

    try {
      setIsSaving(true);

      const visibility = editData.isDraft ? "PRIVATE" : editData.visibility;

      const updatePayload = {
        ...editData,
        visibility,
      };

      const result = await updateCollection({
        collectionId,
        ...updatePayload,
      });

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to update collection");
      }

      await fetchCollection();
      setIsEditing(false);
      toast.success("Collection updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save changes"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (collection) {
      setEditData(collection);
    }
    setIsEditing(false);
  };

  const handleFieldChange = <T extends keyof CollectionData>(
    field: T,
    value: CollectionData[T]
  ) => {
    if (!editData) return;

    if (field === "isDraft" && value === true) {
      setEditData({
        ...editData,
        isDraft: true,
        visibility: "PRIVATE",
      });
    } else {
      setEditData({
        ...editData,
        [field]: value,
      });
    }
  };

  useEffect(() => {
    fetchCollection();
  }, [collectionId, fetchCollection]);
  const handleDeleteCollection = async () => {
    if (!collectionId || !collection) return;

    const confirm = window.confirm(
      `Are you sure you want to delete "${collection.name}"? ` +
        `This action cannot be undone. All ${collection.posts.length} posts will be removed from this collection.`
    );

    if (!confirm) return;

    try {
      const result = await deleteCollection(collectionId);

      if (result.success) {
        toast.success("Collection deleted successfully");
        router.push("/dashboard/my-collection");
      } else {
        toast.error(result.error?.message || "Failed to delete collection");
      }
    } catch (error) {
      console.error("Delete collection error:", error);
      toast.error("Failed to delete collection");
    }
  };
  if (loading && !collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#5865F2]/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading collection...
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Fetching your curated content
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Collection Not Found
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push("/dashboard/my-collection")}
                variant="theme-primary"
                className="flex-1"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Collections
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection || !editData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Collection Not Available
            </h3>
            <p className="text-gray-600 mb-6">
              This collection may have been deleted or you don&apos;t have
              access to it.
            </p>
            <Button
              onClick={() => router.push("/dashboard/my-collection")}
              variant="theme-primary"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Collections
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to format post for Snippet component
  const formatPostForSnippet = (post: Post) => {
    return {
      id: post.id,
      title: post.title || "Untitled Post",
      description: post.description || "",
      category: "UNKNOWN",
      visibility: post.visibility,
      coverImage: post.coverImage || undefined,
      user: {
        id: post.user.id,
        username: post.user.username || "Unknown",
        avatar: post.user.avatar || undefined,
      },
      images: [],
      _count: {
        likes: 0,
        comments: 0,
      },
      createdAt: post.createdAt.toISOString(),
      tags: [],
      isDraft: false,
      isSaved: true,
      linkTo: `/explore/post/${post.id}`,
      // Ensure all required properties are included
      updatedAt: post.updatedAt.toISOString(),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.push("/dashboard/my-collection")}
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            className="mb-4"
          >
            Back to Collections
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Collection Details
              </h1>
              <p className="text-gray-600">
                Manage and organize your curated snippets
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    icon={<X className="w-4 h-4" />}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="theme-primary"
                    disabled={isSaving}
                    icon={
                      isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )
                    }
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="theme-primary"
                    icon={<Edit className="w-4 h-4" />}
                  >
                    Edit Collection
                  </Button>
                  <Button
                    onClick={handleDeleteCollection}
                    variant="danger"
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    Delete Collection
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {collection.posts.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-[#5865F2]/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#5865F2]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Visibility</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {collection.visibility.toLowerCase()}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                {collection.visibility === "PUBLIC" ? (
                  <Globe className="w-5 h-5 text-gray-600" />
                ) : collection.visibility === "FOLLOWERS" ? (
                  <Users className="w-5 h-5 text-gray-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {collection.isDraft ? "Draft" : "Published"}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date(collection.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Collection Details Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="relative">
            {isEditing ? (
              <div
                {...getRootProps()}
                className={`relative h-64 bg-gray-50 cursor-pointer transition-all ${
                  isDragActive ? "ring-2 ring-[#5865F2]" : ""
                }`}
              >
                <input {...getInputProps()} />
                {editData.coverImage ? (
                  <Image
                    src={editData.coverImage}
                    alt={editData.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-white text-sm">
                      {isDragActive
                        ? "Drop to upload"
                        : "Click or drag to upload cover"}
                    </p>
                    {isUploading && (
                      <p className="mt-2 text-sm text-white flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Uploading...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-64 bg-gray-50">
                collection.coverImage ?
                <Image
                  src={collection.coverImage || DEFAULT_COVER_IMAGE}
                  alt={collection.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* Collection Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Name & Description */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Collection Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        handleFieldChange("name", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
                      placeholder="Enter collection name"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">
                      {collection.name}
                    </h2>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.description || ""}
                      onChange={(e) =>
                        handleFieldChange("description", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Describe your collection..."
                    />
                  ) : (
                    <p className="text-gray-600">
                      {collection.description || "No description provided"}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Settings */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Visibility Settings
                  </label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                        <input
                          type="checkbox"
                          id="draft"
                          checked={editData.isDraft}
                          onChange={(e) =>
                            handleFieldChange("isDraft", e.target.checked)
                          }
                          className="rounded text-[#5865F2] focus:ring-[#5865F2] h-5 w-5"
                        />
                        <label htmlFor="draft" className="ml-3 text-gray-900">
                          Save as Draft
                        </label>
                      </div>

                      <Dropdown
                        label="Visibility"
                        options={[
                          {
                            value: "PRIVATE",
                            label: "Private - Only you can see",
                          },
                          {
                            value: "FOLLOWERS",
                            label: "Followers - Visible to followers",
                          },
                          {
                            value: "PUBLIC",
                            label: "Public - Everyone can see",
                          },
                        ]}
                        value={editData.visibility}
                        onChange={(e) =>
                          handleFieldChange(
                            "visibility",
                            e.target.value as "PUBLIC" | "PRIVATE" | "FOLLOWERS"
                          )
                        }
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-lg ${
                          collection.visibility === "PUBLIC"
                            ? "bg-green-100 text-green-800"
                            : collection.visibility === "FOLLOWERS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {collection.visibility === "PUBLIC" ? (
                          <>
                            <Globe className="w-4 h-4 mr-2" />
                            Public
                          </>
                        ) : collection.visibility === "FOLLOWERS" ? (
                          <>
                            <Users className="w-4 h-4 mr-2" />
                            Followers Only
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Private
                          </>
                        )}
                      </div>
                      {collection.isDraft && (
                        <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Draft
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Collection Posts
                </h2>
                <p className="text-gray-600">
                  {collection.posts.length}{" "}
                  {collection.posts.length === 1 ? "snippet" : "snippets"} in
                  this collection
                </p>
              </div>
              {isEditing && collection.posts.length > 0 && (
                <div className="text-sm text-gray-500">
                  Click the remove icon on any post to delete it from this
                  collection
                </div>
              )}
            </div>
          </div>

          {/* Posts Grid */}
          {collection.posts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add snippets to this collection to organize your favorite
                content.
              </p>
              <Button
                onClick={() => router.push("/explore")}
                variant="theme-primary"
                icon={<Plus className="w-5 h-5" />}
              >
                Explore Snippets
              </Button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collection.posts.map((post) => (
                  <div key={post.id} className="relative group">
                    {/* Remove Button (only in edit mode) */}
                    {isEditing && (
                      <button
                        onClick={() => handleRemovePost(post.id)}
                        disabled={removingPostId === post.id}
                        className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
                        aria-label={`Remove ${post.title} from collection`}
                      >
                        {removingPostId === post.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {/* Snippet Component with properly formatted post */}
                    <Snippet
                      post={formatPostForSnippet(post)}
                      menuOpen={menuOpen}
                      toggleMenu={toggleMenu}
                      showActions={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  Showing {collection.posts.length} posts in this collection
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {collection.isDraft
                    ? "Draft collection"
                    : "Published collection"}
                </p>
              </div>
              <Button
                onClick={() => router.push("/explore")}
                variant="outline"
                icon={<Plus className="w-4 h-4" />}
              >
                Add More Snippets
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

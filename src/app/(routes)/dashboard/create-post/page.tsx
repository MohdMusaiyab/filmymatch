"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UploadSnippet, { UploadedFile } from "@/app/components/FileUploader";
import { CategoryEnum, VisibilityEnum, TagsEnum } from "@/schemas/common";
import TextInput from "@/app/components/inputFields/TextInput";
import { Sidebar } from '@/app/components/ui/Sidebar';
import { ActiveTab } from '@/types';

import { z } from "zod";
import Button from "@/app/components/Button";
import Dropdown from "@/app/components/inputFields/Dropdown";

interface PostFormData {
  title: string;
  description: string;
  category: z.infer<typeof CategoryEnum>;
  tags: z.infer<typeof TagsEnum>[];
  coverImage: string;
}

const CreatePostPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    description: "",
    category: CategoryEnum.enum.OTHER,
    tags: [],
    coverImage: "",
  });

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const toggleMenu = (postId: string) => {
    setMenuOpen(menuOpen === postId ? null : postId);
  };


  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagChange = (tag: z.infer<typeof TagsEnum>) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const setCoverImage = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId);
    if (file && file.finalUrl) {
      setFormData((prev) => ({
        ...prev,
        coverImage: file.finalUrl!,
      }));
      toast.success("Cover image set successfully");
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (uploadedFiles.length === 0) {
      toast.error("At least one image or video is required");
      return false;
    }
    if (!uploadedFiles.every((f) => f.uploaded)) {
      toast.error("Please upload all files first");
      return false;
    }
    return true;
  };

  const submitPost = async (
    visibility: z.infer<typeof VisibilityEnum>,
    isDraft: boolean = false
  ) => {
    if (!validateForm()) return;
    if (!session?.user?.id) {
      toast.error("Please sign in to create a post");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
          visibility,
          isDraft,
          coverImage: formData.coverImage,
          files: uploadedFiles.map((f) => ({
            s3Key: f.s3Key,
            description: f.description,
            fileName: f.file.name,
            fileType: f.file.type,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      const { post } = await response.json();

      toast.success(
        isDraft ? "Post saved as draft!" : "Post created successfully!"
      );
      router.push(`/dashboard/my-posts/${post.id}`);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create post"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-white mb-2">Create New Post</h1>
            <p className="text-gray-400">Share your content with the world</p>
          </div>
          {/* Sidebar */}
          <Sidebar
                  sidebarCollapsed={sidebarCollapsed}
                  toggleSidebar={toggleSidebar}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />

          <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800">
            <div className="p-8 space-y-8">
              {/* Basic Information Section */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <TextInput
                      label="Title *"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter post title"
                      validate={(value) =>
                        !value.trim() ? "Title is required" : null
                      }
                    />

                    <Dropdown
                      label="Category *"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      options={CategoryEnum.options.map((cat) => ({
                        value: cat,
                        label: cat.charAt(0) + cat.slice(1).toLowerCase(),
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Tags
                    </label>
                    <div className="bg-gray-800 rounded-xl p-4 max-h-64 overflow-y-auto border border-gray-700">
                      <div className="space-y-3">
                        {TagsEnum.options.map((tag) => (
                          <label 
                            key={tag} 
                            className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-md cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.tags.includes(tag)}
                              onChange={() => handleTagChange(tag)}
                              className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-300 select-none">
                              {tag.charAt(0) + tag.slice(1).toLowerCase()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <TextInput
                    label="Description *"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your post..."
                    validate={(value) =>
                      !value.trim() ? "Description is required" : null
                    }
                    textarea
                    rows={4}
                  />
                </div>
              </div>

              {/* Media Upload Section */}
              <div className="border-t border-gray-800 pt-8">
                <h2 className="text-xl font-semibold text-white mb-6">Media Files</h2>
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <UploadSnippet
                    onFilesChange={setUploadedFiles}
                    maxFiles={10}
                    maxFileSize={10}
                  />
                </div>
              </div>

              {/* Cover Image Selection */}
              {uploadedFiles.length > 0 && (
                <div className="border-t border-gray-800 pt-8">
                  <h2 className="text-xl font-semibold text-white mb-6">Select Cover Image</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {uploadedFiles
                      .filter((f) => f.file.type.startsWith("image/"))
                      .map((file) => (
                        <div
                          key={file.id}
                          className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 ${
                            formData.coverImage === file.finalUrl
                              ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900"
                              : "hover:ring-2 hover:ring-gray-600"
                          }`}
                          onClick={() => setCoverImage(file.id)}
                        >
                          <img
                            src={file.preview}
                            alt="Cover option"
                            className="w-full h-20 object-cover"
                          />
                          {formData.coverImage === file.finalUrl && (
                            <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                              <div className="bg-blue-500 text-white rounded-full p-1.5 shadow-lg">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-gray-800 pt-8">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button
                      onClick={() => submitPost(VisibilityEnum.enum.PRIVATE, true)}
                      disabled={isSubmitting}
                      variant="black-white"
                      size="md"
                      className="w-full"
                    >
                      {isSubmitting ? "Saving..." : "💾 Save as Draft"}
                    </Button>

                    <Button
                      onClick={() => submitPost(VisibilityEnum.enum.PRIVATE, false)}
                      disabled={isSubmitting}
                      variant="custom-blue"
                      size="md"
                      className="w-full"
                    >
                      {isSubmitting ? "Saving..." : "🔒 Save Private"}
                    </Button>

                    <Button
                      onClick={() => submitPost(VisibilityEnum.enum.FOLLOWERS, false)}
                      disabled={isSubmitting}
                      variant="gradient-blue"
                      size="md"
                      className="w-full"
                    >
                      {isSubmitting ? "Saving..." : "👥 Followers Only"}
                    </Button>

                    <Button
                      onClick={() => submitPost(VisibilityEnum.enum.PUBLIC, false)}
                      disabled={isSubmitting}
                      variant="black-gradient"
                      size="md"
                      className="w-full"
                    >
                      {isSubmitting ? "Publishing..." : "🌍 Publish Public"}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-400">
                      💡 Make sure to upload all media files before saving your post
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
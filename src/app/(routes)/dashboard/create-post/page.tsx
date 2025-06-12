"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UploadSnippet, { UploadedFile } from "@/app/components/FileUploader";
import { CategoryEnum, VisibilityEnum, TagsEnum } from "@/schemas/common";
import TextInput from "@/app/components/inputFields/TextInput";
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
    //No Need , Can be Removed as only title, description, and category  are required
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-black shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Create New Post</h1>
            <p className="text-blue-100 mt-1">
              Share your content with the world
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
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
                    className="text-gray-700"
                  />
                </div>

                <div>
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
                    className="text-gray-700" // For label color
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {TagsEnum.options.map((tag) => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag)}
                        onChange={() => handleTagChange(tag)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {tag.charAt(0) + tag.slice(1).toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
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
                className="text-gray-700"
              />
            </div>

            {/* File Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Media Files
              </h3>
              <UploadSnippet
                onFilesChange={setUploadedFiles}
                maxFiles={10}
                maxFileSize={10}
              />
            </div>

            {/* Cover Image Selection */}
            {uploadedFiles.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Select Cover Image
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {uploadedFiles
                    .filter((f) => f.file.type.startsWith("image/"))
                    .map((file) => (
                      <div
                        key={file.id}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          formData.coverImage === file.finalUrl
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setCoverImage(file.id)}
                      >
                        <img
                          src={file.preview}
                          alt="Cover option"
                          className="w-full h-24 object-cover"
                        />
                        {formData.coverImage === file.finalUrl && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                            <div className="bg-blue-500 text-white rounded-full p-1">
                              <svg
                                className="w-4 h-4"
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
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => submitPost(VisibilityEnum.enum.PRIVATE, true)}
                  disabled={isSubmitting}
                  variant="gradient-blue"
                  size="md"
                  className="flex-1"
                >
                  {isSubmitting ? "Saving..." : "Save as Draft"}
                </Button>

                <Button
                  onClick={() => submitPost(VisibilityEnum.enum.PRIVATE, false)}
                  disabled={isSubmitting}
                  variant="yellow"
                  size="md"
                  className="flex-1"
                >
                  {isSubmitting ? "Saving..." : "Save as Draft"}
                </Button>

                <Button
                  onClick={() =>
                    submitPost(VisibilityEnum.enum.FOLLOWERS, false)
                  }
                  disabled={isSubmitting}
                  variant="gradient-blue"
                  size="md"
                  className="flex-1"
                >
                  {isSubmitting ? "Saving..." : "Save for Followers"}
                </Button>

                <Button
                  onClick={() => submitPost(VisibilityEnum.enum.PUBLIC, false)}
                  disabled={isSubmitting}
                  variant="gradient-blue" // Using gradient-blue since green isn't in your variants
                  size="md"
                  className="flex-1"
                >
                  {isSubmitting ? "Publishing..." : "Publish Public"}
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-3 text-center">
                Make sure to upload all media files before saving your post
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;

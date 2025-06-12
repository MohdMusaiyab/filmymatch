"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import UploadSnippet, { UploadedFile } from "@/app/components/FileUploader";
import { CategoryEnum, VisibilityEnum, TagsEnum } from "@/schemas/common";
import TextInput from "@/app/components/inputFields/TextInput";
import Button from "@/app/components/Button";
import Dropdown from "@/app/components/inputFields/Dropdown";

interface PostFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  coverImage: string;
  visibility: string;
  isDraft: boolean;
}

interface ExistingImage {
  url: string;
  id: string;
  description?: string;
  originalUrl?: string; // Add this to store original URL for comparison
}

interface CombinedImage {
  id: string;
  preview: string;
  finalUrl: string;
  originalUrl?: string; // Add this for proper comparison
  description?: string;
  isExisting: boolean;
}

const UpdatePostPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    description: "",
    category: CategoryEnum.enum.OTHER,
    tags: [],
    coverImage: "",
    visibility: VisibilityEnum.enum.PRIVATE,
    isDraft: false,
  });

  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch post data
  useEffect(() => {
    if (!id || status !== "authenticated") return;

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/posts/my-posts/${id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch post");
        }

        const post = await response.json();

        setFormData({
          title: post.title || "",
          description: post.description || "",
          category: post.category || CategoryEnum.enum.OTHER,
          tags: Array.isArray(post.tags) ? post.tags : [],
          coverImage: post.coverImage || "",
          visibility: post.visibility || VisibilityEnum.enum.PRIVATE,
          isDraft: Boolean(post.isDraft),
        });

        setExistingImages(
          Array.isArray(post.images)
            ? post.images.map((img: any) => ({
                url: img.url || "",
                id: img.id || Math.random().toString(),
                description: img.description || "",
                originalUrl: img.originalUrl || img.url || "", // Store original URL
              }))
            : []
        );
      } catch (error) {
        console.error("Fetch error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load post";
        setError(errorMessage);
        toast.error(errorMessage);
        router.push("/dashboard/my-posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, status, router]);

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

  const handleTagChange = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const setCoverImage = (url: string, originalUrl?: string) => {
    // Store the original URL for comparison, but display the signed URL
    setFormData((prev) => ({
      ...prev,
      coverImage: originalUrl || url,
    }));
    toast.success("Cover image set successfully");
  };

  const handleUpdate = async (isDraft: boolean) => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        ...formData,
        isDraft,
        existingImages,
        newFiles: uploadedFiles,
      };

      console.log("Updating post with:", updateData);

      // Replace this with actual API call
      const response = await fetch(`/api/posts/my-posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update post");
      }

      toast.success("Post updated successfully!");
      router.push(`/dashboard/my-posts/${id}`);
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update post";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));

    // If the deleted image was the cover image, clear the cover image
    const imageToDelete = existingImages.find((img) => img.id === imageId);
    if (
      imageToDelete &&
      (formData.coverImage === imageToDelete.url ||
        formData.coverImage === imageToDelete.id)
    ) {
      setFormData((prev) => ({ ...prev, coverImage: "" }));
    }

    toast.success("Image removed");
  };

  const handleImageClick = (finalUrl: string, originalUrl?: string) => {
    if (finalUrl) {
      setCoverImage(finalUrl, originalUrl);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/dashboard/my-posts")}>
            Go Back to My Posts
          </Button>
        </div>
      </div>
    );
  }

  // Create combined images array with unique keys
  const allImages: CombinedImage[] = [
    ...existingImages.map((img) => ({
      id: `existing-${img.id}`, // Prefix to ensure uniqueness
      preview: img.url,
      finalUrl: img.url,
      originalUrl: img.originalUrl || img.url,
      description: img.description,
      isExisting: true,
    })),
    ...uploadedFiles.map((file) => ({
      id: `uploaded-${file.id}`, // Prefix to ensure uniqueness
      preview: file.preview,
      finalUrl: file.finalUrl || file.preview,
      originalUrl: file.finalUrl || file.preview,
      description: file.description,
      isExisting: false,
    })),
  ];

  // Helper function to check if an image is the cover image
  const isCoverImage = (img: CombinedImage): boolean => {
    return (
      formData.coverImage === img.originalUrl ||
      formData.coverImage === img.finalUrl ||
      formData.coverImage === img.id.replace("existing-", "")
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Update Post</h1>
            <p className="text-blue-100 mt-1">Edit your post content</p>
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
                    className="text-gray-700"
                  />
                </div>

                <div>
                  <Dropdown
                    label="Visibility"
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    options={VisibilityEnum.options.map((vis) => ({
                      value: vis,
                      label: vis.charAt(0) + vis.slice(1).toLowerCase(),
                    }))}
                    className="text-gray-700"
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

            {/* Image Gallery */}
            {allImages.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {formData.coverImage
                    ? "Cover Image & Gallery"
                    : "Select Cover Image"}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {allImages.map((file) => (
                    <div
                      key={file.id}
                      className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        isCoverImage(file)
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        handleImageClick(file.finalUrl, file.originalUrl)
                      }
                    >
                      <img
                        src={file.originalUrl || file.preview}
                        alt="Media preview"
                        className="w-full h-24 object-cover"
                        onError={(e) => {
                          console.error("Image failed to load:", file.preview);
                          e.currentTarget.src = "/placeholder-image.jpg"; // Fallback image
                        }}
                      />

                      {/* Cover image indicator */}
                      {/* {isCoverImage(file) && (
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
                      )} */}

                      {/* Delete button for existing images */}
                      {file.isExisting && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(file.id.replace("existing-", ""));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Delete image"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}

                      {/* Image type indicator */}
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                        {file.isExisting ? "Existing" : "New"}
                      </div>
                    </div>
                  ))}
                </div>

                {formData.coverImage && (
                  <p className="text-sm text-gray-600 mt-2">
                    Click on any image to set it as cover image
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleUpdate(true)}
                  disabled={isSubmitting}
                  variant="gradient-blue"
                  size="md"
                  className="flex-1"
                >
                  {isSubmitting ? "Saving..." : "Save as Draft"}
                </Button>

                <Button
                  onClick={() => handleUpdate(false)}
                  disabled={isSubmitting}
                  variant="yellow"
                  size="md"
                  className="flex-1"
                >
                  {isSubmitting ? "Updating..." : "Update Post"}
                </Button>

                <Button
                  onClick={() => {
                    console.log("Post preview requested");
                    toast.info("Post preview would show here");
                  }}
                  variant="black-white"
                  size="md"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Preview Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePostPage;

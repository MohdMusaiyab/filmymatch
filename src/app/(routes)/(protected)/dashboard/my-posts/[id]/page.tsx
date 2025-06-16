"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  originalUrl?: string;
}

interface CombinedImage {
  id: string;
  preview: string;
  finalUrl: string;
  originalUrl?: string;
  description?: string;
  isExisting: boolean;
}

const UpdatePostPage = () => {
  const params = useParams();
  const id = params?.id as string;
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
  const [showComments, setShowComments] = useState(false);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  // Cleanup blob URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [uploadedFiles]);

  // Fetch post data
  useEffect(() => {
    if (!id) return;

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

        const processedImages = Array.isArray(post.images)
          ? post.images.map((img: any) => ({
              url: img.url || "",
              id: img.id || `img-${Date.now()}-${Math.random()}`,
              description: img.description || "",
              originalUrl: img.originalUrl || img.url || "",
            }))
          : [];

        setExistingImages(processedImages);
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
  }, [id, router]);

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

  const setCoverImage = useCallback((url: string, originalUrl?: string) => {
    const imageUrl = originalUrl || url;
    setFormData((prev) => ({
      ...prev,
      coverImage: imageUrl,
    }));
    toast.success("Cover image set successfully");
  }, []);

  const updateVisibility = (newVisibility: string) => {
    setFormData((prev) => ({
      ...prev,
      visibility: newVisibility,
      isDraft: newVisibility === "DRAFT",
    }));
    toast.success(`Visibility set to ${newVisibility.toLowerCase()}`);
  };

  const handleFilesChange = useCallback((files: UploadedFile[]) => {
    // Clean up previous blob URLs
    uploadedFiles.forEach(file => {
      if (file.preview && file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    setUploadedFiles(files);
  }, [uploadedFiles]);

  const handleFinalUpdate = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    // Check if at least one image exists
    const hasImages = 
      (existingImages.length > 0 && removedImageIds.length < existingImages.length) ||
      uploadedFiles.length > 0;

    if (!hasImages) {
      toast.error("At least one image is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        ...formData,
        files: uploadedFiles,
        removedImageIds: removedImageIds,
      };

      const response = await fetch(`/api/posts/my-posts/${id}/update`, {
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

      // Clean up blob URLs after successful update
      uploadedFiles.forEach(file => {
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });

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
    const imageToDelete = existingImages.find((img) => img.id === imageId);
    
    if (imageToDelete) {
      // Add to removed images list
      setRemovedImageIds(prev => [...prev, imageId]);
      
      // Remove from existing images display
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));

      // Clear cover image if it was the deleted image
      if (
        formData.coverImage === imageToDelete.url ||
        formData.coverImage === imageToDelete.originalUrl ||
        formData.coverImage === imageToDelete.id
      ) {
        setFormData((prev) => ({ ...prev, coverImage: "" }));
      }

      toast.success("Image marked for removal");
    }
  };

  const handleImageClick = (finalUrl: string, originalUrl?: string) => {
    if (finalUrl) {
      setCoverImage(finalUrl, originalUrl);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Image failed to load:", e.currentTarget.src);
    e.currentTarget.src = "https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
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

  // Combine existing and uploaded images
  const allImages: CombinedImage[] = [
    ...existingImages
      .filter(img => !removedImageIds.includes(img.id))
      .map((img) => ({
        id: `existing-${img.id}`,
        preview: img.url,
        finalUrl: img.url,
        originalUrl: img.originalUrl || img.url,
        description: img.description,
        isExisting: true,
      })),
    ...uploadedFiles.map((file) => ({
      id: `uploaded-${file.id}`,
      preview: file.preview,
      finalUrl: file.finalUrl || file.preview,
      originalUrl: file.finalUrl || file.preview,
      description: file.description,
      isExisting: false,
    })),
  ];

  const isCoverImage = (img: CombinedImage): boolean => {
    return (
      formData.coverImage === img.originalUrl ||
      formData.coverImage === img.finalUrl ||
      formData.coverImage === img.preview ||
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

            {/* Visibility Controls */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Post Visibility
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => updateVisibility("DRAFT")}
                  variant={formData.isDraft ? "gradient-blue" : "outline"}
                  size="sm"
                >
                  Draft
                </Button>
                <Button
                  onClick={() => updateVisibility("PRIVATE")}
                  variant={
                    formData.visibility === "PRIVATE" && !formData.isDraft
                      ? "gradient-blue"
                      : "outline"
                  }
                  size="sm"
                >
                  Private
                </Button>
                <Button
                  onClick={() => updateVisibility("FOLLOWERS_ONLY")}
                  variant={
                    formData.visibility === "FOLLOWERS_ONLY" &&
                    !formData.isDraft
                      ? "gradient-blue"
                      : "outline"
                  }
                  size="sm"
                >
                  Followers Only
                </Button>
                <Button
                  onClick={() => updateVisibility("PUBLIC")}
                  variant={
                    formData.visibility === "PUBLIC" && !formData.isDraft
                      ? "gradient-blue"
                      : "outline"
                  }
                  size="sm"
                >
                  Public
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Current:{" "}
                {formData.isDraft ? "Draft" : formData.visibility.toLowerCase()}
              </p>
            </div>

            {/* File Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Media Files
              </h3>
              <UploadSnippet
                onFilesChange={handleFilesChange}
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
                        onError={handleImageError}
                        loading="lazy"
                      />

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

                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                        {file.isExisting ? "Existing" : "New"}
                      </div>

                      {isCoverImage(file) && (
                        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!formData.coverImage && allImages.length > 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ Please select a cover image by clicking on any image
                  </p>
                )}

                {formData.coverImage && (
                  <p className="text-sm text-gray-600 mt-2">
                    Click on any image to set it as cover image
                  </p>
                )}
              </div>
            )}

            {/* Final Update Button */}
            <div className="border-t pt-6">
              <Button
                onClick={handleFinalUpdate}
                disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
                variant="gradient-blue"
                size="lg"
                className="w-full"
              >
                {isSubmitting ? "Updating..." : "Final Update"}
              </Button>
            </div>

            {/* Comments Section */}
            <div className="border-t pt-6">
              <Button
                onClick={() => setShowComments(!showComments)}
                variant="outline"
                size="sm"
                className="mb-4"
              >
                {showComments ? "Hide Comments" : "Show Comments"}
              </Button>

              {showComments && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 italic">
                      Comments will appear here after the post is published.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePostPage;
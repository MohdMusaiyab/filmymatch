"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import {
  CategoryEnum,
  TagsEnum,
  type Category,
  type Tags,
  type Visibility,
} from "@/schemas/common";
import PostComment from "@/app/components/Comment";
import LikeButton from "@/app/components/LikeButton";
import { toast } from "sonner";
import Image from "next/image";

type FileWithPreview = {
  file: File;
  preview: string;
  description: string;
  uploadProgress: number;
  isUploaded: boolean;
  s3Key?: string;
  s3Url?: string;
};

type PostData = {
  id: string;
  title: string;
  description: string;
  category: Category;
  tags: Tags[];
  visibility: Visibility;
  isDraft: boolean;
  images: {
    url: string;
    description: string;
  }[];
  coverImageUrl?: string;
};

const MAX_SIZE_MB = 10;
const MAX_FILES = 10;

const EditPostPage = () => {
  const params = useParams();
  const postId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState<PostData | null>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as Category,
    tags: [] as Tags[],
    visibility: "PRIVATE" as Visibility,
  });

  // Fetch existing post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/my-posts/${postId}`);
        setPost(data.data);
        setFormData({
          title: data.data.title,
          description: data.data.description,
          category: data.data.category,
          tags: data.data.tags,
          visibility: data.data.visibility,
        });

        const existingFiles = data.data.images.map(
          (img: { url: string; description: string }) => ({
            file: new File([], img.url.split("/").pop() || ""),
            preview: img.url,
            description: img.description,
            uploadProgress: 100,
            isUploaded: true,
            s3Url: img.url,
          })
        );

        setFiles(existingFiles);
        if (data.data.coverImageUrl) {
          const coverIndex: number = existingFiles.findIndex(
            (file: FileWithPreview) => file.s3Url === data.data.coverImageUrl
          );
          if (coverIndex !== -1) {
            setCoverImageIndex(coverIndex);
          }
        }
        toast.success("Post fetched successfully");
      } catch (error) {
        console.error("Failed to fetch post:", error);
        toast.error("Failed to fetch post");
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (files.length + acceptedFiles.length > MAX_FILES) {
        toast.info(`Maximum ${MAX_FILES} files allowed`);
        return;
      }

      const validFiles = acceptedFiles.filter((file) => {
        const isWithinSizeLimit = file.size <= MAX_SIZE_MB * 1024 * 1024;
        if (!isWithinSizeLimit) {
          toast.info(
            `File ${file.name} exceeds the maximum size of ${MAX_SIZE_MB} MB`
          );
          return false;
        }
        return isWithinSizeLimit;
      });

      const newFiles = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        description: "",
        uploadProgress: 0,
        isUploaded: false,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".avi", ".mov"],
    },
    multiple: true,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removedFile = newFiles.splice(index, 1)[0];
      URL.revokeObjectURL(removedFile.preview);

      if (coverImageIndex === index) {
        setCoverImageIndex(null);
      } else if (coverImageIndex !== null && index < coverImageIndex) {
        setCoverImageIndex(coverImageIndex - 1);
      }

      return newFiles;
    });
  };

  const updateDescription = (index: number, description: string) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index].description = description;
      return newFiles;
    });
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: Category) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleTagsChange = (tag: Tags) => {
    setFormData((prev) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  };

  const handleCoverImageSelect = (index: number) => {
    const selectedFile = files[index];
    
    // Check if the file is uploaded
    if (!selectedFile.isUploaded) {
      toast.error("Cover image not available for selection - file not uploaded yet");
      return;
    }
    
    setCoverImageIndex(index);
    toast.success("Cover image selected");
  };

  const uploadFiles = async (): Promise<{ success: boolean; uploadedFiles: FileWithPreview[] }> => {
    setIsUploading(true);
    const results: FileWithPreview[] = [];
    let allSuccess = true;

    try {
      // Process all files, but only upload the unuploaded ones
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.isUploaded) {
          results.push(file);
          continue;
        }

        try {
          const response = await api.post('/upload/presigned-url', {
            fileName: file.file.name,
            fileType: file.file.type
          });
          const presignedData = response.data.data;

          const uploadedFile = await new Promise<FileWithPreview>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', presignedData.uploadUrl, true);
            xhr.setRequestHeader('Content-Type', file.file.type);
            
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 100);
                setFiles(prev => prev.map((f, index) => 
                  index === i ? { ...f, uploadProgress: progress } : f
                ));
              }
            };
            
            xhr.onload = () => {
              if (xhr.status === 200) {
                const updatedFile = {
                  ...file,
                  isUploaded: true,
                  s3Key: presignedData.key,
                  s3Url: presignedData.fileUrl,
                  uploadProgress: 100
                };
                resolve(updatedFile);
              } else {
                reject(new Error('Upload failed'));
              }
            };
            
            xhr.onerror = () => reject(new Error('Upload failed'));
            xhr.send(file.file);
          });

          results.push(uploadedFile);
          
          // Update the files state immediately after successful upload
          setFiles(prev => prev.map((f, index) => 
            index === i ? uploadedFile : f
          ));
          
        } catch (error) {
          console.error(`Upload failed for ${file.file.name}:`, error);
          results.push({ ...file, isUploaded: false });
          allSuccess = false;
        }
      }

      // Wait a bit to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));

      return { 
        success: allSuccess, 
        uploadedFiles: results.filter(f => f.isUploaded) 
      };
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (visibility: Visibility, isDraft: boolean) => {
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload ALL files first (including new ones)
      const { success } = await uploadFiles();
      if (!success) {
        toast.error("Some files failed to upload");
        setIsSubmitting(false);
        return; // Don't proceed if uploads failed
      }

      // 2. Ensure we're working with the updated files after upload
      const currentFiles = [...files]; // Get the current state after uploads

      // 3. Build final images array - only use files that have been uploaded
      const finalImages = currentFiles
        .filter(file => file.isUploaded && file.s3Url) // Only uploaded files
        .map((file) => ({
          url: file.s3Url!.split("?")[0], // Clean S3 URL
          description: file.description,
        }));

      // 4. Determine cover image using clean S3 URL
      let coverImageUrl: string | null = null;
      if (coverImageIndex !== null && currentFiles[coverImageIndex]) {
        const selectedFile = currentFiles[coverImageIndex];
        
        // Only set cover if the file is uploaded and has S3 URL
        if (selectedFile.isUploaded && selectedFile.s3Url) {
          coverImageUrl = selectedFile.s3Url.split("?")[0];
        } else {
          console.warn("Selected cover image is not uploaded yet");
          toast.error("Selected cover image is not uploaded yet");
          setIsSubmitting(false);
          return;
        }
      }

      // 5. Validate that all images are uploaded
      const hasUnuploadedFiles = currentFiles.some(file => !file.isUploaded);
      if (hasUnuploadedFiles) {
        toast.error("Please wait for all files to upload before saving");
        setIsSubmitting(false);
        return;
      }

      // 6. Construct payload
      const payload = {
        ...formData,
        visibility,
        isDraft,
        images: finalImages,
        coverImageUrl,
      };

      console.log("=== CLIENT DEBUG ===");
      console.log("Current files state:", currentFiles.map(f => ({
        name: f.file.name,
        isUploaded: f.isUploaded,
        s3Url: f.s3Url,
        preview: f.preview
      })));
      console.log("Final images being sent:", finalImages);
      console.log("Cover image URL:", coverImageUrl);
      console.log("=== END CLIENT DEBUG ===");

      // 7. Send PUT request to update
      const response = await api.put(`/posts/my-posts/${postId}/update`, payload);
      toast.success("Post updated successfully");
      console.log("Update response:", response.data);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if any operations are in progress
  const isProcessing = isUploading || isSubmitting;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div>
            <label className="block mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              className="w-full p-2 border rounded"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={4}
              className="w-full p-2 border rounded"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CategoryEnum.options.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  disabled={isProcessing}
                  className={`px-3 py-1 rounded ${
                    formData.category === category
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <LikeButton postId={postId}  />
          </div>

          <div>
            <label className="block mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TagsEnum.options.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagsChange(tag)}
                  disabled={isProcessing}
                  className={`px-3 py-1 rounded ${
                    formData.tags.includes(tag)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
          >
            <input {...getInputProps()} disabled={isProcessing} />
            <p>
              {isDragActive
                ? "Drop files here"
                : "Drag & drop files here, or click to select"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Max {MAX_SIZE_MB}MB per file · Max {MAX_FILES} files total
            </p>
          </div>

          <div className="space-y-4">
            {files.map((file, index) => (
              <div key={index} className="border rounded-lg p-3 relative">
                {file.file.type.startsWith("image/") || !file.file.type ? (
                  <Image
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-32 object-cover rounded"
                    width={400}
                    height={128}
                    unoptimized
                  />
                ) : (
                  <video
                    src={file.preview}
                    controls
                    className="w-full h-32 object-cover rounded"
                  />
                )}

                <textarea
                  value={file.description}
                  onChange={(e) => updateDescription(index, e.target.value)}
                  placeholder="Image description..."
                  className="w-full mt-2 p-2 border rounded text-sm"
                  rows={2}
                  disabled={isProcessing}
                />

                <div className="mt-2 flex justify-between items-center">
                  <button
                    onClick={() => removeFile(index)}
                    disabled={isProcessing}
                    className={`text-red-500 hover:text-red-700 text-sm ${
                      isProcessing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Remove
                  </button>

                  {(file.file.type.startsWith("image/") || !file.file.type) && (
                    <button
                      onClick={() => handleCoverImageSelect(index)}
                      disabled={isProcessing}
                      className={`px-2 py-1 text-sm rounded ${
                        coverImageIndex === index
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {coverImageIndex === index ? "Cover" : "Set as Cover"}
                    </button>
                  )}
                </div>

                {!file.isUploaded && file.uploadProgress > 0 && (
                  <div className="mt-2 h-1 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${file.uploadProgress}%` }}
                    ></div>
                  </div>
                )}

                {file.isUploaded && (
                  <div className="mt-1 text-xs text-green-500">Uploaded</div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                handleSubmit(
                  post?.visibility || "PRIVATE",
                  post?.isDraft || false
                )
              }
              disabled={isProcessing}
              className={`py-2 rounded text-white ${
                isProcessing 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => handleSubmit("PRIVATE", true)}
              disabled={isProcessing}
              className={`py-2 rounded text-white ${
                isProcessing 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save as Draft"}
            </button>
            <button
              onClick={() => handleSubmit("PUBLIC", false)}
              disabled={isProcessing}
              className={`py-2 rounded text-white ${
                isProcessing 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isSubmitting ? "Publishing..." : "Publish Public"}
            </button>
            <button
              onClick={() => handleSubmit("FOLLOWERS", false)}
              disabled={isProcessing}
              className={`py-2 rounded text-white ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-500 hover:bg-purple-600"
              }`}
            >
              {isSubmitting ? "Publishing..." : "Publish (Followers)"}
            </button>
            <button
              onClick={() => handleSubmit("PRIVATE", false)}
              disabled={isProcessing}
              className={`col-span-2 py-2 rounded text-white ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Private"}
            </button>
          </div>

          {isUploading && (
            <div className="text-center text-sm text-blue-500">
              Uploading files...
            </div>
          )}
        </div>
      </div>
      <PostComment postId={postId} /> 
    </div>
  );
};

export default EditPostPage;
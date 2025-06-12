// components/UploadSnippet.tsx
'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { toast } from 'sonner';

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  description: string;
  uploadUrl?: string;
  s3Key?: string;
  finalUrl?: string;
  uploading: boolean;
  uploaded: boolean;
}

interface UploadSnippetProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

const UploadSnippet: React.FC<UploadSnippetProps> = ({
  onFilesChange,
  maxFiles = 10,
  maxFileSize = 10
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'
  ];

  const validateFile = (file: File): boolean => {
    if (!allowedTypes.includes(file.type)) {
      toast.error(`File type ${file.type} is not supported`);
      return false;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxFileSize}MB`);
      return false;
    }

    return true;
  };

  const createFilePreview = (file: File): string => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    } else if (file.type.startsWith('video/')) {
      return URL.createObjectURL(file);
    }
    return '';
  };

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    if (files.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = fileArray.filter(validateFile);
    
    const uploadedFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: createFilePreview(file),
      description: '',
      uploading: false,
      uploaded: false
    }));

    const updatedFiles = [...files, ...uploadedFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const updateFileDescription = (id: string, description: string) => {
    const updatedFiles = files.map(f => 
      f.id === id ? { ...f, description } : f
    );
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const uploadToS3 = async () => {
    if (files.length === 0) {
      toast.error('No files to upload');
      return;
    }

    try {
      // Update all files to uploading state
      const uploadingFiles = files.map(f => ({ ...f, uploading: true }));
      setFiles(uploadingFiles);
      onFilesChange(uploadingFiles);

      for (const file of files) {
        if (file.uploaded) continue;

        try {
          // Get presigned URL
          const response = await fetch('/api/upload/presigned-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.file.name,
              fileType: file.file.type
            })
          });

          if (!response.ok) {
            throw new Error('Failed to get upload URL');
          }

          const { uploadUrl, key, fileUrl } = await response.json();

          // Upload to S3
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file.file,
            headers: {
              'Content-Type': file.file.type
            }
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload file');
          }

          // Update file status
          const updatedFiles = files.map(f => 
            f.id === file.id 
              ? { ...f, uploading: false, uploaded: true, s3Key: key, finalUrl: fileUrl }
              : f
          );
          setFiles(updatedFiles);
          onFilesChange(updatedFiles);

        } catch (error) {
          console.error('Upload error:', error);
          const updatedFiles = files.map(f => 
            f.id === file.id ? { ...f, uploading: false } : f
          );
          setFiles(updatedFiles);
          onFilesChange(updatedFiles);
          toast.error(`Failed to upload ${file.file.name}`);
        }
      }

      toast.success('All files uploaded successfully!');
    } catch (error) {
      console.error('Batch upload error:', error);
      toast.error('Failed to upload files');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Images and videos up to {maxFileSize}MB each (max {maxFiles} files)
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              Selected Files ({files.length}/{maxFiles})
            </h3>
            <button
              onClick={uploadToS3}
              disabled={files.some(f => f.uploading) || files.every(f => f.uploaded)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {files.some(f => f.uploading) ? 'Uploading...' : 'Upload to Temp'}
            </button>
          </div>

          <div className="grid gap-4">
            {files.map((file) => (
              <div key={file.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    {file.file.type.startsWith('image/') ? (
                      <img
                        src={file.preview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    ) : file.file.type.startsWith('video/') ? (
                      <video
                        src={file.preview}
                        className="w-20 h-20 object-cover rounded-md"
                        muted
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                        {getFileIcon(file.file.type)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getFileIcon(file.file.type)}
                      <span className="font-medium truncate">{file.file.name}</span>
                      <span className="text-sm text-gray-500">
                        ({(file.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      {file.uploading && (
                        <span className="text-blue-600 text-sm">Uploading...</span>
                      )}
                      {file.uploaded && (
                        <span className="text-green-600 text-sm">✓ Uploaded</span>
                      )}
                    </div>

                    {/* Description Input */}
                    <textarea
                      placeholder="Add description (optional)"
                      value={file.description}
                      onChange={(e) => updateFileDescription(file.id, e.target.value)}
                      className="w-full p-2 border rounded-md text-sm resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 transition-colors"
                    disabled={file.uploading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSnippet;
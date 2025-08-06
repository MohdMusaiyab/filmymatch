"use client"
import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getBasicUserDetails,
  updateUserAvatar,
  updateBasicUserInfo,
} from "@/actions/user/editProfile";
import api from '@/lib/api'

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  phone: string | null;
  avatar: string | null;
  isDeactivated: boolean;
}

interface UserForm {
  username: string;
  email: string;
  bio: string;
  phone: string;
  deactivateAccount: boolean;
}

const fallbackAvatar = "/default-avatar.png"; // You can replace with your default

const EditProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>({
    username: "",
    email: "",
    bio: "",
    phone: "",
    deactivateAccount: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getBasicUserDetails();
        if (!res.success || !res.data) {
          throw new Error(res.error?.message || "Could not fetch user data");
        }

        const data = res.data;
        setUser({
          ...data,
          isDeactivated: data.isActive ?? false, // Map isActive to isDeactivated
        });
        setForm({
          username: data.username,
          email: data.email,
          bio: data.bio ?? "",
          phone: data.phone ?? "",
          deactivateAccount: data.isActive ?? false,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleAvatarUpload = async () => {
    if (!avatarFile) return toast.error("No image selected");

    try {
      const response = await api.post("/upload/presigned-url", {
        fileName: avatarFile.name,
        fileType: avatarFile.type,
      });

      const data = response.data.data;
      if (!data?.uploadUrl || !data?.fileUrl) {
        throw new Error(data?.error || "Failed to get upload URL");
      }

      await fetch(data.uploadUrl, {
        method: "PUT",
        body: avatarFile,
      });

      const updateRes = await updateUserAvatar(data.fileUrl);
      if (!updateRes.success || !updateRes.data?.avatar) {
        throw new Error(updateRes.error?.message || "Failed to update avatar");
      }

      toast.success("Avatar updated");
      setUser((prev) => prev && { ...prev, avatar: updateRes.data.avatar });
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update avatar");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateBasicUserInfo(form);
      if (!res.success) {
        throw new Error(res.error?.message || "Profile update failed");
      }
      toast.success("Profile updated successfully");
      router.push(`/profile/${user?.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Edit Profile</h1>

      {/* Avatar Dropzone */}
      <div
        {...getRootProps()}
        className="border border-dashed border-gray-500 p-4 rounded-lg text-center cursor-pointer mb-4"
      >
        <input {...getInputProps()} />
        {avatarPreview || user?.avatar ? (
          <Image
            src={avatarPreview || user?.avatar || fallbackAvatar}
            alt="Avatar Preview"
            width={120}
            height={120}
            className="rounded-full mx-auto object-cover"
          />
        ) : (
          <p className="text-gray-400">
            {isDragActive
              ? "Drop the image here..."
              : "Drag and drop an avatar or click to select"}
          </p>
        )}
      </div>

      {avatarFile && (
        <button
          onClick={handleAvatarUpload}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition mb-6"
        >
          Update Avatar
        </button>
      )}

      {/* Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="text-gray-300 block mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full bg-gray-900 text-white border border-gray-700 rounded p-2"
            required
          />
        </div>

        <div>
          <label className="text-gray-300 block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-gray-900 text-white border border-gray-700 rounded p-2"
            required
          />
        </div>

        <div>
          <label className="text-gray-300 block mb-1">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            className="w-full bg-gray-900 text-white border border-gray-700 rounded p-2"
          />
        </div>

        <div>
          <label className="text-gray-300 block mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full bg-gray-900 text-white border border-gray-700 rounded p-2"
          />
        </div>

        {/* <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="deactivateAccount"
            checked={form.deactivateAccount}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <label className="text-gray-400">Deactivate account</label>
        </div> */}

        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;


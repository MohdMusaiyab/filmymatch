"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CategoryEnum, TagsEnum, type Category, type Tags } from '@/schemas/common';
import api from '@/lib/api';

const CreatePostPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as Category,
    tags: [] as Tags[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    category: '',
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { title: '', description: '', category: '' };

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      valid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      valid = false;
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      const { data } = await api.post('/posts', {
        ...formData,
        isDraft: true,
        visibility: 'PRIVATE'
      });

      if (data.success) {
        toast.success('Post created as draft!');
        router.push(`/dashboard/my-posts/${data.data.postId}`);
      } else {
        toast.error(data.message || 'Failed to create post');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      toast.error(errorMessage);
      console.error('Post creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = CategoryEnum.options;
  const tagOptions = TagsEnum.options;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Create New Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className={`w-full px-3 py-2 border rounded-3xl bg-[#E1E9F2] focus:outline-none focus:ring-1 focus:ring-[#94BBFF] text-black ${
              errors.title ? 'border-red-500' : 'border-[#94BBFF]'
            }`}
            placeholder="Enter post title"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            className={`w-full px-3 py-2 border rounded-xl bg-[#E1E9F2] focus:outline-none focus:ring-1 focus:ring-[#94BBFF] text-black ${
              errors.description ? 'border-red-500' : 'border-[#94BBFF]'
            }`}
            placeholder="Enter post description"
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-white mb-1">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
            className={`w-full px-3 py-2 border rounded-3xl bg-[#E1E9F2] focus:outline-none focus:ring-1 focus:ring-[#94BBFF] text-black ${
              errors.category ? 'border-red-500' : 'border-[#94BBFF]'
            }`}
          >
            <option value="">Select a category</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Tags (Select multiple)
          </label>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    tags: prev.tags.includes(tag)
                      ? prev.tags.filter(t => t !== tag)
                      : [...prev.tags, tag]
                  }));
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.tags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Continue to Edit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;
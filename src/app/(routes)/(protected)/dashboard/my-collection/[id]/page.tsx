"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { getMyCollectionById, removePostFromCollection, updateCollection } from '@/actions/collection'
import { Loader2, Trash2, Upload, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { VisibilityEnum } from '@/schemas/common'
import api from '@/lib/api'

interface Post {
  id: string
  title: string
  description: string | null
  visibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS'
  coverImage: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    username: string
    avatar: string | null
  }
}

interface CollectionData {
  id: string
  name: string
  description: string | null
  isDraft: boolean
  coverImage: string | null
  visibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS'
  userId: string
  posts: Post[]
  updatedAt: Date
}

export default function CollectionDetailsPage() {
  const params = useParams<{ id: string }>()
  const collectionId = params.id
  const [collection, setCollection] = useState<CollectionData | null>(null)
  const [editData, setEditData] = useState<CollectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingPostId, setRemovingPostId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (!acceptedFiles.length || !isEditing || !editData) return
      await handleImageUpload(acceptedFiles[0])
    }
  })

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true)
      const response = await api.post('/upload/presigned-url', {
        fileName: file.name,
        fileType: file.type,
        userId: editData?.userId
      })

      const presignedData = response.data

      const uploadResponse = await fetch(presignedData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })

      if (!uploadResponse.ok) throw new Error('Upload failed')

      setEditData(prev => prev ? {
        ...prev,
        coverImage: presignedData.fileUrl,
        tempImageKey: presignedData.key // Store temp key for final save
      } : null)

      toast.success('Image uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const fetchCollection = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!collectionId) {
        throw new Error('Missing collection ID')
      }

      const response = await getMyCollectionById(collectionId)

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load collection')
      }

      if (!response.data) {
        throw new Error('Collection data not found')
      }

      setCollection(response.data)
      setEditData(response.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePost = async (postId: string) => {
    if (!collectionId || !postId || !collection) return
    
    try {
      setRemovingPostId(postId)
      
      const result = await removePostFromCollection(collectionId, postId)
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to remove post')
      }

      setCollection(prev => prev ? {
        ...prev,
        posts: prev.posts.filter(post => post.id !== postId)
      } : null)
      
      setEditData(prev => prev ? {
        ...prev,
        posts: prev.posts.filter(post => post.id !== postId)
      } : null)

      toast.success('Post removed from collection')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove post')
    } finally {
      setRemovingPostId(null)
    }
  }

  const handleSave = async () => {
    if (!collectionId || !editData) return
    
    try {
      setIsSaving(true)
      
      // If draft is true, force visibility to PRIVATE
      const visibility = editData.isDraft ? 'PRIVATE' : editData.visibility

      const updatePayload = {
        ...editData,
        visibility,
        // Only include tempImageKey if coverImage was changed
        tempImageKey: editData.coverImage !== collection?.coverImage 
          ? (editData as any).tempImageKey 
          : undefined
      }

      const result = await updateCollection({
        collectionId,
        ...updatePayload
      })

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update collection')
      }

      await fetchCollection()
      setIsEditing(false)
      toast.success('Collection updated successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (collection) {
      setEditData(collection)
    }
    setIsEditing(false)
  }

  const handleFieldChange = <T extends keyof CollectionData>(
    field: T,
    value: CollectionData[T]
  ) => {
    if (!editData) return
    
    // Special handling for draft toggle
    if (field === 'isDraft' && value === true) {
      setEditData({
        ...editData,
        isDraft: true,
        visibility: 'PRIVATE' // Force private when draft
      })
    } else {
      setEditData({
        ...editData,
        [field]: value
      })
    }
  }

  useEffect(() => {
    fetchCollection()
  }, [collectionId])

  if (loading && !collection) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p>{error}</p>
          <Link
            href="/collections"
            className="mt-4 inline-block text-blue-500 hover:underline"
          >
            Back to Collections
          </Link>
        </div>
      </div>
    )
  }

  if (!collection || !editData) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-2">Collection not found</h1>
          <Link
            href="/collections"
            className="mt-4 inline-block text-blue-500 hover:underline"
          >
            Back to Collections
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Edit/Save Controls */}
      <div className="flex justify-end gap-4 mb-6">
        {isEditing ? (
          <>
            <button
              onClick={handleCancel}
              className="px-4 py-2 flex items-center gap-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 flex items-center gap-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Save Changes
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Collection
          </button>
        )}
      </div>

      {/* Collection Header */}
      <div className="mb-8 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div 
          {...getRootProps()}
          className={`relative h-64 w-full rounded-lg overflow-hidden mb-4 cursor-pointer transition-all ${
            isDragActive ? 'ring-2 ring-blue-500' : ''
          } ${isEditing ? 'hover:ring-2 hover:ring-blue-400' : 'pointer-events-none'}`}
        >
          <input {...getInputProps()} />
          <img
            src={editData.coverImage || '/default-cover.jpg'}
            alt={editData.name || 'Collection cover'}
            className="w-full h-full object-cover"
          />
          {isEditing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity hover:opacity-100">
              <div className="text-center p-4">
                <Upload size={24} className="mx-auto mb-2" />
                <p className="text-sm">
                  {isDragActive ? 'Drop to upload' : 'Click or drag to upload new cover'}
                </p>
                {isUploading && (
                  <p className="mt-2 text-sm flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Uploading...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="text-3xl font-bold text-white bg-gray-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <h1 className="text-3xl font-bold text-white">
                {editData.name}
                {editData.isDraft && (
                  <span className="ml-3 bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full align-middle">
                    Draft
                  </span>
                )}
              </h1>
            )}
            
            {isEditing ? (
              <textarea
                value={editData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="text-gray-300 bg-gray-700 rounded-lg px-4 py-2 w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter collection description"
              />
            ) : (
              <p className="text-gray-300">
                {editData.description || 'No description'}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            {isEditing ? (
              <>
                <select
                  value={editData.visibility}
                  onChange={(e) => handleFieldChange(
                    'visibility', 
                    e.target.value as 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS'
                  )}
                  disabled={editData.isDraft}
                  className={`px-4 py-2 rounded-full text-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    editData.isDraft ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {VisibilityEnum._def.values.map((value) => (
                    <option key={value} value={value}>
                      {value.toLowerCase()}
                    </option>
                  ))}
                </select>
                
                <label className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={editData.isDraft}
                    onChange={(e) => handleFieldChange('isDraft', e.target.checked)}
                    className="rounded text-blue-500 h-5 w-5"
                  />
                  <span className="text-gray-300">Draft Collection</span>
                </label>
              </>
            ) : (
              <div className="space-y-2">
                <span className={`px-4 py-2 inline-block rounded-full text-sm ${
                  editData.visibility === 'PUBLIC'
                    ? 'bg-green-900/30 text-green-400'
                    : editData.visibility === 'FOLLOWERS'
                    ? 'bg-blue-900/30 text-blue-400'
                    : 'bg-purple-900/30 text-purple-400'
                }`}>
                  {editData.visibility.toLowerCase()}
                </span>
                {editData.isDraft && (
                  <span className="px-4 py-2 inline-block rounded-full text-sm bg-yellow-900/30 text-yellow-400">
                    draft
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mt-8 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Posts ({editData.posts.length})
          </h2>
        </div>

        {editData.posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No posts in this collection yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editData.posts.map((post) => (
              <div
                key={post.id}
                className="group bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all relative"
              >
                <button
                  onClick={() => handleRemovePost(post.id)}
                  disabled={removingPostId === post.id || !isEditing}
                  className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all ${
                    isEditing 
                      ? 'bg-red-500/90 hover:bg-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100'
                      : 'opacity-0 cursor-default'
                  }`}
                  aria-label={`Remove ${post.title} from collection`}
                >
                  {removingPostId === post.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>

                {post.coverImage && (
                  <div className="relative h-40 w-full bg-gray-700">
                    <img
                      src={post.coverImage}
                      alt={post.title || 'Post cover'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {post.title || 'Untitled post'}
                  </h3>
                  {post.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {post.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-4">
                    {post.user.avatar ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={post.user.avatar}
                          alt={post.user.username || 'User avatar'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                        {post.user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-sm text-gray-400">
                      {post.user.username || 'Unknown user'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                    <span>
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${
                      post.visibility === 'PUBLIC'
                        ? 'bg-green-900/20 text-green-400'
                        : post.visibility === 'FOLLOWERS'
                        ? 'bg-blue-900/20 text-blue-400'
                        : 'bg-purple-900/20 text-purple-400'
                    }`}>
                      {post.visibility.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
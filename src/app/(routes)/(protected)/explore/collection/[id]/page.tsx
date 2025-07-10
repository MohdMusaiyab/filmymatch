"use client"
import React, { use } from 'react'
import { Snippet } from '@/app/components/ui/Snippet'
import { getCollectionById } from '@/actions/collection'
import { toast } from 'sonner'
import { notFound, redirect } from 'next/navigation'
import { useParams } from 'next/navigation'

interface Post {
  id: string
  title: string
  coverImage: string | null
  visibility: string
  userId: string
  user: {
    id: string
    username: string
    avatar: string | null
  }
  createdAt: string
  updatedAt: string
}

interface Collection {
  id: string
  name: string
  description: string | null
  coverImage: string | null
  visibility: string
  createdAt: string
  updatedAt: string
  userId: string
  posts: Post[]
}

interface ApiResponse {
  success: boolean
  data?: Collection
  error?: {
    message: string
    code: string
  }
}


const CollectionPage = () => {
  const params = useParams<{ id: string }>()
  const id = params.id;
  const [collection, setCollection] = React.useState<Collection | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchCollection = async () => {
      try {
        const result = await getCollectionById(id) as ApiResponse

        if (!result.success) {
          if (result.error?.code === 'NOT_FOUND') {
            notFound()
          }

          if (result.error?.code === 'UNAUTHORIZED') {
            redirect('/login')
          }

          toast.error(result.error?.message || 'An error occurred')
          redirect('/collections')
          return
        }

        if (result.data) {
          setCollection(result.data)
        }
      } catch (error) {
        toast.error('Failed to load collection')
        redirect('/collections')
      } finally {
        setLoading(false)
      }
    }

    fetchCollection()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-800 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!collection) {
    return notFound()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        {/* Collection Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-6">
          {collection.coverImage && (
            <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden">
              <img
                src={collection.coverImage}
                alt={collection.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {collection.name}
            </h1>
            <p className="text-gray-300 max-w-2xl">
              {collection.description}
            </p>

            <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
              <span>
                {collection.posts.length} {collection.posts.length === 1 ? 'post' : 'posts'}
              </span>
              <span>
                Created {new Date(collection.createdAt).toLocaleDateString()}
              </span>
              <span className="capitalize">
                {collection.visibility.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {collection.posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.posts.map((post) => (
              <Snippet
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title,
                  description: post.title, // Fallback to title
                  category: 'Post',
                  visibility: post.visibility,
                  coverImage: post.coverImage || undefined,
                  user: {
                    id: post.user.id,
                    username: post.user.username,
                    avatar: post.user.avatar || undefined
                  },
                  images: [],
                  _count: {
                    likes: 0,
                    comments: 0
                  },
                  createdAt: post.createdAt,
                  linkTo: `/explore/post/${post.id}`
                }}
                menuOpen={null}
                toggleMenu={() => { }}
                showActions={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">This collection has no posts yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CollectionPage
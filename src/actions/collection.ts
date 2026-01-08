"use server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  extractKeyFromUrl,
  generatePresignedViewUrl,
  changeFileVisibility,
} from "@/lib/aws-s3";
import { Visibility } from "@/schemas/common";
import { Prisma } from "@prisma/client";
//Server Action for Creating a Collection , the User will always be the logged in User
export async function createCollection(name: string) {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: {
        message: "Unauthorized access",
        code: "UNAUTHORIZED",
      },
    };
  }
  try {
    if (!name) {
      return {
        success: false,
        error: {
          message: "Collection name is required",
          code: "INVALID_INPUT",
        },
      };
    }
    //Check if Collectin with this name and associate with this User ID Exists or not
    const existingCollection = await prisma.collection.findFirst({
      where: {
        userId: session?.id,
        name: name,
      },
    });

    if (existingCollection) {
      return {
        success: false,
        error: {
          message: "Collection with similar name already exists",
          code: "DUPLICATE_COLLECTION",
        },
      };
    }
    //Else Create Collection
    const newCollection = await prisma.collection.create({
      data: {
        name: name,
        userId: session?.id,
      },
    });
    return {
      success: true,
      message: `Collection with ${name} created successfully`,
      data: newCollection,
      code: "COLLECTION_CREATED",
    };
  } catch (error) {
    console.log("Error");
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Internal server error",
        code: "SERVER_ERROR",
      },
    };
  }
}

//Now Few VVIP Actions

//Adding a new Post to the Collection

export async function addNewPostToCollection(
  collectionId: string,
  postId: string
) {
  try {
    // 🛡️ Session validation
    const user = await getSession();
    if (!user?.id) {
      return {
        success: false,
        error: {
          message: "Unauthorized access",
          code: "UNAUTHORIZED",
        },
      };
    }

    const loggedInUserId = user.id;

    // Input validation
    if (!collectionId || !postId) {
      return {
        success: false,
        error: {
          message: "Collection ID and Post ID are required",
          code: "INVALID_INPUT",
        },
      };
    }

    // ✅ Check collection ownership and post existence
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: loggedInUserId,
      },
      select: {
        id: true,
        coverImage: true,
        posts: {
          where: { id: postId },
          select: { id: true },
        },
        _count: {
          select: { posts: true }
        }
      },
    });

    if (!collection) {
      return {
        success: false,
        error: {
          message: "Collection not found",
          code: "NOT_FOUND",
        },
      };
    }

    // Check for duplicate post
    if (collection.posts.length > 0) {
      return {
        success: false,
        error: {
          message: "Post already exists in the collection",
          code: "DUPLICATE_POST",
        },
      };
    }

    // Check post existence and access
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        visibility: true,
        userId: true,
        coverImage: true,
      },
    });

    if (!post) {
      return {
        success: false,
        error: {
          message: "Post does not exist",
          code: "POST_NOT_FOUND",
        },
      };
    }

    const isOwner = post.userId === loggedInUserId;
    const isPublic = post.visibility === "PUBLIC";

    let isFollower = false;
    if (post.visibility === "FOLLOWERS" && !isOwner) {
      const follow = await prisma.follow.findFirst({
        where: {
          followerId: loggedInUserId,
          followingId: post.userId,
        },
      });
      isFollower = !!follow;
    }

    const hasAccess = isOwner || isPublic || isFollower;

    if (!hasAccess) {
      return {
        success: false,
        error: {
          message: "You do not have access to this post",
          code: "FORBIDDEN",
        },
      };
    }

    // ✅ Auto-set cover image logic
    let coverImageUpdate = {};
    
    // Case 1: Collection has no cover image AND post has cover image
    if (!collection.coverImage && post.coverImage) {
      coverImageUpdate = { coverImage: post.coverImage };
      console.log(`Auto-setting collection cover to post image: ${post.coverImage}`);
    }
    // Case 2: Collection is empty (first post) AND post has cover image
    else if (collection._count.posts === 0 && post.coverImage) {
      coverImageUpdate = { coverImage: post.coverImage };
      console.log(`First post - setting collection cover: ${post.coverImage}`);
    }

    // ✅ Secure update with ownership check AND cover image management
    await prisma.collection.update({
      where: {
        id: collectionId,
        userId: loggedInUserId, // Prevent unauthorized updates
      },
      data: {
        posts: {
          connect: { id: postId },
        },
        ...coverImageUpdate, // Apply cover image update if needed
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Post added to the collection successfully",
      data: {
        coverImageUpdated: Object.keys(coverImageUpdate).length > 0
      }
    };
  } catch (error) {
    console.error("Add post to collection failed:", error);
    
    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: {
            message: "Collection or post not found",
            code: "NOT_FOUND",
          },
        };
      }
      if (error.code === 'P2028') {
        return {
          success: false,
          error: {
            message: "Database connection issue, please try again",
            code: "DATABASE_ERROR",
          },
        };
      }
    }
    
    return {
      success: false,
      error: {
        message: "Operation failed",
        code: "SERVER_ERROR",
        details: error instanceof Error ? error.message : undefined,
      },
    };
  }
}
//Removing a Post from the Collection

export async function removePostFromCollection(
  collectionId: string,
  postId: string
) {
  try {
    const user = await getSession();
    if (!user?.id) {
      return {
        success: false,
        error: { message: "Unauthorized", code: "UNAUTHORIZED" },
      };
    }

    if (!collectionId || !postId) {
      return {
        success: false,
        error: { message: "Missing IDs", code: "INVALID_INPUT" },
      };
    }

    return await prisma.$transaction(async (tx) => {
      // Get collection with posts and current cover image
      const collection = await tx.collection.findFirst({
        where: { id: collectionId, userId: user.id },
        include: {
          posts: {
            where: { id: postId },
            select: { id: true, coverImage: true },
          },
          // Get remaining posts for cover image logic
          _count: {
            select: { posts: true },
          },
        },
      });

      if (!collection) {
        return {
          success: false,
          error: { message: "Collection or post not found", code: "NOT_FOUND" },
        };
      }

      const postToRemove = collection.posts[0];
      if (!postToRemove) {
        return {
          success: false,
          error: { message: "Post not in collection", code: "NOT_FOUND" },
        };
      }

      // ✅ NEW: Auto-update cover image logic
      let coverImageUpdate = {};
      const isRemovingCoverImagePost =
        collection.coverImage === postToRemove.coverImage;

      if (isRemovingCoverImagePost) {
        if (collection._count.posts === 1) {
          // Last post removed - clear cover image
          coverImageUpdate = { coverImage: null };
        } else {
          // Get first remaining post's cover image
          const remainingPosts = await tx.collection.findUnique({
            where: { id: collectionId },
            select: {
              posts: {
                where: { NOT: { id: postId } },
                take: 1,
                select: { coverImage: true },
              },
            },
          });

          if (remainingPosts?.posts[0]?.coverImage) {
            coverImageUpdate = {
              coverImage: remainingPosts.posts[0].coverImage,
            };
          } else {
            coverImageUpdate = { coverImage: null };
          }
        }
      }

      // Remove post and potentially update cover image
      await tx.collection.update({
        where: { id: collectionId, userId: user.id },
        data: {
          posts: { disconnect: { id: postId } },
          ...coverImageUpdate, // ✅ Apply cover image update if needed
        },
      });

      return {
        success: true,
        message: "Post removed successfully",
      };
    });
  } catch (error) {
    console.error("Remove post failed:", error);
    return {
      success: false,
      error: { message: "Operation failed", code: "SERVER_ERROR" },
    };
  }
}
//Fetching all Collections of the User
//Add that preSigned URL for the cover image if it exists
export async function getUserCollections(userId: string) {
  const session = await getSession();

  if (!session?.id || !userId) {
    return {
      success: false,
      error: {
        message: "Unauthorized access",
        code: "UNAUTHORIZED",
      },
    };
  }

  try {
    const isOwner = session.id === userId;

    // ✅ FIX 1: Check follow relationship FIRST (single query)
    let isFollowing = false;
    if (!isOwner) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.id,
            followingId: userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    // ✅ FIX 2: Filter collections by visibility for NON-OWNERS
    const collectionWhereClause = isOwner
      ? { userId, isDraft: false }
      : {
          userId,
          isDraft: false,
          OR: [
            { visibility: "PUBLIC" as Visibility },
            { visibility: "FOLLOWERS" as Visibility }, // Only include if we check follows below
          ],
        };

    // ✅ FIX 3: Get collections with post owners for follow checks
    const collections = await prisma.collection.findMany({
      where: collectionWhereClause,
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        visibility: true,
        isDraft: true,
        createdAt: true,
        updatedAt: true,
        posts: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            visibility: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // ✅ FIX 4: For non-owners, filter FOLLOWERS collections
    let visibleCollections = collections;
    if (!isOwner) {
      visibleCollections = collections.filter(
        (collection) =>
          collection.visibility === "PUBLIC" ||
          (collection.visibility === "FOLLOWERS" && isFollowing)
      );
    }

    // ✅ FIX 5: Collect ALL unique post owners for single follow query
    const allPostOwners = new Set<string>();
    visibleCollections.forEach((collection) => {
      collection.posts.forEach((post) => {
        if (post.userId !== session.id) {
          allPostOwners.add(post.userId);
        }
      });
    });

    // ✅ FIX 6: Single follow query for ALL post owners
    const followingRelations = await prisma.follow.findMany({
      where: {
        followerId: session.id,
        followingId: { in: Array.from(allPostOwners) },
      },
      select: { followingId: true },
    });
    const followingIds = new Set(followingRelations.map((f) => f.followingId));

    // ✅ FIX 7: Filter posts by visibility CORRECTLY
    const enhancedCollections = await Promise.all(
      visibleCollections.map(async (collection) => {
        const visiblePosts = await Promise.all(
          collection.posts.map(async (post) => {
            const isPostOwner = post.userId === session.id;
            const canViewPost =
              isPostOwner ||
              post.visibility === "PUBLIC" ||
              (post.visibility === "FOLLOWERS" &&
                followingIds.has(post.userId));

            // ✅ CRITICAL: Don't leak private post data
            if (!canViewPost) return null;

            const signedCover = post.coverImage
              ? await generatePresignedViewUrl(
                  extractKeyFromUrl(post.coverImage)
                )
              : null;

            return {
              ...post,
              coverImage: signedCover,
            };
          })
        );

        const filteredPosts = visiblePosts.filter(Boolean);

        const signedCollectionCover = collection.coverImage
          ? await generatePresignedViewUrl(
              extractKeyFromUrl(collection.coverImage)
            )
          : null;

        return {
          ...collection,
          coverImage: signedCollectionCover,
          posts: filteredPosts,
        };
      })
    );

    return {
      success: true,
      data: enhancedCollections,
      message: "Collections fetched successfully",
      code: "SUCCESS",
    };
  } catch (error) {
    console.error("getUserCollections error:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Internal server error",
        code: "SERVER_ERROR",
      },
    };
  }
}

// Fetching a single collection by ID
export async function getCollectionById(collectionId: string) {
  const session = await getSession();
  if (!session?.id) {
    return {
      success: false,
      error: { message: "Unauthorized access", code: "UNAUTHORIZED" },
    };
  }

  try {
    // ✅ OPTIMIZED: Single query with proper access control
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        // Collection visibility check in single query
        OR: [
          { userId: session.id }, // Owner sees all (including drafts)
          {
            isDraft: false, // Non-owners only see non-drafts
            OR: [
              { visibility: "PUBLIC" },
              {
                visibility: "FOLLOWERS",
                user: {
                  followers: { some: { followerId: session.id } },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        visibility: true,
        isDraft: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        posts: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            visibility: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            category: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!collection) {
      return {
        success: false,
        error: {
          message: "Collection not found or access denied",
          code: "NOT_FOUND",
        },
      };
    }

    const isOwner = collection.userId === session.id;

    // ✅ EFFICIENT: Get unique post owners for follow checks
    const postOwners = new Set<string>();
    collection.posts.forEach((post) => {
      if (post.userId !== session.id) {
        postOwners.add(post.userId);
      }
    });

    // ✅ SINGLE QUERY: Follow status for all post owners
    let followingIds: Set<string> = new Set();
    if (postOwners.size > 0) {
      const following = await prisma.follow.findMany({
        where: {
          followerId: session.id,
          followingId: { in: Array.from(postOwners) },
        },
        select: { followingId: true },
      });
      followingIds = new Set(following.map((f) => f.followingId));
    }

    // ✅ PRE-FILTER: Get visible post IDs for single saved posts query
    const visiblePosts = collection.posts.filter((post) => {
      const isPostOwner = post.userId === session.id;
      return (
        isPostOwner ||
        post.visibility === "PUBLIC" ||
        (post.visibility === "FOLLOWERS" && followingIds.has(post.userId))
      );
    });

    const visiblePostIds = visiblePosts.map((post) => post.id);

    // ✅ SINGLE QUERY: Saved status for all visible posts
    const savedPosts = await prisma.savedPost.findMany({
      where: {
        userId: session.id,
        postId: { in: visiblePostIds },
      },
      select: { postId: true },
    });
    const savedPostIds = new Set(savedPosts.map((p) => p.postId));

    // ✅ PROCESS: All visible posts with signed URLs
    const processedPosts = await Promise.all(
      visiblePosts.map(async (post) => {
        const [signedCoverImage, signedAvatar] = await Promise.all([
          post.coverImage
            ? generatePresignedViewUrl(extractKeyFromUrl(post.coverImage))
            : null,
          post.user.avatar
            ? generatePresignedViewUrl(extractKeyFromUrl(post.user.avatar))
            : null,
        ]);

        return {
          ...post,
          coverImage: signedCoverImage,
          isSaved: savedPostIds.has(post.id),
          user: {
            ...post.user,
            avatar: signedAvatar,
          },
        };
      })
    );

    const signedCollectionCover = collection.coverImage
      ? await generatePresignedViewUrl(extractKeyFromUrl(collection.coverImage))
      : null;

    return {
      success: true,
      data: {
        ...collection,
        coverImage: signedCollectionCover,
        posts: processedPosts,
        isOwner, // ✅ Now actually used and returned
      },
      message: "Collection fetched successfully",
      code: "SUCCESS",
    };
  } catch (error) {
    console.error("getCollectionById error:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Internal server error",
        code: "SERVER_ERROR",
      },
    };
  }
}
//Fetch You Collection Names, i.e. including Drafts Collection so that User Can select them and then add to that particular collection

export async function getUserCollectionNames(postId: string) {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: {
        message: "Unauthorized access",
        code: "UNAUTHORIZED",
      },
    };
  }

  try {
    if (!postId || typeof postId !== "string") {
      return {
        success: false,
        error: {
          message: "Invalid input",
          code: "INVALID_INPUT",
        },
      };
    }

    // Fetch all collections
    const collections = await prisma.collection.findMany({
      where: {
        userId: session.id,
      },
      select: {
        id: true,
        name: true,
        isDraft: true,
        posts: {
          where: {
            id: postId,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add containsPost boolean
    const formatted = collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      isDraft: collection.isDraft,
      containsPost: collection.posts.length > 0, // true if post is in the collection
    }));

    return {
      success: true,
      data: formatted,
      message: "Collection names with post presence fetched successfully",
      code: "SUCCESS",
    };
  } catch (error) {
    console.error("getUserCollectionNames error:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Internal server error",
        code: "SERVER_ERROR",
      },
    };
  }
}

//Server Action for Getting my Own Collection(a single one for allowing updates)
export async function getMyCollectionById(collectionId: string) {
  const session = await getSession();
  if (!session?.id) {
    // ✅ FIX 1: Check session.id
    return {
      success: false,
      error: { message: "Unauthorized", code: "UNAUTHORIZED" },
    };
  }

  try {
    if (!collectionId || typeof collectionId !== "string") {
      return {
        success: false,
        error: { message: "Invalid collection ID", code: "INVALID_INPUT" },
      };
    }

    // ✅ FIX 2: Fetch collection with ownership check
    const collection = await prisma.collection.findUnique({
      where: {
        id: collectionId,
        userId: session.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        visibility: true,
        isDraft: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        posts: {
          where: { isDraft: false }, // Only non-draft posts
          select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            visibility: true,
            userId: true, // ✅ NEEDED for access checks
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!collection) {
      return {
        success: false,
        error: {
          message: "Collection not found or access denied",
          code: "NOT_FOUND",
        },
      };
    }

    // ✅ FIX 3: Filter posts by visibility/access
    const postOwners = new Set<string>();
    collection.posts.forEach((post) => {
      if (post.userId !== session.id) {
        postOwners.add(post.userId);
      }
    });

    // ✅ FIX 4: Check follow relationships for follower-only posts
    let followingIds: Set<string> = new Set();
    if (postOwners.size > 0) {
      const following = await prisma.follow.findMany({
        where: {
          followerId: session.id,
          followingId: { in: Array.from(postOwners) },
        },
        select: { followingId: true },
      });
      followingIds = new Set(following.map((f) => f.followingId));
    }

    // ✅ FIX 5: Filter visible posts
    const visiblePosts = collection.posts.filter((post) => {
      const isPostOwner = post.userId === session.id;
      return (
        isPostOwner ||
        post.visibility === "PUBLIC" ||
        (post.visibility === "FOLLOWERS" && followingIds.has(post.userId))
      );
      // ❌ PRIVATE posts from other users are FILTERED OUT
    });

    // Helper function to extract key and generate signed URL
    const getSignedUrl = async (url: string | null) => {
      if (!url) return null;
      try {
        const key = extractKeyFromUrl(url);
        return await generatePresignedViewUrl(key);
      } catch (error) {
        console.error(`Failed to sign URL: ${url}`, error);
        return null;
      }
    };

    // Process all images in parallel
    const [collectionCover, ...postCovers] = await Promise.all([
      getSignedUrl(collection.coverImage),
      ...visiblePosts.map((post) => getSignedUrl(post.coverImage)),
    ]);

    // Transform data with signed URLs
    const transformedData = {
      ...collection,
      coverImage: collectionCover,
      posts: visiblePosts.map((post, index) => ({
        ...post,
        coverImage: postCovers[index],
        // ✅ OPTIONAL: Add restricted flag for consistent UI
        restricted: false, // All posts here are accessible
      })),
    };

    return {
      success: true,
      data: transformedData,
      message: "Collection fetched successfully",
      code: "SUCCESS",
    };
  } catch (error) {
    console.error("Collection fetch failed:", error);
    return {
      success: false,
      error: {
        message: "Failed to load collection",
        code: "SERVER_ERROR",
        details: error instanceof Error ? error.message : undefined,
      },
    };
  }
}
//Now for getting all the Collection of Yours

export async function getMyCollections() {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      error: {
        message: "Unauthorized access",
        code: "UNAUTHORIZED",
      },
    };
  }

  try {
    // Fetch all collections for the logged-in user
    const collections = await prisma.collection.findMany({
      where: { userId: session.id },
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        visibility: true,
        isDraft: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    //Check if the user has any collections
    if (collections.length === 0) {
      return {
        success: true,
        data: collections,
        message: "No collections found",
        code: "NO_COLLECTIONS",
      };
    }
    return {
      success: true,
      data: collections,
      message: "Collections fetched successfully",
      code: "SUCCESS",
    };
  } catch (error) {
    console.error("getMyCollections error:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Internal server error",
        code: "SERVER_ERROR",
      },
    };
  }
}

//For Getting my own Collections, Draft Private, etc. etc.
export async function getMyOwnCollections() {
  const session = await getSession();
  if (!session?.id) {
    // ✅ FIX 1: Check session.id specifically
    return {
      success: false,
      error: {
        message: "Unauthorized access",
        code: "UNAUTHORIZED",
      },
    };
  }

  try {
    // ✅ FIX 2: Optimized query - use _count instead of loading posts
    const collections = await prisma.collection.findMany({
      where: {
        userId: session.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        visibility: true,
        isDraft: true,
        createdAt: true,
        updatedAt: true,
        // ✅ OPTIMIZED: Use _count instead of loading all post objects
        _count: {
          select: {
            posts: true, // Or add filter: posts: { where: { isDraft: false } }
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // ✅ FIX 3: Enhanced with signed cover images
    const enhanced = await Promise.all(
      collections.map(async (col) => {
        let signedCover = null;
        if (col.coverImage) {
          try {
            const key = extractKeyFromUrl(col.coverImage);
            signedCover = await generatePresignedViewUrl(key);
          } catch (error) {
            console.error(
              `Failed to sign cover image for collection ${col.id}:`,
              error
            );
            signedCover = col.coverImage; // Fallback
          }
        }

        return {
          id: col.id,
          name: col.name,
          description: col.description,
          coverImage: signedCover,
          visibility: col.visibility,
          isDraft: col.isDraft,
          createdAt: col.createdAt,
          updatedAt: col.updatedAt,
          postCount: col._count.posts, // ✅ From optimized _count
        };
      })
    );

    // ✅ FIX 4: Better empty state handling
    if (enhanced.length === 0) {
      return {
        success: true,
        data: [],
        message: "No collections found",
        code: "NO_COLLECTIONS_FOUND",
      };
    }

    return {
      success: true,
      data: enhanced,
      message: "Your collections fetched successfully",
      code: "SUCCESS",
    };
  } catch (error) {
    console.error("getMyOwnCollections error:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Internal server error",
        code: "SERVER_ERROR",
      },
    };
  }
}

//Handling the Update of a Collection
interface UpdateCollectionParams {
  collectionId: string;
  name?: string;
  description?: string | null;
  isDraft?: boolean;
  visibility?: Visibility;
  coverImage?: string | null;
  tempImageKey?: string | null;
}

export async function updateCollection({
  collectionId,
  name,
  description,
  isDraft,
  visibility,
  coverImage,
  tempImageKey,
}: UpdateCollectionParams) {
  try {
    // 🔐 FIX 1: Add Authentication
    const user = await getSession();
    if (!user?.id) {
      return {
        success: false,
        error: {
          message: "Unauthorized access",
          code: "UNAUTHORIZED",
        },
      };
    }

    // ✅ FIX 2: Input Validation
    if (!collectionId) {
      return {
        success: false,
        error: {
          message: "Collection ID is required",
          code: "INVALID_INPUT",
        },
      };
    }

    // 🔐 FIX 3: Check Collection Ownership
    const existingCollection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: user.id, // ✅ Only user's own collections
      },
    });

    if (!existingCollection) {
      return {
        success: false,
        error: {
          message: "Collection not found",
          code: "NOT_FOUND",
        },
      };
    }

    let finalCoverImage = coverImage;

    // Process image if new one was uploaded
    if (
      tempImageKey &&
      coverImage &&
      coverImage !== existingCollection.coverImage
    ) {
      try {
        // Move from temp to permanent location
        finalCoverImage = await changeFileVisibility(tempImageKey);
      } catch (error) {
        console.error("Failed to move cover image:", error);
        return {
          success: false,
          error: {
            message: "Failed to process cover image",
            code: "IMAGE_PROCESSING_ERROR",
          },
        };
      }
    }

    // Validate visibility against enum values
    const validVisibilities = ["PUBLIC", "PRIVATE", "FOLLOWERS"];
    if (visibility && !validVisibilities.includes(visibility)) {
      return {
        success: false,
        error: {
          message: "Invalid visibility value",
          code: "INVALID_INPUT",
        },
      };
    }

    // Prepare update data
    const updateData: {
      name?: string;
      description?: string | null;
      isDraft?: boolean;
      visibility?: Visibility;
      coverImage?: string | null;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isDraft !== undefined) updateData.isDraft = isDraft;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (finalCoverImage !== undefined) updateData.coverImage = finalCoverImage;

    // Don't update if no changes
    if (Object.keys(updateData).length === 0) {
      return {
        success: true,
        message: "No changes detected",
        data: existingCollection,
      };
    }

    // 🔐 FIX 4: Secure Update with Ownership Check
    const updatedCollection = await prisma.collection.update({
      where: {
        id: collectionId,
        userId: user.id, // ✅ Prevent unauthorized updates
      },
      data: updateData,
    });

    return {
      success: true,
      message: "Collection updated successfully",
      data: updatedCollection,
    };
  } catch (error) {
    console.error("updateCollection error:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return {
          success: false,
          error: {
            message: "Collection not found or access denied",
            code: "NOT_FOUND",
          },
        };
      }

      return {
        success: false,
        error: {
          message: error.message,
          code: error.message.includes("visibility")
            ? "INVALID_INPUT"
            : "SERVER_ERROR",
        },
      };
    }

    return {
      success: false,
      error: {
        message: "Failed to update collection",
        code: "SERVER_ERROR",
      },
    };
  }
}

//For Deleting a Collection
export async function deleteCollection(collectionId: string) {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      error: {
        message: "Unauthorized access",
        code: "UNAUTHORIZED",
      },
    };
  }

  try {
    // Find the collection to verify ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { userId: true },
    });

    if (!collection) {
      return {
        success: false,
        error: {
          message: "Collection not found",
          code: "NOT_FOUND",
        },
      };
    }

    if (collection.userId !== session.id) {
      return {
        success: false,
        error: {
          message: "You do not have permission to delete this collection",
          code: "FORBIDDEN",
        },
      };
    }

    // Delete the collection
    await prisma.collection.delete({
      where: { id: collectionId },
    });

    return {
      success: true,
      message: "Collection deleted successfully",
      code: "SUCCESS",
    };
  } catch (error) {
    console.error("deleteCollection error:", error);
    return {
      success: false,
      error: {
        message: "Internal server error",
        code: "SERVER_ERROR",
      },
    };
  }
}

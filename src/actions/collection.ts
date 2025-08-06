"use server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  extractKeyFromUrl,
  generatePresignedViewUrl,
  changeFileVisibility,
} from "@/lib/aws-s3";
import { Visibility } from "@/schemas/common";
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
  //check for Session and user id
  const user = await getSession();
  if (!user) {
    return {
      success: false,
      error: {
        message: "Unauthorized access",
        code: "UNAUTHORIZED",
      },
    };
  }

  const loggedInUserId = user?.id;
  //Find the Collection with the given ID and User ID
  const collection = await prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId: loggedInUserId,
    },
    select: {
      posts: {
        select: {
          id: true,
        },
      },
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
  //Check if the Post is already in the Collection
  const existingPost = collection.posts.find((post) => post.id === postId);
  if (existingPost) {
    return {
      success: false,
      error: {
        message: "Post already exists in the collection",
        code: "DUPLICATE_POST",
      },
    };
  }
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      visibility: true,
      userId: true,
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
  //Add the Post in the Collection
  await prisma.collection.update({
    where: { id: collectionId },
    data: {
      posts: {
        connect: { id: postId },
      },
    },
  });

  return {
    success: true,
    message: "Post added to the collection successfully",
  };
}

//Removing a Post from the Collection

export async function removePostFromCollection(
  collectionId: string,
  postId: string
) {
  try {
    // Session check
    const user = await getSession();
    if (!user) {
      return {
        success: false,
        error: { message: "Unauthorized", code: "UNAUTHORIZED" },
      };
    }

    // Validate inputs
    if (!collectionId || !postId) {
      return {
        success: false,
        error: { message: "Missing IDs", code: "INVALID_INPUT" },
      };
    }

    return await prisma.$transaction(async (tx) => {
      // Verify collection ownership and post existence
      const collection = await tx.collection.findFirst({
        where: {
          id: collectionId,
          userId: user.id,
          posts: { some: { id: postId } },
        },
      });

      if (!collection) {
        return {
          success: false,
          error: { message: "Collection or post not found", code: "NOT_FOUND" },
        };
      }

      // Remove post
      await tx.collection.update({
        where: { id: collectionId },
        data: { posts: { disconnect: { id: postId } } },
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
      error: {
        message: "Operation failed",
        code: "SERVER_ERROR",
        details: error instanceof Error ? error.message : undefined,
      },
    };
  }
}

//Fetching all Collections of the User
//Add that preSigned URL for the cover image if it exists
export async function getUserCollections(userId: string) {
  const session = await getSession();

  if (!session || !userId) {
    return {
      success: false,
      error: {
        message: "Unauthorized access",
        code: "UNAUTHORIZED",
      },
    };
  }

  try {
    // Fetch all non-draft collections with posts and their users
    const collections = await prisma.collection.findMany({
      where: {
        userId,
        isDraft: false,
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
        posts: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            visibility: true,
            userId: true,
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const isOwner = session.id === userId;

    // If the session user follows the profile user
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

    const postOwners = new Set<string>();

    // Filter visible collections + collect post owners
    const visibleCollections = collections.filter((collection) => {
      if (isOwner) return true;
      if (collection.visibility === "PUBLIC") return true;
      if (collection.visibility === "FOLLOWERS" && isFollowing) return true;
      return false;
    });

    visibleCollections.forEach((collection) => {
      collection.posts.forEach((post) => {
        if (post.userId !== session.id) postOwners.add(post.userId);
      });
    });

    // Check following relationships for post owners
    const followingRelations = await prisma.follow.findMany({
      where: {
        followerId: session.id,
        followingId: { in: Array.from(postOwners) },
      },
      select: {
        followingId: true,
      },
    });
    const followingIds = new Set(followingRelations.map((f) => f.followingId));

    // Process each collection: filter posts + sign URLs
    const enhancedCollections = await Promise.all(
      visibleCollections.map(async (collection) => {
        const visiblePosts = await Promise.all(
          collection.posts.map(async (post) => {
            const isPostOwner = post.userId === session.id;

            if (post.visibility === "PRIVATE" && !isPostOwner) return null;
            if (
              post.visibility === "FOLLOWERS" &&
              !isPostOwner &&
              !followingIds.has(post.userId)
            )
              return null;

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
  if (!session) {
    return {
      success: false,
      error: { message: "Unauthorized access", code: "UNAUTHORIZED" },
    };
  }

  try {
    // Fetch collection with posts and author
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
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
        error: { message: "Collection not found", code: "NOT_FOUND" },
      };
    }

    const isOwner = collection.userId === session.id;

    // Access check for the collection itself
    if (!isOwner) {
      if (collection.visibility === "PRIVATE") {
        return {
          success: false,
          error: {
            message: "You do not have access to this collection",
            code: "FORBIDDEN",
          },
        };
      }

      if (collection.visibility === "FOLLOWERS") {
        const isFollowing = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.id,
              followingId: collection.userId,
            },
          },
        });

        if (!isFollowing) {
          return {
            success: false,
            error: {
              message: "You do not have access to this collection",
              code: "FORBIDDEN",
            },
          };
        }
      }
    }

    // -----------------------------
    // Filter visible posts (optimized)
    // -----------------------------

    const postOwners = new Set(
      collection.posts.map((post) =>
        post.userId !== session.id ? post.userId : null
      )
    );

    postOwners.delete(null); // Remove self

    let followingIds: Set<string> = new Set();
    if (postOwners.size > 0) {
      const following = await prisma.follow.findMany({
        where: {
          followerId: session.id,
          followingId: {
            in: Array.from(postOwners).filter(
              (owner): owner is string => owner !== null
            ),
          },
        },
        select: { followingId: true },
      });

      followingIds = new Set(following.map((f) => f.followingId));
    }

    // Filter and map only visible posts
    const filteredPosts = await Promise.all(
      collection.posts.map(async (post) => {
        const isPostOwner = post.userId === session.id;
    
        if (post.visibility === "PRIVATE" && !isPostOwner) return null;
        if (
          post.visibility === "FOLLOWERS" &&
          !isPostOwner &&
          !followingIds.has(post.userId)
        ) {
          return null;
        }
    
        const signedCoverImage = post.coverImage
          ? await generatePresignedViewUrl(extractKeyFromUrl(post.coverImage))
          : null;
    
        const signedAvatar = post.user.avatar
          ? await generatePresignedViewUrl(extractKeyFromUrl(post.user.avatar))
          : null;
    
        const isSaved = await prisma.savedPost.findFirst({
          where: {
            postId: post.id,
            userId: session.id,
          },
        });
    
        return {
          ...post,
          coverImage: signedCoverImage,
          isSaved: !!isSaved,
          user: {
            ...post.user,
            avatar: signedAvatar,
          },
        };
      })
    );
    
    const filteredNonNullPosts = filteredPosts.filter(Boolean);
    
    // 🔹 Fetch saved posts for current user
    const savedPosts = await prisma.savedPost.findMany({
      where: {
        userId: session.id,
        postId: {
          in: filteredNonNullPosts.map((post) => post!.id),
        },
      },
      select: {
        postId: true,
      },
    });
    
    const savedPostIds = new Set(savedPosts.map((p) => p.postId));
    
    // 🔹 Add `isSaved` to each post
    const finalPosts = filteredNonNullPosts.map((post) => ({
      ...post!,
      isSaved: savedPostIds.has(post!.id),
    }));
    
    const signedCollectionCover = collection.coverImage
      ? await generatePresignedViewUrl(extractKeyFromUrl(collection.coverImage))
      : null;
    
    return {
      success: true,
      data: {
        ...collection,
        coverImage: signedCollectionCover,
        posts: finalPosts,
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
    if (
      !postId ||
      typeof postId !== "string"
    ) {
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
  if (!session) {
    return {
      success: false,
      error: { message: "Unauthorized", code: "UNAUTHORIZED" },
    };
  }

  try {
    // Validate input
    if (!collectionId || typeof collectionId !== "string") {
      return {
        success: false,
        error: { message: "Invalid collection ID", code: "INVALID_INPUT" },
      };
    }

    // Fetch collection with ownership check
    const collection = await prisma.collection.findUnique({
      where: {
        id: collectionId,
        userId: session.id,
      },
      include: {
        posts: {
          where: { isDraft: false },
          select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            visibility: true,
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

    // Helper function to extract key and generate signed URL
    const getSignedUrl = async (url: string | null) => {
      if (!url) return null;
      try {
        const key = extractKeyFromUrl(url);
        return await generatePresignedViewUrl(key);
      } catch (error) {
        console.error(`Failed to sign URL: ${url}`, error);
        return null; // Fail gracefully
      }
    };

    // Process all images in parallel
    const [collectionCover, ...postCovers] = await Promise.all([
      getSignedUrl(collection.coverImage),
      ...collection.posts.map((post) => getSignedUrl(post.coverImage)),
    ]);

    // Transform data with signed URLs
    const transformedData = {
      ...collection,
      coverImage: collectionCover,
      posts: collection.posts.map((post, index) => ({
        ...post,
        coverImage: postCovers[index],
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
    // Fetch all collections owned by the user
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
        posts: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Enhance collections with signed cover images
    const enhanced = await Promise.all(
      collections.map(async (col) => {
        let signedCover = null;
        if (col.coverImage) {
          try {
            // Use your existing extractKeyFromUrl function
            const key = extractKeyFromUrl(col.coverImage);
            signedCover = await generatePresignedViewUrl(key);
          } catch (error) {
            console.error("Failed to sign cover image URL:", error);
            // Fallback to original URL if signing fails
            signedCover = col.coverImage;
          }
        }

        return {
          ...col,
          coverImage: signedCover,
          postCount: col.posts.length,
          // Remove posts array if not needed in response
          posts: undefined,
        };
      })
    );

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
    // Validate required fields
    if (!collectionId) {
      throw new Error("Collection ID is required");
    }

    // Check if collection exists
    const existingCollection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!existingCollection) {
      throw new Error("Collection not found");
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
        throw new Error("Failed to process cover image");
      }
    }

    // Validate visibility against enum values
    const validVisibilities = ["PUBLIC", "PRIVATE", "FOLLOWERS"]; // Replace with actual valid values
    if (visibility && !validVisibilities.includes(visibility)) {
      throw new Error("Invalid visibility value");
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

    // Perform the update
    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
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
            message: "Collection not found",
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

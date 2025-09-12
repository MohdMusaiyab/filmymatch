import { NextResponse } from "next/server";
import { unsavePost } from "@/actions/save";

export async function POST(req: Request) {
  try {
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const result = await unsavePost(postId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API /posts/unsave error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

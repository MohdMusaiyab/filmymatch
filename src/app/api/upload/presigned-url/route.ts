// app/api/upload/presigned-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { generatePresignedUrl } from "@/lib/aws-s3";
import { authOptions } from "@/lib/auth-providers";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" ,code: "UNAUTHORIZED",success: false}, { status: 401 });
    }

    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { message: "fileName and fileType are required" ,code: "MISSING_FILE_NAME_OR_FILE_TYPE",success: false},
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/webm",
    ];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { message: "File type not supported" ,code: "FILE_TYPE_NOT_SUPPORTED",success: false},
        { status: 400 }
      );
    }

    const presignedData = await generatePresignedUrl(
      fileName,
      fileType,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      message: "Presigned URL generated successfully",
      data: presignedData,
    }, { status: 200 });
    
  } catch (error) {
    console.error("Presigned URL generation error:", error);
    return NextResponse.json(
      { message: "Internal server error" ,code: "INTERNAL_SERVER_ERROR",success: false},
      { status: 500 }
    );
  }
}

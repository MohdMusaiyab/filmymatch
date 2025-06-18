// // app/api/upload/presigned-url/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { generatePresignedUrl } from "@/lib/aws-s3";
// import { authOptions } from "@/lib/auth-providers";

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { fileName, fileType } = await request.json();

//     if (!fileName || !fileType) {
//       return NextResponse.json(
//         { error: "fileName and fileType are required" },
//         { status: 400 }
//       );
//     }

//     // Validate file type
//     const allowedTypes = [
//       "image/jpeg",
//       "image/jpg",
//       "image/png",
//       "image/gif",
//       "image/webp",
//       "video/mp4",
//       "video/avi",
//       "video/mov",
//       "video/wmv",
//       "video/webm",
//     ];

//     if (!allowedTypes.includes(fileType)) {
//       return NextResponse.json(
//         { error: "File type not supported" },
//         { status: 400 }
//       );
//     }

    
//     const userId = session.user.id || session.user.email; // Fallback to email if ID not available

//     const presignedData = await generatePresignedUrl(
//       fileName,
//       fileType,
//       userId
//     );

//     return NextResponse.json(presignedData);
//   } catch (error) {
//     console.error("Presigned URL generation error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

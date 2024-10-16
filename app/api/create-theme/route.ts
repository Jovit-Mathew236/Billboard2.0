import { NextRequest, NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import sharp from "sharp";
import { db } from "@/lib/firebase/config";
import { s3 } from "@/lib/awsConfig";

export async function POST(request: NextRequest) {
  try {
    const {
      theme_name,
      font,
      primary_color,
      secondary_color,
      accent_color,
      background_color,
      text_color,
      background_image,
      addedBy,
      addedByUid,
    } = await request.json();

    let imageUrl = "";
    if (background_image) {
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(background_image.split(",")[1], "base64");

      // Process image with sharp
      const webpBuffer = await sharp(imageBuffer)
        .webp({ quality: 80 })
        .toBuffer();

      // Upload to S3
      const params = {
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
        Key: `themes/${Date.now()}_${theme_name}.webp`, // Unique key for each theme
        Body: webpBuffer,
        ContentType: "image/webp",
      };

      const uploadResult = await s3.upload(params).promise();
      imageUrl = uploadResult.Location;
    }

    // Save theme details to Firestore
    await setDoc(doc(db, "themes", theme_name), {
      theme_name,
      font,
      primary_color,
      secondary_color,
      accent_color,
      background_color,
      text_color,
      addedBy,
      addedByUid,
      ...(imageUrl && { background_image: imageUrl }),
    });

    return NextResponse.json(
      { message: "Theme created successfully", themeName: theme_name },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating theme:", error);
    return NextResponse.json(
      { message: "Error creating theme" },
      { status: 500 }
    );
  }
}

// Uncomment this section if you need to set a specific size limit for the request body
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: "10mb",
//     },
//   },
// };

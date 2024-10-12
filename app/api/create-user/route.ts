import { NextRequest, NextResponse } from "next/server";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import sharp from "sharp";
import { auth, db } from "@/lib/firebase/config";
import { s3 } from "@/lib/awsConfig";

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, role, image, addedBy, addedByUid } =
      await request.json();

    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    let imageUrl = "";
    if (image) {
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(image.split(",")[1], "base64");

      // Process image with sharp
      const webpBuffer = await sharp(imageBuffer)
        .webp({ quality: 80 })
        .toBuffer();

      // Upload to S3
      const params = {
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
        Key: `users/${user.uid}.webp`,
        Body: webpBuffer,
        ContentType: "image/webp",
      };

      const uploadResult = await s3.upload(params).promise();
      imageUrl = uploadResult.Location;
    }

    // Save user details to Firestore
    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      role,
      addedBy,
      addedByUid,
      ...(imageUrl && { imageUrl }),
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.uid },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

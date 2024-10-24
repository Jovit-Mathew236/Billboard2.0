import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { s3 } from "@/lib/awsConfig";

// GET handler to fetch images
export async function GET() {
  try {
    const imagesQuery = query(
      collection(db, "images"),
      orderBy("uploadedAt", "desc")
    );

    const querySnapshot = await getDocs(imagesQuery);
    const images = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { message: "Images retrieved successfully", images },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      {
        message: "Error fetching images",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST handler to upload image
export async function POST(request: NextRequest) {
  try {
    const { image, addedBy, addedByUid } = await request.json();

    if (!image || !addedBy || !addedByUid) {
      return NextResponse.json(
        { message: "Image, addedBy, and userId are required" },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(image.split(",")[1], "base64");
    const webpBuffer = await sharp(imageBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
      Key: `imagetemp/${addedByUid}-${Date.now()}.webp`,
      Body: webpBuffer,
      ContentType: "image/webp",
    };

    const uploadResult = await s3.upload(params).promise();
    const imageUrl = uploadResult.Location;

    const docRef = await addDoc(collection(db, "images"), {
      imageUrl,
      addedBy,
      addedByUid,
      uploadedAt: new Date().toISOString(),
      s3Key: params.Key, // Store S3 key for later deletion
    });

    return NextResponse.json(
      { message: "Image uploaded successfully", imageUrl, id: docRef.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      {
        message: "Error uploading image",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE handler
export async function DELETE(request: NextRequest) {
  try {
    const { id, s3Key } = await request.json();

    if (!id || !s3Key) {
      return NextResponse.json(
        { message: "Image ID and S3 key are required" },
        { status: 400 }
      );
    }

    // Delete from S3
    await s3
      .deleteObject({
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
        Key: s3Key,
      })
      .promise();

    // Delete from Firestore
    await deleteDoc(doc(db, "images", id));

    return NextResponse.json(
      { message: "Image deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      {
        message: "Error deleting image",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

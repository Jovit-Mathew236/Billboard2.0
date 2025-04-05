import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import {
  collection,
  getDocs,
  query,
  //   orderBy,
  //   deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { s3 } from "@/lib/awsConfig";

// GET handler to fetch background image
export async function GET() {
  try {
    // Get the global settings which should contain the background image URL if set
    // const settingsRef = doc(db, "settings", "global");
    const settingsSnap = await getDocs(query(collection(db, "settings")));

    const settings = settingsSnap.docs.find((doc) => doc.id === "global");
    const backgroundImageUrl = settings?.data()?.backgroundImageUrl || null;

    return NextResponse.json(
      {
        message: "Background image retrieved successfully",
        backgroundImageUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching background image:", error);
    return NextResponse.json(
      {
        message: "Error fetching background image",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST handler to upload background image
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { message: "Image is required" },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(image.split(",")[1], "base64");

    // Process for a 4K display - higher quality
    const webpBuffer = await sharp(imageBuffer)
      .webp({ quality: 90 })
      .toBuffer();

    const fileName = `background-${Date.now()}`;

    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
      Key: `global/${fileName}.webp`,
      Body: webpBuffer,
      ContentType: "image/webp",
    };

    const uploadResult = await s3.upload(params).promise();
    const imageUrl = uploadResult.Location;

    // Update global settings directly
    const settingsRef = doc(db, "settings", "global");
    await setDoc(
      settingsRef,
      {
        backgroundImageUrl: imageUrl,
        backgroundS3Key: params.Key,
      },
      { merge: true }
    );

    return NextResponse.json(
      {
        message: "Background image uploaded successfully",
        backgroundImageUrl: imageUrl,
        backgroundS3Key: params.Key,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading background image:", error);
    return NextResponse.json(
      {
        message: "Error uploading background image",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE handler to remove the background image
export async function DELETE(request: NextRequest) {
  try {
    const { s3Key } = await request.json();

    if (!s3Key) {
      return NextResponse.json(
        { message: "S3 key is required" },
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

    // Update Firestore - remove background image URL
    const settingsRef = doc(db, "settings", "global");
    await setDoc(
      settingsRef,
      {
        backgroundImageUrl: null,
        backgroundS3Key: null,
      },
      { merge: true }
    );

    return NextResponse.json(
      { message: "Background image removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing background image:", error);
    return NextResponse.json(
      {
        message: "Error removing background image",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

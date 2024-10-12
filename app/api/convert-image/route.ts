import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: Request) {
  const { image } = await request.json();

  if (!image) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(image, "base64");
    const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

    const webpBase64 = webpBuffer.toString("base64");
    return NextResponse.json({ image: `data:image/webp;base64,${webpBase64}` });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Error processing image" },
      { status: 500 }
    );
  }
}

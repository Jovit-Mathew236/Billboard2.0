import { NextRequest, NextResponse } from "next/server";
import { errorResponse, HttpError, requireUser } from "@/lib/server/auth";
import { decodeDataUrl, deleteObject, isManagedKey, UPLOAD_PROFILES, UploadProfile, uploadWebp } from "@/lib/server/storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { image, folder } = await request.json();
    if (!(folder in UPLOAD_PROFILES)) throw new HttpError(400, "Unknown upload folder.");

    const result = await uploadWebp(decodeDataUrl(image), folder as UploadProfile, `${user.uid}-${Date.now()}`);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Image upload failed.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireUser(request);
    const { key } = await request.json();
    if (!isManagedKey(key)) throw new HttpError(400, "Invalid file key.");

    await deleteObject(key);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Could not delete the file.");
  }
}

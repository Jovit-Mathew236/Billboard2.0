import { NextRequest, NextResponse } from "next/server";
import { deleteApp, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { firebaseConfig } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { describeError } from "@/lib/firebase/auth";
import { errorResponse, HttpError, requireUser } from "@/lib/server/auth";
import { decodeDataUrl, uploadWebp } from "@/lib/server/storage";

export const runtime = "nodejs";

const ROLES = ["admin", "superadmin", "faculty"];

export async function POST(request: NextRequest) {
  const caller = await requireUser(request).catch((error) => error as Error);
  if (caller instanceof Error) return errorResponse(caller, "Unauthorized");

  const { email, password, username, role, image, addedBy } = await request.json();
  if (!email || !password || !username) return errorResponse(new HttpError(400, "Email, name and password are required."), "");
  if (!ROLES.includes(role)) return errorResponse(new HttpError(400, "Invalid role."), "");

  const provisioning = initializeApp(firebaseConfig, `provisioning-${Date.now()}`);
  try {
    const provisioningAuth = getAuth(provisioning);
    const { user } = await createUserWithEmailAndPassword(provisioningAuth, email, password).catch((error) => {
      throw new HttpError(400, describeError(error));
    });

    const imageUrl = image ? (await uploadWebp(decodeDataUrl(image), "avatar", user.uid)).url : "";

    await setDoc(doc(getFirestore(provisioning), COLLECTIONS.users, user.uid), {
      username,
      email,
      role,
      addedBy: addedBy ?? caller.email ?? "",
      addedByUid: caller.uid,
      createdAt: new Date().toISOString(),
      ...(imageUrl && { imageUrl }),
    });
    await signOut(provisioningAuth);

    return NextResponse.json({ userId: user.uid }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Could not create the user.");
  } finally {
    await deleteApp(provisioning).catch(() => undefined);
  }
}

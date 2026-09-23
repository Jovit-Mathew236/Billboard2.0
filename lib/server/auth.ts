import { NextRequest, NextResponse } from "next/server";

export interface VerifiedUser {
  uid: string;
  email?: string;
  idToken: string;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requireUser(request: NextRequest): Promise<VerifiedUser> {
  const header = request.headers.get("authorization") ?? "";
  const idToken = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!idToken) throw new HttpError(401, "You need to be signed in.");

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    }
  );
  if (!response.ok) throw new HttpError(401, "Your session has expired. Sign in again.");

  const data = await response.json();
  const account = data.users?.[0];
  if (!account?.localId) throw new HttpError(401, "Your session has expired. Sign in again.");
  return { uid: account.localId, email: account.email, idToken };
}

export function errorResponse(error: unknown, fallback: string) {
  if (error instanceof HttpError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  console.error(fallback, error);
  return NextResponse.json(
    { message: error instanceof Error ? error.message : fallback },
    { status: 500 }
  );
}

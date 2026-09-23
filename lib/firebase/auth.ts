import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "./config";

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email.trim(), password);

export const logOut = async () => {
  await signOut(auth);
  window.location.href = "/login";
};

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email.trim());

const AUTH_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "No account found with that email.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Try again in a few minutes.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 8 characters.",
};

export const describeError = (error: unknown, fallback = "Something went wrong.") => {
  if (error instanceof FirebaseError) {
    if (AUTH_MESSAGES[error.code]) return AUTH_MESSAGES[error.code];
    if (error.code === "permission-denied") return "You don't have permission to make this change.";
    if (error.code === "unavailable") return "Can't reach the database. Check your connection.";
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

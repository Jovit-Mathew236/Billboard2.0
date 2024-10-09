import {
  // GoogleAuthProvider,
  // signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  NextOrObserver,
  User,
} from "firebase/auth";

import { auth } from "@/lib/firebase/clientApp";

export function onAuthStateChanged(cb: NextOrObserver<User>) {
  return _onAuthStateChanged(auth, cb);
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing in with email and password", error);
  }
}

// Create a new user with email and password
export async function signUpWithEmail(email: string, password: string) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing up with email and password", error);
  }
}

export async function signOut() {
  try {
    return auth.signOut();
  } catch (error) {
    console.error("Error signing out", error);
  }
}

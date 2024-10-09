"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { firebaseConfig } from "./config";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

export const firebaseApp: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
// export const storage: Storage = getStorage(firebaseApp);

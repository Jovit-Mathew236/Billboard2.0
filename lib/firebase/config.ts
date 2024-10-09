import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, updateProfile, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

const updateUser = (displayName: string) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.error("No user is currently signed in.");
    return;
  }

  updateProfile(currentUser, { displayName })
    .then(() => {
      console.log("Profile updated successfully");
    })
    .catch((error) => {
      console.error("Error updating profile: ", error);
    });
};

export { app, auth, updateUser, db };

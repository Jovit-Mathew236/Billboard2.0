"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase/config"; // Adjust this import path as needed
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/config"; // Import Firestore instance
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions

interface AuthContextType {
  user: User | null;
  username: string | null; // Add username to context
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  username: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null); // State for username
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      setLoading(true); // Start loading
      if (!user) {
        router.push("/login");
      }
      if (user) {
        const userDoc = doc(db, "users", user.uid); // Adjust collection name as needed
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUsername(userData.name || null); // Set username if exists
        } else {
          console.error("No such document!");
        }
        router.push("/admin"); // Redirect after fetching user data
      }

      setLoading(false); // Stop loading
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, username, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

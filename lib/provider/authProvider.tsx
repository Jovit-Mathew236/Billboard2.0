"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { UserRole } from "@/types/display";

interface AuthContextType {
  user: User | null;
  username: string;
  userImage: string | null;
  role: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  username: "",
  userImage: null,
  role: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextType>({
    user: null,
    username: "",
    userImage: null,
    role: null,
    loading: true,
  });

  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setState({ user: null, username: "", userImage: null, role: null, loading: false });
          return;
        }
        const fallbackName = user.displayName || user.email?.split("@")[0] || "User";
        try {
          const snap = await getDoc(doc(db, COLLECTIONS.users, user.uid));
          const profile = snap.data();
          setState({
            user,
            username: profile?.username || fallbackName,
            userImage: profile?.imageUrl || null,
            role: (profile?.role as UserRole) ?? null,
            loading: false,
          });
        } catch {
          setState({ user, username: fallbackName, userImage: null, role: null, loading: false });
        }
      }),
    []
  );

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

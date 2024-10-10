"use client";
import AdminDash from "@/components/madeups/admin/adminDash";
import { auth } from "@/lib/firebase/config";
// import { AuthProvider } from "@/lib/provider/authProvider";
import { onAuthStateChanged } from "firebase/auth";
// import useRouter from "next/router";
import React, { useEffect, useState } from "react";

const Home = () => {
  // const router = useRouter();
  const [uid, setUid] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        console.log(uid);
      } else {
        window.location.href = "/login";
      }
    });
    return unsubscribe;
  }, [uid]);
  return <AdminDash />;
};

export default Home;

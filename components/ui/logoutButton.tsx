"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function LogoutButton() {
  const logout = () => {
    signOut(auth);
    window.location.href = "/";
  };

  return <Button onClick={logout}>Logout</Button>;
}

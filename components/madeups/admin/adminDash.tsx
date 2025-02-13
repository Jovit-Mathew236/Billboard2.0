"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/provider/authProvider";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
// import { people } from "@/lib/constants";
import {
  collection,
  getDocs,
  CollectionReference,
  DocumentData,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { dp } from "@/lib/constants";
import { Power, SwatchBook } from "lucide-react";
import SwipeButton from "@/components/swipe-button";

// Define a type for user data
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  addedBy: string;
  addedByUid: string;
  imageUrl: string;
  // Add other user fields as needed
}

function AdminDash() {
  const { user, username, loading } = useAuth();
  const [usersData, setUsersData] = useState<User[]>([]); // Use the User type for state
  const [themeCount, setThemeCount] = useState<number>(0); // Use the User type for state
  const router = useRouter();

  // Fetch users from Firestore and set state
  const fetchUsers = async () => {
    const usersCollection = collection(
      db,
      "users"
    ) as CollectionReference<DocumentData>;
    const snapshot = await getDocs(usersCollection);
    const usersArray = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
    setUsersData(usersArray); // Update state with users data
  };
  const fetchThemeCount = async () => {
    const usersCollection = collection(
      db,
      "themes"
    ) as CollectionReference<DocumentData>;
    const snapshot = await getCountFromServer(usersCollection);
    const theme_count = snapshot.data().count;
    setThemeCount(theme_count); // Update state with users data
  };

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
    fetchThemeCount();
  }, []);
  console.log(usersData);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (user) {
    return (
      <>
        <div className="flex flex-col justify-evenly h-[70dvh]">
          <h1 className="text-3xl text-primary">
            Welcome 👋
            <br />
            <b className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Mr. {username}
            </b>
            <Image
              src="/pen.png"
              alt="pen"
              width={150}
              height={150}
              className="h-auto w-auto ml-20"
            />
          </h1>

          <div className="flex flex-col gap-[3dvh] w-full py-8 px-6 min-h-4 bg-card/80 rounded-3xl shadow-lg border border-border/50 backdrop-blur-sm">
            <div className="w-full max-w-full flex">
              <div className="flex flex-row w-[30%]">
                <div className="flex flex-row items-center justify-center">
                  <AnimatedTooltip
                    items={usersData.map((user, i) => {
                      return {
                        id: i,
                        name: user.username,
                        designation: user.role,
                        image: user.imageUrl || dp,
                      };
                    })}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                className="font-bold text-muted-foreground w-[40%]"
              >
                Manage Access
              </Button>
              <div className="flex flex-row gap-1 w-[30%] place-content-end">
                <p className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex justify-center items-center shadow-md">
                  <SwatchBook className="text-primary-foreground" />
                </p>
                <p className="w-10 h-10 bg-secondary rounded-full flex justify-center items-center shadow-md">
                  <Power className="text-secondary-foreground" />
                </p>
              </div>
            </div>

            <div>
              <div className="h-full flex flex-row gap-8">
                <div className="flex flex-1 flex-col gap-10">
                  <div className="text-light text-xs leading-3 text-muted-foreground">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                      100{" "}
                      <span className="text-sm text-muted-foreground">hrs</span>
                    </h1>
                    Server up time
                  </div>
                  <div className="text-light text-xs leading-3 text-muted-foreground">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                      {usersData.length}
                    </h1>
                    Users with access
                  </div>
                </div>
                <div className="h-[140px] w-[2px] bg-accent/30"></div>
                <div className="flex flex-1 flex-col gap-10">
                  <div className="text-light text-xs leading-3 text-muted-foreground">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                      Good
                    </h1>
                    Api health status
                  </div>
                  <div className="text-light text-xs leading-3 text-muted-foreground">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                      {themeCount}
                    </h1>
                    Themes Available
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="h-[8px] w-[30%] bg-gradient-to-r from-primary to-primary/80 rounded-full"></div>
              <div className="h-[8px] w-[20%] bg-gradient-to-r from-accent to-accent/80 rounded-full"></div>
              <div className="h-[8px] w-[20%] bg-secondary rounded-full"></div>
              <div className="h-[8px] w-[30%] bg-muted rounded-full"></div>
            </div>
          </div>
          <Button
            className="h-20 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
            onClick={() => {
              router.push("/admin/preview");
            }}
          >
            Active Preview
          </Button>
        </div>

        <SwipeButton
          label="Swipe right for edits --->"
          className="absolute bottom-8 w-[calc(100%-48px)] text-muted-foreground h-20 rounded-full bg-card shadow-lg border border-border/50"
          onSwipeRight={() => router.push("/admin/edit")}
          onSwipeLeft={() => console.log("Swiped left")}
        />
      </>
    );
  }
}
export default AdminDash;

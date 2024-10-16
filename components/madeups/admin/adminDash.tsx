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
          <h1 className="text-3xl text-card-foreground">
            Welcome 👋
            <br />
            <b className="text-4xl text-bold">Mr. {username}</b>
            <Image
              src="/pen.png"
              alt="pen"
              width={150}
              height={150}
              className="h-auto w-auto ml-20"
            />
          </h1>

          <div className="flex flex-col gap-[3dvh] w-full py-8 px-6 min-h-4 bg-white rounded-3xl">
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
                variant={"ghost"}
                className="text-bold text-gray-400 w-[40%]"
              >
                Manage Access
              </Button>
              <div className="flex flex-row gap-1 w-[30%] place-content-end">
                <p className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex justify-center items-center">
                  <SwatchBook color="white" />
                </p>
                <p className="w-10 h-10 bg-black rounded-full flex justify-center items-center">
                  <Power color="white" />
                </p>
              </div>
            </div>

            <div>
              <div className="h-full flex flex-row gap-8">
                <div className="flex flex-1 flex-col gap-10">
                  <div className="text-light text-xs leading-3 text-gray-400">
                    <h1 className="text-3xl text-bold text-black var(--font-sf-ui-display-bold)">
                      100 <span className="text-sm text-gray-400">hrs</span>
                    </h1>
                    Server up time
                  </div>
                  <div className="text-light text-xs leading-3 text-gray-400">
                    <h1 className="text-3xl text-bold text-black var(--font-sf-ui-display-bold)">
                      {usersData.length}{" "}
                      <span className="text-sm text-gray-400"></span>
                    </h1>
                    Users with access
                  </div>
                </div>
                <div className="h-[140px] w-[2px] bg-gray-400"></div>
                <div className="flex flex-1 flex-col gap-10">
                  <div className="text-light text-xs leading-3 text-gray-400">
                    <h1 className="text-3xl text-bold text-black var(--font-sf-ui-display-bold)">
                      Good <span className="text-sm text-gray-400"></span>
                    </h1>
                    Api health status
                  </div>
                  <div className="text-light text-xs leading-3 text-gray-400">
                    <h1 className="text-3xl text-bold text-black var(--font-sf-ui-display-bold)">
                      {themeCount}
                      <span className="text-sm text-gray-400"></span>
                    </h1>
                    Themes Available
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="h-[8px] w-[30%] bg-green-500 rounded-full"></div>
              <div className="h-[8px] w-[20%] bg-teal-300 rounded-full"></div>
              <div className="h-[8px] w-[20%] bg-gray-400 rounded-full"></div>
              <div className="h-[8px] w-[30%] bg-gray-800 rounded-full"></div>
            </div>
          </div>
          <Button
            className="h-20 rounded-full"
            onClick={() => {
              router.push("/admin/preview");
            }}
          >
            Active Preview
          </Button>
        </div>

        <SwipeButton
          label="Swipe right for edits ---&gt;"
          className="absolute bottom-8 w-[calc(100%-48px)] text-gray-400 h-20 rounded-full"
          onSwipeRight={() => router.push("/admin/edit")}
          onSwipeLeft={() => console.log("Swiped left")}
        />
      </>
    );
  }
}
export default AdminDash;

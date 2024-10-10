"use client";
"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/provider/authProvider";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { people } from "@/lib/constants";

function AdminDash() {
  const { user, username, loading } = useAuth();
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const router = useRouter();

  const SWIPE_THRESHOLD = 100; // Minimum distance for a swipe to be valid

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsSwiping(true);
    setStartX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsSwiping(true);
    setStartX(e.touches[0].clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isSwiping) {
      const distance = e.clientX - startX;
      if (Math.abs(distance) > SWIPE_THRESHOLD) {
        if (distance > 0) {
          router.push("/admin/edit");
        } else {
          console.log("Swiped left");
        }
      }
      setIsSwiping(false);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isSwiping) {
      const distance = e.changedTouches[0].clientX - startX;
      if (Math.abs(distance) > SWIPE_THRESHOLD) {
        if (distance > 0) {
          router.push("/admin/edit");
        } else {
          console.log("Swiped left");
        }
      }
      setIsSwiping(false);
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  if (user) {
    return (
      <>
        <div className="flex flex-col justify-evenly h-[70dvh]">
          <h1 className="text-3xl">
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
                  <AnimatedTooltip items={people} />
                </div>
              </div>
              <Button
                variant={"ghost"}
                className="text-bold text-gray-400 w-[40%]"
              >
                Manage Access
              </Button>
              <div className="flex flex-row gap-1 w-[30%] place-content-end">
                <p className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full"></p>
                <p className="w-10 h-10 bg-black rounded-full"></p>
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
                      5 <span className="text-sm text-gray-400"></span>
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
                      7 <span className="text-sm text-gray-400"></span>
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
          <Button className="h-20 rounded-full">Active Preview</Button>
        </div>
        <Button
          className="absolute bottom-8 w-[calc(100%-48px)] text-gray-400 h-20 rounded-full"
          variant={"secondary"}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsSwiping(false)} // reset when leaving
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          swipe right for edits ---&gt;
        </Button>
      </>
    );
  }
}

export default AdminDash;

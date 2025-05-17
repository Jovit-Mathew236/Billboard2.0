"use client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import SwipeButton from "@/components/swipe-button";
import { useRouter } from "next/navigation";
import { CreateTheme } from "./create-theme";
const Preview = () => {
  const router = useRouter();
  return (
    <>
      <div
        className="relative w-full"
        style={{
          padding: "97% 52%",
          margin: "-24px -7px",
          transform: "scale(0.9)",
        }}
      >
        {" "}
        {/* 9:16 aspect ratio */}
        <iframe
          src="https://billboard2.vercel.app/display" // Replace with the URL you want to load
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            border: "none",
            borderRadius: "30px",
          }}
          title="Website Preview"
        />
      </div>

      <div className="flex justify-between gap-1 absolute bottom-8  w-[calc(100%-48px)]">
        <SwipeButton
          label="Swipe right for edits ---&gt;"
          className="w-[75%] text-gray-400 h-16 rounded-full"
          onSwipeRight={() => router.push("/admin/edit")}
          onSwipeLeft={() => console.log("Swiped left")}
        />

        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="w-16 text-white bg-black h-16 rounded-full"
              variant={"secondary"}
              //    onMouseDown={handleMouseDown}
              //    onMouseUp={handleMouseUp}
              //    onMouseLeave={() => setIsSwiping(false)} // reset when leaving
              //    onTouchStart={handleTouchStart}
              //    onTouchEnd={handleTouchEnd}
            >
              <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-10/12 text-black rounded-lg bg-white overflow-y-scroll max-h-[90dvh]">
            <CreateTheme />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Preview;

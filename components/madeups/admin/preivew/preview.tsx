"use client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import SwipeButton from "@/components/swipe-button";
import { useRouter } from "next/navigation";
import { CreateTheme } from "./create-theme"; // Assuming this is correctly defined

const Preview = () => {
  const router = useRouter();

  // Define the native resolution of your rotated 4K display
  const nativeDisplayWidth = 3840; // After 270deg rotation of a 3840x2160 display
  const nativeDisplayHeight = 2160;

  // Define the desired width of your preview in pixels
  const previewWidth = 600; // Adjust this to your desired preview size
  const scaleFactor = previewWidth / nativeDisplayWidth;

  return (
    <>
      {/* This div will define the final visible size and aspect ratio of the preview area */}
      <div
        className="relative mx-auto" // Use mx-auto for centering if needed
        style={{
          width: `${previewWidth}px`,
          // Height is calculated to maintain 9:16 aspect ratio based on previewWidth
          height: `${
            (previewWidth * nativeDisplayHeight) / nativeDisplayWidth
          }px`,
          top: "150px", // Adjust this to move the preview down as needed
          right: "110px", // Adjust this to move the preview right as needed
          overflow: "hidden", // Important to clip the scaled iframe
          border: "1px solid #ccc", // Optional: to see the preview boundary
          borderRadius: "20px", // Optional: phone-like rounded corners
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)", // Optional: nice shadow
          transform: "rotate(90deg)",
        }}
      >
        <iframe
          className="-rotate-90"
          src="https://billboard2.vercel.app/display" // Or your local /display path
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${nativeDisplayWidth}px`,
            height: `${nativeDisplayHeight}px`,
            border: "none",
            transform: `scale(${scaleFactor})`,
            transformOrigin: "top left", // Crucial for correct scaling
          }}
          title="Billboard Preview"
          // sandbox="allow-scripts allow-same-origin" // Good for security, might be needed if display has complex JS
        />
      </div>

      <div className="flex justify-between gap-1 absolute bottom-8 w-[calc(100%-48px)] left-1/2 -translate-x-1/2 px-6 md:px-0">
        <SwipeButton
          label="Swipe right for edits --->"
          className="w-[75%] text-gray-400 h-16 rounded-full"
          onSwipeRight={() => router.push("/admin/edit")}
          onSwipeLeft={() => console.log("Swiped left")}
        />

        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="w-16 text-white bg-black h-16 rounded-full"
              variant={"secondary"}
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

import { Button } from "@/components/ui/button";
import React from "react";

const Preview = () => {
  return (
    <>
      <div className="w-full h-[70vh] rounded-lg">
        <iframe
          src="https://billboardsjcetapp.netlify.app" // Replace with the URL you want to load
          style={{ height: "100%", width: "100%", border: "none" }}
          title="Website Preview"
        />
      </div>
      <Button
        className="absolute bottom-8 w-[calc(100%-48px)] text-gray-400 h-20 rounded-full"
        variant={"secondary"}
        //    onMouseDown={handleMouseDown}
        //    onMouseUp={handleMouseUp}
        //    onMouseLeave={() => setIsSwiping(false)} // reset when leaving
        //    onTouchStart={handleTouchStart}
        //    onTouchEnd={handleTouchEnd}
      >
        swipe right for edits ---&gt;
      </Button>
    </>
  );
};

export default Preview;

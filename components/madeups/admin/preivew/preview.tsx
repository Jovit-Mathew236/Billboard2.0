"use client";
import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SwipeButton from "@/components/swipe-button";
import { useRouter } from "next/navigation";
interface Font {
  family: string;
  variants: string[];
  subsets: string[];
}

const Preview = () => {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const response = await fetch("/api/webfonts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch fonts");
        }
        const data = await response.json();
        setFonts(data.font.items);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
        console.log(error);
      }
    };

    fetchFonts();
  }, [error]);
  return (
    <>
      <div
        className="relative w-full"
        style={{
          padding: "97% 52%",
          margin: "-24px -7px",
          transform: "scale(0.95)",
        }}
      >
        {" "}
        {/* 9:16 aspect ratio */}
        <iframe
          src="https://billboardsjcetapp.netlify.app" // Replace with the URL you want to load
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
          <DialogContent className="sm:max-w-[425px] w-10/12 text-black rounded-lg">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  defaultValue="Pedro Duarte"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  defaultValue="@peduarte"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="font" className="text-right">
                  Font
                </Label>
                <Select>
                  <SelectTrigger className="">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {fonts.map((font, i) => (
                      <SelectItem key={i} value={font.family}>
                        {font.family}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Preview;

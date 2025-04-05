"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ContentBlock } from "@/types/blocks";
import { renderBlock } from "@/lib/utils/renderBlock";
import { cn } from "@/lib/utils";
import { doc } from "firebase/firestore";

export default function DisplayLayout() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [settings, setSettings] = useState({
    backgroundColor: "#000000",
    headerText: "Department of",
    title: "ELECTRONICS & COMPUTER ENGINEERING",
    backgroundImageUrl: "",
  });

  // Fetch blocks from Firebase
  useEffect(() => {
    const blocksRef = collection(db, "blocks");
    const q = query(blocksRef, orderBy("position"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ContentBlock[];
      setBlocks(data);
    });

    return () => unsubscribe();
  }, []);

  // Add effect to fetch settings
  useEffect(() => {
    const settingsRef = doc(db, "settings", "global");
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        setSettings(
          doc.data() as {
            backgroundColor: string;
            headerText: string;
            title: string;
            backgroundImageUrl: string;
          }
        );
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      className="h-screen w-screen display-layout"
      style={{
        backgroundColor: settings.backgroundColor,
        backgroundImage: settings.backgroundImageUrl
          ? `url(${settings.backgroundImageUrl})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Optimized container for 4K (3840×2160 in portrait mode) */}
      <div className="w-full h-full max-w-[2160px] max-h-[3840px] flex flex-col">
        {/* Semi-transparent overlay for better text contrast */}
        {settings.backgroundImageUrl && (
          <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none" />
        )}

        {/* Enhanced header section for 4K */}
        <div className="text-center py-12 relative z-10">
          <p className="text-6xl font-light text-white/90 mb-4">
            {settings.headerText}
          </p>
          <h1 className="text-8xl font-bold text-white whitespace-pre-line leading-tight tracking-tight">
            {settings.title}
          </h1>
        </div>

        {/* Optimized content grid for 4K */}
        <div className="grid grid-cols-12 gap-10 px-12 pb-16 relative z-10">
          {blocks.map((block) => (
            <div
              key={block.id}
              className={cn(
                "rounded-lg shadow-2xl overflow-hidden",
                `col-span-${block.width}`
              )}
              style={{
                backgroundColor: block.backgroundColor || "#ffffff",
                color: block.textColor || "#000000",
                // Enhanced scaling for 4K display
                height: `${Math.round(block.height * 2.2)}px`,
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="p-10 flex-1 overflow-auto">
                {/* Larger text for 4K display */}
                <div className="text-5xl font-medium h-full w-full">
                  {renderBlock(block)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

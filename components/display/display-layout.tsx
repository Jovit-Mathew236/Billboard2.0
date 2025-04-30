"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ContentBlock } from "@/types/blocks";
import { renderBlock } from "@/lib/utils/renderBlock";
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
    const q = query(blocksRef, orderBy("position", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ContentBlock[];

      // Add a secondary sort to handle any blocks with undefined or duplicate positions
      data = data.sort((a, b) => {
        // First sort by position
        const posA =
          a.position !== undefined ? a.position : Number.MAX_SAFE_INTEGER;
        const posB =
          b.position !== undefined ? b.position : Number.MAX_SAFE_INTEGER;
        const posDiff = posA - posB;

        // If positions are the same, sort by id
        return posDiff !== 0 ? posDiff : a.id.localeCompare(b.id);
      });

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
        transform: "rotate(180deg)",
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
        <div className="flex-1 px-12 pb-16 relative z-10">
          <div
            className="grid w-full h-full"
            style={{
              gridTemplateColumns: "repeat(12, 1fr)",
              gridTemplateRows: "repeat(12, 1fr)",
              gap: "2rem",
            }}
          >
            {blocks.map((block) => {
              // Calculate grid span based on block width (1-12)
              const colSpan = Math.min(Math.max(block.width || 6, 1), 12);

              // Calculate row span based on block height
              // Normalize height to a 1-12 scale (assuming max height around 600px)
              const heightValue = block.height || 200;
              const rowSpan = Math.min(
                Math.max(Math.ceil(heightValue / 50), 1),
                12
              );

              // Define styles for this specific block
              const blockStyle: React.CSSProperties = {
                backgroundColor: block.backgroundColor || "#ffffff",
                color: block.textColor || "#000000",
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(255,255,255,0.1)",
              };

              return (
                <div
                  key={block.id}
                  className="rounded-lg shadow-2xl overflow-hidden"
                  style={blockStyle}
                >
                  <div className="p-10 flex-1 overflow-auto">
                    {/* Larger text for 4K display */}
                    <div className="text-5xl font-medium h-full w-full">
                      {renderBlock(block)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

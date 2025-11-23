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
      className="h-screen w-screen display-layout overflow-hidden"
      style={{
        backgroundColor: settings.backgroundColor,
        backgroundImage: settings.backgroundImageUrl
          ? `url(${settings.backgroundImageUrl})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transform: "rotate(270deg)",
        transformOrigin: "center center",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: "auto",
        width: "100vh",
        height: "100vw",
      }}
    >
      {/* Main container optimized for 4K portrait display */}
      <div className="w-full h-full flex flex-col p-6 relative">
        {/* Semi-transparent overlay for better text contrast */}
        {settings.backgroundImageUrl && (
          <div className="absolute inset-0 bg-black/30 pointer-events-none backdrop-blur-[1px]" />
        )}

        {/* Header section - compact and professional */}
        <div className="text-center relative z-10 mb-4 shrink-0">
          <p className="text-4xl font-light text-white/90 mb-2 drop-shadow-lg">
            {settings.headerText}
          </p>
          <h1 className="text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-xl">
            {settings.title}
          </h1>
        </div>

        {/* Dynamic content grid - auto-flow with proper spacing */}
        <div className="flex-1 relative z-10 min-h-0">
          <div
            className="w-full h-full grid auto-rows-fr"
            style={{
              gridTemplateColumns: "repeat(12, 1fr)",
              gap: "1rem",
              gridAutoFlow: "dense",
            }}
          >
            {blocks.map((block) => {
              // Ensure valid column span (1-12)
              const colSpan = Math.min(Math.max(block.width || 4, 1), 12);

              // Calculate row span based on height with better scaling
              // Height is in pixels, we convert to grid rows (each row ~80px on 4K)
              const heightValue = block.height || 200;
              const rowSpan = Math.min(Math.max(Math.ceil(heightValue / 80), 1), 8);

              return (
                <div
                  key={block.id}
                  className="rounded-2xl shadow-xl overflow-hidden border border-white/10 backdrop-blur-sm"
                  style={{
                    backgroundColor: block.backgroundColor || "#ffffff",
                    color: block.textColor || "#000000",
                    gridColumn: `span ${colSpan}`,
                    gridRow: `span ${rowSpan}`,
                    minHeight: 0,
                    minWidth: 0,
                  }}
                >
                  <div className="w-full h-full p-4 overflow-hidden flex flex-col">
                    {renderBlock(block)}
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

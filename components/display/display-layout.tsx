"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ContentBlock } from "@/types/blocks";
import { renderBlock } from "@/lib/utils/renderBlock"; // We'll create this
import { cn } from "@/lib/utils";
import { doc } from "firebase/firestore";

export default function DisplayLayout() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [settings, setSettings] = useState({
    backgroundColor: "#000000",
    headerText: "Department of",
    title: "ELECTRONICS & COMPUTER ENGINEERING",
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
      console.log(data);

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
          }
        );
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      className="h-screen w-screen p-5"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <div className="mx-auto aspect-[9/16] h-full w-full max-w-[720px]">
        <div className="flex h-full flex-col p-4">
          <div className="text-center">
            <p className="text-lg">{settings.headerText}</p>
            <h1 className="mb-8 text-3xl font-bold leading-tight whitespace-pre-line">
              {settings.title}
            </h1>
          </div>

          <div className="grid h-[calc(100%-200px)] grid-cols-12 gap-4">
            {blocks.map((block) => (
              <div
                key={block.id}
                className={cn(
                  "rounded-3xl overflow-hidden",
                  `col-span-${block.width}`
                )}
                style={{
                  height: `${block.height}px`,
                  backgroundColor: block.backgroundColor || "#ffffff",
                  color: block.textColor || "#000000",
                }}
              >
                {renderBlock(block)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

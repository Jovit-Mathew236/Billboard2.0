"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { cn } from "@/lib/utils";

interface Faculty {
  id: string;
  name: string;
  specializedIn: string;
}

export default function FlipableFacultySection() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Dynamic items per page based on total faculty count
  const getItemsPerPage = (totalCount: number) => {
    console.log(totalCount);

    if (totalCount <= 10) {
      return totalCount; // Show all if 10 or less
    }
    // For more than 10, show ~half per page (round up)
    return Math.ceil(totalCount / 2);
  };

  const ITEMS_PER_PAGE = getItemsPerPage(faculty.length);
  const FLIP_INTERVAL = 10000; // 10 seconds

  // Fetch faculty data
  useEffect(() => {
    const facultyRef = collection(db, "fields");
    const q = query(facultyRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        specializedIn: doc.data().specializedIn,
      }));
      setFaculty(data);
    });

    return () => unsubscribe();
  }, []);

  // Auto-flip pages
  useEffect(() => {
    if (faculty.length === 0) return;

    const itemsPerPage = getItemsPerPage(faculty.length);
    const totalPages = Math.ceil(faculty.length / itemsPerPage);
    if (totalPages <= 1) return; // No need to flip if only one page

    const interval = setInterval(() => {
      setIsFlipping(true);

      setTimeout(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
        setIsFlipping(false);
      }, 600); // Match flip animation duration
    }, FLIP_INTERVAL);

    return () => clearInterval(interval);
  }, [faculty.length]);

  // Calculate current page items
  const totalPages = Math.ceil(faculty.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentPageFaculty = faculty.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Determine grid layout based on number of items
  const getGridColumns = (itemCount: number) => {
    if (itemCount <= 4) return "grid-cols-1";
    if (itemCount <= 8) return "grid-cols-2";
    return "grid-cols-3";
  };

  const gridCols = getGridColumns(currentPageFaculty.length);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-3xl font-bold truncate">Faculty</h3>
        {totalPages > 1 && (
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  idx === currentPage ? "bg-white w-8" : "bg-white/40 w-2"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Flipable Container */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          perspective: "1500px",
        }}
      >
        <div
          className={cn(
            "h-full grid gap-2.5 transition-transform duration-600 ease-in-out",
            gridCols
          )}
          style={{
            transform: isFlipping ? "rotateY(90deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
            opacity: isFlipping ? 0 : 1,
          }}
        >
          {currentPageFaculty.map((member, idx) => (
            <div
              key={member.id}
              className={cn(
                "p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10",
                "hover:bg-white/10 transition-all duration-300 flex flex-col justify-center",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{
                animationDelay: `${idx * 50}ms`,
                animationDuration: "500ms",
                animationFillMode: "both",
              }}
            >
              <h4 className="text-xl font-semibold mb-2 truncate leading-tight">
                {member.name}
              </h4>
              <span className="inline-block rounded-full bg-white px-3 py-1 text-base font-medium text-black shadow-md w-fit truncate max-w-full">
                {member.specializedIn}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Page Counter */}
      {totalPages > 1 && (
        <div className="text-center mt-2 text-lg text-white/70 shrink-0 font-medium">
          {currentPage + 1} / {totalPages}
        </div>
      )}
    </div>
  );
}

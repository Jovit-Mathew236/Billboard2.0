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

export default function FacultySection() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Faculty[]>([]);
  const [fadeState, setFadeState] = useState("fade-in");

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
      setCurrentGroup(data.slice(0, 5));
    });

    return () => unsubscribe();
  }, []);

  // Rotate faculty members
  useEffect(() => {
    if (faculty.length === 0) return;

    const interval = setInterval(() => {
      setFadeState("fade-out");
      setTimeout(() => {
        const currentIndex = faculty.findIndex(
          (f) => f.id === currentGroup[0]?.id
        );
        const nextIndex = (currentIndex + 5) % faculty.length;
        const nextGroup = faculty.slice(nextIndex, nextIndex + 5);
        setCurrentGroup(nextGroup.length < 5 ? faculty.slice(0, 5) : nextGroup);
        setFadeState("fade-in");
      }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, [faculty, currentGroup]);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-3xl font-bold mb-4 shrink-0">Faculty</h3>
      <div className="flex-1 overflow-auto space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {currentGroup.map((member) => (
          <div
            key={member.id}
            className={cn(
              "transition-opacity duration-1000 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10",
              fadeState === "fade-in" ? "opacity-100" : "opacity-0"
            )}
          >
            <h4 className="text-2xl font-semibold mb-2 truncate">
              {member.name}
            </h4>
            <span className="inline-block rounded-full bg-white px-4 py-1.5 text-lg font-medium text-black shadow-md">
              {member.specializedIn}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";
import SwipeButton from "@/components/swipe-button";
import React, { useEffect, useRef, useState } from "react";
import { createSwapy } from "swapy";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTheme } from "./create-box";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const SWAPY_POSITIONS_KEY = "swapyPositions";

const EditDashboard = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const swapyRef = useRef<any>(null);
  // const [isSaved, setIsSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Store initial positions for reset functionality
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialPositionsRef = useRef<any>(null);

  // Save positions to localStorage
  const savePositions = () => {
    if (swapyRef.current) {
      try {
        // Get current positions using the correct method
        const currentItems =
          containerRef.current?.querySelectorAll("[data-swapy-item]");
        const positions: Record<string, string> = {};

        currentItems?.forEach((item) => {
          const itemId = item.getAttribute("data-swapy-item");
          const slotElement = item.closest("[data-swapy-slot]");
          const slotId = slotElement?.getAttribute("data-swapy-slot");
          if (itemId && slotId) {
            positions[itemId] = slotId;
          }
        });

        localStorage.setItem(SWAPY_POSITIONS_KEY, JSON.stringify(positions));
        // setIsSaved(true);
        setHasChanges(false);
        // Reset the saved message after 2 seconds
        // setTimeout(() => setIsSaved(false), 2000);
      } catch (error) {
        console.error("Failed to save positions:", error);
      }
    }
  };

  // Load positions from localStorage
  const loadPositions = () => {
    const savedPositions = localStorage.getItem(SWAPY_POSITIONS_KEY);
    if (savedPositions) {
      try {
        return JSON.parse(savedPositions);
      } catch (error) {
        console.error("Failed to parse saved positions:", error);
        return null;
      }
    }
    return null;
  };

  // Reset to default positions
  const resetPositions = () => {
    if (swapyRef.current && initialPositionsRef.current) {
      try {
        // First disable the current instance
        swapyRef.current.enable(false);
        swapyRef.current = null;

        // Reset DOM to initial state
        const container = containerRef.current;
        if (container) {
          Object.entries(initialPositionsRef.current).forEach(
            ([itemId, slotId]) => {
              const item = container.querySelector(
                `[data-swapy-item="${itemId}"]`
              );
              const slot = container.querySelector(
                `[data-swapy-slot="${slotId}"]`
              );
              if (item && slot) {
                const parent = item.closest("[data-swapy-slot]");
                if (parent !== slot) {
                  slot.appendChild(
                    item.parentElement?.removeChild(item) || item
                  );
                }
              }
            }
          );
        }

        // Reinitialize Swapy
        if (containerRef.current) {
          swapyRef.current = createSwapy(containerRef.current, {
            animation: "dynamic",
          });
          swapyRef.current.enable(true);
        }

        localStorage.removeItem(SWAPY_POSITIONS_KEY);
        setHasChanges(false);
        // setIsSaved(false);
      } catch (error) {
        console.error("Failed to reset positions:", error);
      }
    }
  };

  useEffect(() => {
    if (containerRef.current && !swapyRef.current) {
      try {
        // Store initial positions before initializing Swapy
        const initialItems =
          containerRef.current.querySelectorAll("[data-swapy-item]");
        const initialPositions: Record<string, string> = {};
        initialItems.forEach((item) => {
          const itemId = item.getAttribute("data-swapy-item");
          const slotElement = item.closest("[data-swapy-slot]");
          const slotId = slotElement?.getAttribute("data-swapy-slot");
          if (itemId && slotId) {
            initialPositions[itemId] = slotId;
          }
        });
        initialPositionsRef.current = initialPositions;

        // Initialize Swapy
        swapyRef.current = createSwapy(containerRef.current, {
          animation: "dynamic",
        });

        // Add change detection using DOM events
        const handleDragStart = () => {
          setHasChanges(true);
          // setIsSaved(false);
        };

        containerRef.current.addEventListener("mousedown", handleDragStart);
        containerRef.current.addEventListener("touchstart", handleDragStart);

        // Load saved positions
        const savedPositions = loadPositions();
        if (savedPositions) {
          Object.entries(savedPositions).forEach(([itemId, slotId]) => {
            const item = containerRef.current?.querySelector(
              `[data-swapy-item="${itemId}"]`
            );
            const slot = containerRef.current?.querySelector(
              `[data-swapy-slot="${slotId}"]`
            );
            if (item && slot) {
              const parent = item.closest("[data-swapy-slot]");
              if (parent !== slot) {
                slot.appendChild(item.parentElement?.removeChild(item) || item);
              }
            }
          });
        }

        // Enable Swapy
        swapyRef.current.enable(true);

        // Cleanup function
        return () => {
          if (containerRef.current) {
            containerRef.current.removeEventListener(
              "mousedown",
              handleDragStart
            );
            // eslint-disable-next-line react-hooks/exhaustive-deps
            containerRef.current.removeEventListener(
              "touchstart",
              handleDragStart
            );
          }
          if (swapyRef.current) {
            swapyRef.current.enable(false);
            swapyRef.current = null;
          }
        };
      } catch (error) {
        console.error("Failed to initialize Swapy:", error);
      }
    }
  }, []);

  return (
    <>
      {/* Control buttons */}
      <div className="mb-4 flex gap-4 items-center">
        <button
          onClick={savePositions}
          disabled={!hasChanges}
          className={`px-4 py-2 rounded ${
            hasChanges
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Save Layout
        </button>

        <button
          onClick={resetPositions}
          className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
        >
          Reset Layout
        </button>

        {/* {isSaved && (
          <span className="text-green-500 ml-2">
            Layout saved successfully!
          </span>
        )} */}
      </div>

      {/* Grid layout */}
      <div
        className={`container grid gap-4 grid-cols-2 grid-rows-2`}
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div className="section-1" data-swapy-slot="slot1">
          <div
            className="bg-white shadow rounded content h-full p-4 text-primary"
            data-swapy-item="item1"
          >
            Section 1
          </div>
        </div>

        <div className="section-2" data-swapy-slot="slot2">
          <div
            className="bg-white shadow rounded content h-full p-4 text-primary"
            data-swapy-item="item2"
          >
            Section 2
          </div>
        </div>

        <div className="section-3" data-swapy-slot="slot3">
          <div
            className="bg-white shadow rounded content h-full p-4 text-primary"
            data-swapy-item="item3"
          >
            Section 3
          </div>
        </div>

        <div className="section-4" data-swapy-slot="slot4">
          <div
            className="bg-white shadow rounded content h-full p-4 text-primary"
            data-swapy-item="item4"
          >
            Section 4
          </div>
        </div>
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

export default EditDashboard;

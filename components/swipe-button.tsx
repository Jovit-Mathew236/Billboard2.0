"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";

interface SwipeButtonProps {
  onSwipeRight: () => void;
  onSwipeLeft?: () => void;
  label: string;
  className?: string;
}

const SwipeButton: React.FC<SwipeButtonProps> = ({
  onSwipeRight,
  onSwipeLeft,
  label,
  className,
}) => {
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const SWIPE_THRESHOLD = 100;
  //   const router = useRouter();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsSwiping(true);
    setStartX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsSwiping(true);
    setStartX(e.touches[0].clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isSwiping) {
      const distance = e.clientX - startX;
      if (Math.abs(distance) > SWIPE_THRESHOLD) {
        if (distance > 0) {
          onSwipeRight();
        } else if (onSwipeLeft) {
          onSwipeLeft();
        }
      }
      setIsSwiping(false);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isSwiping) {
      const distance = e.changedTouches[0].clientX - startX;
      if (Math.abs(distance) > SWIPE_THRESHOLD) {
        if (distance > 0) {
          onSwipeRight();
        } else if (onSwipeLeft) {
          onSwipeLeft();
        }
      }
      setIsSwiping(false);
    }
  };

  return (
    <Button
      className={className}
      variant={"secondary"}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsSwiping(false)} // reset when leaving
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {label}
    </Button>
  );
};

export default SwipeButton;

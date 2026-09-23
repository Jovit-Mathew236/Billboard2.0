"use client";

import { useEffect } from "react";

const KEYBOARD_THRESHOLD = 120;
const EDITABLE = "input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=button]):not([type=submit]), textarea, select, [contenteditable=true]";

export function KeyboardInset() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
        const open = inset > KEYBOARD_THRESHOLD;
        root.style.setProperty("--keyboard-inset", `${open ? inset : 0}px`);
        root.style.setProperty("--visual-height", `${viewport.height}px`);
        root.dataset.keyboard = open ? "open" : "closed";
      });
    };

    const revealFocused = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.matches?.(EDITABLE)) return;
      window.setTimeout(() => target.scrollIntoView({ block: "center", behavior: "smooth" }), 320);
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    document.addEventListener("focusin", revealFocused);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      document.removeEventListener("focusin", revealFocused);
    };
  }, []);

  return null;
}

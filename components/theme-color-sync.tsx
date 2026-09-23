"use client";

import { useEffect } from "react";

export const THEME_COLORS = {
  light: "#f8f8fc",
  dark: "#0f0d17",
  splash: "#f1f1f1",
} as const;

const resolveColor = (root: HTMLElement) => {
  if (root.dataset.splash === "on") return THEME_COLORS.splash;
  return root.classList.contains("dark") ? THEME_COLORS.dark : THEME_COLORS.light;
};

export function ThemeColorSync() {
  useEffect(() => {
    const root = document.documentElement;
    document.querySelectorAll('meta[name="theme-color"]').forEach((node) => node.remove());
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);

    const apply = () => {
      const color = resolveColor(root);
      if (meta.content !== color) meta.content = color;
      root.style.backgroundColor = color;
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-splash"] });
    return () => {
      observer.disconnect();
      meta.remove();
    };
  }, []);

  return null;
}

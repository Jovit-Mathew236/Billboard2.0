"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DisplayRegion, EDITOR_MESSAGE, isDisplayRegion, REGION_LABELS } from "@/lib/display/regions";

interface EditModeState {
  enabled: boolean;
  active: DisplayRegion | null;
}

const EditModeContext = createContext<EditModeState>({ enabled: false, active: null });

export function useEditModeState(): EditModeState {
  const [state, setState] = useState<EditModeState>({ enabled: false, active: null });

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") !== "edit" || window.parent === window) return;
    setState({ enabled: true, active: null });
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== EDITOR_MESSAGE.highlight) return;
      setState({ enabled: true, active: isDisplayRegion(event.data.region) ? event.data.region : null });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return state;
}

export const EditModeProvider = EditModeContext.Provider;

export function EditHotspot({ region }: { region: DisplayRegion }) {
  const { enabled, active } = useContext(EditModeContext);
  if (!enabled) return null;

  const select = () =>
    window.parent.postMessage({ type: EDITOR_MESSAGE.select, region }, window.location.origin);

  return (
    <button
      type="button"
      onClick={select}
      className={`edit-hotspot${active === region ? " is-active" : ""}`}
      aria-label={`Edit ${REGION_LABELS[region]}`}
    >
      <span className="edit-hotspot-label">{REGION_LABELS[region]}</span>
    </button>
  );
}

"use client";

import { ComponentType, useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  FlaskConical,
  CloudSun,
  GraduationCap,
  Images,
  LucideIcon,
  MousePointerClick,
  Newspaper,
  Settings2,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { DisplayRegion, EDITOR_MESSAGE, isDisplayRegion, REGION_LABELS } from "@/lib/display/regions";
import { EmbeddedProvider } from "../embedded";
import { LivePreview } from "../live-preview";
import { PageHeader } from "../page-header";
import { BatchManager } from "./batch-manager";
import { Branding } from "./branding";
import { FacultyManager } from "./faculty-manager";
import { GalleryManager } from "./gallery-manager";
import { LabManager } from "./lab-manager";
import { StaffManager } from "./staff-manager";

interface RegionConfig {
  icon: LucideIcon;
  hint: string;
  editor?: ComponentType;
}

const REGIONS: Record<DisplayRegion, RegionConfig> = {
  weather: { icon: CloudSun, hint: "Updates automatically from the weather service." },
  branding: { icon: Settings2, hint: "Logo, department name and background.", editor: Branding },
  staff: { icon: UsersRound, hint: "The row of staff numbers.", editor: StaffManager },
  faculty: { icon: GraduationCap, hint: "Names and qualifications in the white card.", editor: FacultyManager },
  labs: { icon: FlaskConical, hint: "Lab pages shown after the faculty list.", editor: LabManager },
  gallery: { icon: Images, hint: "Photos rotating in the right column.", editor: GalleryManager },
  batches: { icon: TrendingUp, hint: "Students, placements and higher studies.", editor: BatchManager },
  news: { icon: Newspaper, hint: "Latest headlines, refreshed every 5 minutes automatically." },
};

const ORDER: DisplayRegion[] = ["branding", "staff", "faculty", "labs", "gallery", "batches", "weather", "news"];

function RegionPicker({ onSelect }: { onSelect: (region: DisplayRegion) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {ORDER.map((region) => {
        const { icon: Icon, hint, editor } = REGIONS[region];
        return (
          <button
            key={region}
            type="button"
            onClick={() => onSelect(region)}
            className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all [--outer-padding:0.75rem] [--outer-radius:var(--radius-xl)] hover:border-primary/40 hover:bg-accent/40 active:scale-[0.98]"
          >
            <span className="rounded-inner flex h-9 w-9 shrink-0 items-center justify-center bg-accent text-accent-foreground">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-medium">
                {REGION_LABELS[region]}
                {!editor && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Auto</span>}
              </span>
              <span className="block truncate text-xs text-muted-foreground">{hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RegionEditor({ region }: { region: DisplayRegion }) {
  const { editor: Editor, icon: Icon, hint } = REGIONS[region];
  if (!Editor) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center">
        <Icon className="mb-3 h-6 w-6 text-muted-foreground" />
        <p className="font-medium">{REGION_LABELS[region]}</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{hint} Nothing to edit here.</p>
      </div>
    );
  }
  return (
    <EmbeddedProvider value>
      <Editor />
    </EmbeddedProvider>
  );
}

export function VisualEditor() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [region, setRegion] = useState<DisplayRegion | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== EDITOR_MESSAGE.select) return;
      if (isDisplayRegion(event.data.region)) setRegion(event.data.region);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const highlight = useCallback((value: DisplayRegion | null) => {
    frameRef.current?.contentWindow?.postMessage({ type: EDITOR_MESSAGE.highlight, region: value }, window.location.origin);
  }, []);

  useEffect(() => highlight(region), [region, highlight]);

  return (
    <>
      <PageHeader title="Edit display" description="Tap any section of the billboard to edit it. Changes go live instantly." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] lg:items-start">
        <div className="lg:sticky lg:top-0">
          <div className="mx-auto w-full max-w-[min(100%,calc((100dvh-11rem)*9/16))]">
            <LivePreview ref={frameRef} interactive className="rounded-2xl shadow-xl" />
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5" /> Click a highlighted area to edit it
          </p>
        </div>

        {isDesktop ? (
          <Card className="lg:sticky lg:top-0 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
            <div className="p-5">
              {region ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setRegion(null)} className="-ml-2 mb-3 text-muted-foreground">
                    <ChevronLeft /> All sections
                  </Button>
                  <RegionEditor region={region} />
                </>
              ) : (
                <>
                  <p className="mb-1 font-semibold">Sections</p>
                  <p className="mb-4 text-sm text-muted-foreground">Pick a section here or click it on the display.</p>
                  <RegionPicker onSelect={setRegion} />
                </>
              )}
            </div>
          </Card>
        ) : (
          <>
            <RegionPicker onSelect={setRegion} />
            <Sheet open={!!region} onOpenChange={(open) => !open && setRegion(null)}>
              <SheetContent aria-describedby={undefined}>
                <SheetTitle className="sr-only">{region ? REGION_LABELS[region] : "Edit"}</SheetTitle>
                {region && (
                  <div className="pb-6">
                    <RegionEditor region={region} />
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>
    </>
  );
}

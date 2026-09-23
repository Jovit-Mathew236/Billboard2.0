"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LivePreview } from "../live-preview";
import { PageHeader } from "../page-header";

export function PreviewPanel() {
  return (
    <>
      <PageHeader
        title="Live preview"
        description="Exactly what the billboard is showing right now. It updates by itself as you edit."
        actions={
          <Button variant="outline" asChild>
            <a href="/display" target="_blank" rel="noreferrer">
              <ExternalLink /> Open full screen
            </a>
          </Button>
        }
      />
      <div className="mx-auto w-full max-w-[min(420px,calc((100dvh-14rem)*9/16))]">
        <LivePreview className="rounded-2xl shadow-xl ring-8 ring-foreground/90" />
      </div>
    </>
  );
}

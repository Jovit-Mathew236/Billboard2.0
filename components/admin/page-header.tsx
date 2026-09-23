"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useEmbedded } from "./embedded";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  const embedded = useEmbedded();
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", embedded ? "mb-4" : "mb-6")}>
      <div className="min-w-0">
        <h1 className={cn("font-semibold tracking-tight", embedded ? "text-lg" : "text-2xl sm:text-3xl")}>{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">{actions}</div>}
    </div>
  );
}

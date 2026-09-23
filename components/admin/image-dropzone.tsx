"use client";

import { useDropzone } from "react-dropzone";
import { ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  busy?: boolean;
  title?: string;
  hint?: string;
  className?: string;
}

export function ImageDropzone({
  onFiles,
  multiple = false,
  busy = false,
  title = "Drop images here or click to browse",
  hint = "JPG, PNG, WebP or HEIC. Large photos are resized automatically.",
  className,
}: ImageDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple,
    disabled: busy,
    onDrop: (accepted) => accepted.length && onFiles(accepted),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
        isDragActive ? "border-primary bg-accent" : "border-input hover:border-primary/60 hover:bg-muted/50",
        busy && "cursor-wait opacity-70",
        className
      )}
    >
      <input {...getInputProps()} />
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
      </span>
      <p className="text-sm font-medium">{busy ? "Uploading..." : title}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

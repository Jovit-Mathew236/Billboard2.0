/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Images, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAction } from "@/hooks/use-action";
import { useCarouselImages } from "@/hooks/use-display-data";
import { useAuth } from "@/lib/provider/authProvider";
import { addCarouselImage, deleteCarouselImage, reorderCarouselImages } from "@/lib/services/gallery";
import { nextOrder } from "@/lib/services/ordering";
import { compressImage } from "@/lib/image/compress";
import { describeError } from "@/lib/firebase/auth";
import { CarouselImage } from "@/types/display";
import { ConfirmDialog } from "../confirm-dialog";
import { EmptyState } from "../empty-state";
import { ImageDropzone } from "../image-dropzone";
import { PageHeader } from "../page-header";
import { SortableList } from "../sortable-list";
import { useEmbedded } from "../embedded";

export function GalleryManager() {
  const { data: images, loading } = useCarouselImages();
  const embedded = useEmbedded();
  const grid = embedded ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4";
  const { user, username } = useAuth();
  const { toast } = useToast();
  const { run } = useAction();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [deleting, setDeleting] = useState<CarouselImage | null>(null);

  const upload = async (files: File[]) => {
    setProgress({ done: 0, total: files.length });
    let order = nextOrder(images);
    let failed = 0;
    for (const file of files) {
      try {
        await addCarouselImage(await compressImage(file), { addedBy: username, addedByUid: user!.uid, order: order++ });
      } catch (error) {
        failed++;
        toast({ title: `Couldn't upload ${file.name}`, description: describeError(error), variant: "destructive" });
      }
      setProgress((p) => p && { ...p, done: p.done + 1 });
    }
    setProgress(null);
    const uploaded = files.length - failed;
    if (uploaded > 0) toast({ title: uploaded === 1 ? "Photo added to the carousel" : `${uploaded} photos added to the carousel` });
  };

  return (
    <>
      <PageHeader
        title="Photo carousel"
        description="Photos rotate every 5 seconds in the right column. Drag to set the order. Portrait (3:4) photos fill the frame best."
      />

      <ImageDropzone
        multiple
        onFiles={upload}
        busy={!!progress}
        title={progress ? `Uploading ${progress.done + 1} of ${progress.total}` : "Drop photos here or click to browse"}
        className="mb-6"
      />

      {loading ? (
        <div className={grid}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <EmptyState icon={Images} title="No photos yet" description="Upload photos above and they'll appear on the display right away." />
      ) : (
        <SortableList
          items={images}
          layout="grid"
          onReorder={(items) => run(() => reorderCarouselImages(items.map((i) => i.id)), { error: "Couldn't save the new order" })}
          className={grid}
          renderItem={(image, handle, index) => (
            <Card className="group overflow-hidden">
              <div className="relative aspect-[3/4] bg-muted">
                <img src={image.imageUrl} alt={`Carousel photo ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">{index + 1}</span>
              </div>
              <CardContent className="flex items-center gap-1 p-1.5 sm:p-1.5">
                {handle}
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{image.addedBy ?? ""}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete photo"
                  onClick={() => setDeleting(image)}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </CardContent>
            </Card>
          )}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this photo?"
        description="It will be removed from the display and permanently deleted from storage."
        successMessage="Photo deleted"
        onConfirm={() => deleteCarouselImage(deleting!.id, deleting!.s3Key)}
      />
    </>
  );
}

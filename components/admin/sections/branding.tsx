"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDisplaySettings } from "@/hooks/use-display-data";
import { useAction } from "@/hooks/use-action";
import { updateSettings } from "@/lib/services/settings";
import { deleteUpload, uploadImage } from "@/lib/services/gallery";
import { compressImage } from "@/lib/image/compress";
import { ImageDropzone } from "../image-dropzone";
import { LivePreview } from "../live-preview";
import { PageHeader } from "../page-header";
import { TextField } from "../text-field";
import { useEmbedded } from "../embedded";
import { cn } from "@/lib/utils";

const schema = z.object({
  logoText: z.string().trim().min(1, "Required").max(6, "Keep it short (max 6 characters)"),
  headerText: z.string().trim().min(1, "Required").max(60),
  title: z.string().trim().min(1, "Required").max(80),
});

type BrandingValues = z.infer<typeof schema>;

export function Branding() {
  const { data: settings, loading } = useDisplaySettings();
  const embedded = useEmbedded();
  const save = useAction();
  const background = useAction();
  const [uploading, setUploading] = useState(false);

  const form = useForm<BrandingValues>({
    resolver: zodResolver(schema),
    defaultValues: { logoText: "", headerText: "", title: "" },
  });
  const { errors, isDirty } = form.formState;

  useEffect(() => {
    if (loading || form.formState.isDirty) return;
    form.reset({ logoText: settings.logoText ?? "", headerText: settings.headerText ?? "", title: settings.title ?? "" });
  }, [loading, settings.logoText, settings.headerText, settings.title, form]);

  const onSubmit = form.handleSubmit((values) =>
    save.run(
      async () => {
        await updateSettings(values);
        form.reset(values);
      },
      { success: "Branding updated on the display", error: "Couldn't save branding" }
    )
  );

  const replaceBackground = async ([file]: File[]) => {
    setUploading(true);
    await background.run(
      async () => {
        const { url, key } = await uploadImage(await compressImage(file, { maxDimension: 3840, quality: 0.92 }), "background");
        const previousKey = settings.backgroundS3Key;
        await updateSettings({ backgroundImageUrl: url, backgroundS3Key: key });
        if (previousKey) await deleteUpload(previousKey).catch(() => undefined);
      },
      { success: "Background updated", error: "Background upload failed" }
    );
    setUploading(false);
  };

  const removeBackground = () =>
    background.run(
      async () => {
        const key = settings.backgroundS3Key;
        await updateSettings({ backgroundImageUrl: "", backgroundS3Key: "" });
        if (key) await deleteUpload(key).catch(() => undefined);
      },
      { success: "Background removed. The default gradient is back." }
    );

  return (
    <>
      <PageHeader title="Branding" description="The logo, department name and background shown on the billboard." />

      <div className={cn("grid grid-cols-1 gap-6", !embedded && "lg:grid-cols-[minmax(0,1fr)_300px]")}>
        <div className="grid min-w-0 content-start gap-6">
          <Card>
            <form onSubmit={onSubmit}>
              <CardHeader>
                <CardTitle>Header</CardTitle>
                <CardDescription>Shown below the weather and time at the top of the display.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {loading ? (
                  <Skeleton className="h-48" />
                ) : (
                  <>
                    <TextField label="Logo text" placeholder="er" error={errors.logoText?.message} hint="Large letters on the left, e.g. your department initials." {...form.register("logoText")} />
                    <TextField label="Heading" placeholder="Department of" error={errors.headerText?.message} {...form.register("headerText")} />
                    <TextField label="Department name" placeholder="Electronics & Computer Engineering" error={errors.title?.message} {...form.register("title")} />
                  </>
                )}
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="button" variant="ghost" disabled={!isDirty || save.pending} onClick={() => form.reset()}>
                  Discard
                </Button>
                <Button type="submit" disabled={!isDirty || save.pending}>
                  {save.pending && <Loader2 className="animate-spin" />}
                  Save changes
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Background image</CardTitle>
              <CardDescription>Optional. A dark overlay is added automatically so text stays readable. Portrait images work best.</CardDescription>
            </CardHeader>
            <CardContent className={cn("grid gap-4", embedded ? "grid-cols-[96px_1fr]" : "sm:grid-cols-[160px_1fr]")}>
              <div
                className="brand-gradient relative aspect-[9/16] overflow-hidden rounded-lg bg-cover bg-center ring-1 ring-border"
                style={settings.backgroundImageUrl ? { backgroundImage: `url(${settings.backgroundImageUrl})` } : undefined}
              >
                {!settings.backgroundImageUrl && (
                  <span className="absolute inset-x-0 bottom-2 text-center text-[11px] text-white/80">Default gradient</span>
                )}
              </div>
              <div className="grid content-start gap-3">
                <ImageDropzone onFiles={replaceBackground} busy={uploading} title="Upload a new background" />
                {settings.backgroundImageUrl && (
                  <Button variant="outline" onClick={removeBackground} disabled={background.pending} className="justify-self-start">
                    <Trash2 /> Remove background
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {!embedded && (
          <div className="hidden lg:block">
            <Card className="sticky top-0 p-3">
              <LivePreview />
            </Card>
          </div>
        )}
      </div>
    </>
  );
}

/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FlaskConical, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLabs } from "@/hooks/use-display-data";
import { useAction } from "@/hooks/use-action";
import { addLab, deleteLab, reorderLabs, ThumbnailChange, updateLab } from "@/lib/services/labs";
import { nextOrder } from "@/lib/services/ordering";
import { Lab } from "@/types/display";
import { ConfirmDialog } from "../confirm-dialog";
import { EmptyState } from "../empty-state";
import { FormDialog } from "../form-dialog";
import { ImageDropzone } from "../image-dropzone";
import { LabThumbnail } from "../lab-thumbnail";
import { ListRow } from "../list-row";
import { ListSkeleton } from "../list-skeleton";
import { PageHeader } from "../page-header";
import { SortableList } from "../sortable-list";
import { TextField } from "../text-field";

export const LABS_PER_PAGE = 5;

const schema = z.object({
  name: z.string().trim().min(1, "Enter the lab name").max(40, "Keep it under 40 characters"),
  code: z.string().trim().min(1, "Enter the lab code").max(16),
  subject: z.string().trim().min(1, "Enter the subject").max(24),
});

type LabValues = z.infer<typeof schema>;

const EMPTY: LabValues = { name: "", code: "", subject: "" };

export function LabManager() {
  const { data: labs, loading, error } = useLabs();
  const { run, pending } = useAction();
  const [editing, setEditing] = useState<Lab | "new" | null>(null);
  const [deleting, setDeleting] = useState<Lab | null>(null);
  const [thumbnail, setThumbnail] = useState<ThumbnailChange>({ kind: "keep" });
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<LabValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });
  const { errors } = form.formState;

  const openEditor = (item: Lab | "new") => {
    form.reset(item === "new" ? EMPTY : { name: item.name, code: item.code, subject: item.subject });
    setThumbnail({ kind: "keep" });
    setPreview(item === "new" ? null : item.thumbnailUrl ?? null);
    setEditing(item);
  };

  const chooseThumbnail = ([file]: File[]) => {
    setThumbnail({ kind: "replace", file });
    setPreview(URL.createObjectURL(file));
  };

  const removeThumbnail = () => {
    setThumbnail({ kind: "remove" });
    setPreview(null);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const saved = await run(
      () =>
        editing === "new" || !editing
          ? addLab(values, thumbnail.kind === "replace" ? thumbnail.file : null, nextOrder(labs))
          : updateLab(editing, values, thumbnail),
      { success: editing === "new" ? "Lab added" : "Lab updated", error: "Couldn't save lab" }
    );
    if (saved) setEditing(null);
  });

  const pages = Math.ceil(labs.length / LABS_PER_PAGE);

  return (
    <>
      <PageHeader
        title="Labs"
        description={`Shown after the faculty list in the white card, ${LABS_PER_PAGE} per page${pages > 1 ? ` (${pages} pages)` : ""}. Labs without a thumbnail get a gradient tile with their code.`}
        actions={
          <Button onClick={() => openEditor("new")}>
            <Plus /> Add lab
          </Button>
        }
      />

      {loading ? (
        <ListSkeleton />
      ) : labs.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title={error ? "Can't load labs" : "No labs yet"}
          description={error ?? "Add your department labs to show them on the display."}
          action={
            !error && (
              <Button onClick={() => openEditor("new")}>
                <Plus /> Add first lab
              </Button>
            )
          }
        />
      ) : (
        <SortableList
          items={labs}
          onReorder={(items) => run(() => reorderLabs(items.map((i) => i.id)), { error: "Couldn't save the new order" })}
          className="grid grid-cols-1 gap-2"
          renderItem={(lab, handle) => (
            <ListRow
              handle={handle}
              leading={<LabThumbnail src={lab.thumbnailUrl} code={lab.code} name={lab.name} className="w-16 sm:w-20" />}
              title={lab.name}
              subtitle={
                <span className="flex flex-wrap gap-1">
                  <Badge>{lab.code}</Badge>
                  <Badge variant="secondary">{lab.subject}</Badge>
                </span>
              }
              onEdit={() => openEditor(lab)}
              onDelete={() => setDeleting(lab)}
            />
          )}
        />
      )}

      <FormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing === "new" ? "Add lab" : "Edit lab"}
        submitLabel={editing === "new" ? "Add lab" : "Save"}
        pending={pending}
        onSubmit={onSubmit}
      >
        <TextField label="Lab name" placeholder="IoT Lab" autoFocus error={errors.name?.message} {...form.register("name")} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Lab code" placeholder="EY-201" error={errors.code?.message} {...form.register("code")} />
          <TextField label="Subject" placeholder="IoT" error={errors.subject?.message} {...form.register("subject")} />
        </div>
        <div className="grid gap-1.5">
          <Label>Thumbnail (optional)</Label>
          {preview ? (
            <div className="flex items-center gap-3">
              <img src={preview} alt="Lab thumbnail" className="aspect-[16/11] w-32 rounded-lg object-cover" />
              <div className="grid gap-2">
                <ImageDropzone onFiles={chooseThumbnail} title="Replace" hint="" className="px-3 py-2" />
                <Button type="button" variant="ghost" size="sm" onClick={removeThumbnail} className="text-muted-foreground">
                  <Trash2 /> Remove
                </Button>
              </div>
            </div>
          ) : (
            <ImageDropzone onFiles={chooseThumbnail} title="Add a thumbnail" hint="Landscape photos work best. Without one, a gradient tile is shown." />
          )}
        </div>
      </FormDialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Remove ${deleting?.name}?`}
        description="It will disappear from the display immediately."
        confirmLabel="Remove"
        successMessage="Lab removed"
        onConfirm={() => deleteLab(deleting!)}
      />
    </>
  );
}

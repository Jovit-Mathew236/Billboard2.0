"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBatches } from "@/hooks/use-display-data";
import { useAction } from "@/hooks/use-action";
import { BatchRecord, saveBatches } from "@/lib/services/batches";
import { BatchEntry } from "@/lib/utils/batches";
import { ConfirmDialog } from "../confirm-dialog";
import { EmptyState } from "../empty-state";
import { FormDialog } from "../form-dialog";
import { ListRow } from "../list-row";
import { ListSkeleton } from "../list-skeleton";
import { PageHeader } from "../page-header";
import { SortableList } from "../sortable-list";
import { TextField } from "../text-field";

const schema = z.object({
  batchYear: z.string().trim().min(1, "Enter the batch, e.g. 2021-2025"),
  studentCount: z.string().trim(),
  placements: z.string().trim(),
  higherStudy: z.string().trim(),
});

type BatchValues = z.infer<typeof schema>;

const EMPTY: BatchValues = { batchYear: "", studentCount: "", placements: "", higherStudy: "" };

const strip = ({ batchYear, studentCount, placements, higherStudy, row }: BatchEntry): BatchRecord => ({
  batchYear,
  studentCount,
  placements,
  higherStudy,
  row,
});

export function BatchManager() {
  const { table, entries, loading } = useBatches();
  const { run, pending } = useAction();
  const [editing, setEditing] = useState<BatchEntry | "new" | null>(null);
  const [deleting, setDeleting] = useState<BatchEntry | null>(null);

  const form = useForm<BatchValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const openEditor = (item: BatchEntry | "new") => {
    form.reset(
      item === "new"
        ? EMPTY
        : { batchYear: item.batchYear, studentCount: item.studentCount, placements: item.placements, higherStudy: item.higherStudy }
    );
    setEditing(item);
  };

  const persist = (next: BatchRecord[]) => saveBatches(table, next);

  const onSubmit = form.handleSubmit(async (values) => {
    const next =
      editing === "new" || !editing
        ? [...entries.map(strip), values]
        : entries.map((e) => (e.id === editing.id ? { ...strip(e), ...values } : strip(e)));
    const saved = await run(() => persist(next), {
      success: editing === "new" ? "Batch added" : "Batch updated",
      error: "Couldn't save batch",
    });
    if (saved) setEditing(null);
  });

  return (
    <>
      <PageHeader
        title="Batch highlights"
        description="Students, placement offers and higher studies per batch. The display cycles through batches every 8 seconds."
        actions={
          <Button onClick={() => openEditor("new")}>
            <Plus /> Add batch
          </Button>
        }
      />

      {loading ? (
        <ListSkeleton rows={3} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No batches yet"
          description="The display shows default numbers until you add a batch."
          action={
            <Button onClick={() => openEditor("new")}>
              <Plus /> Add first batch
            </Button>
          }
        />
      ) : (
        <SortableList
          items={entries}
          onReorder={(items) => run(() => persist(items.map(strip)), { error: "Couldn't save the new order" })}
          className="grid grid-cols-1 gap-2"
          renderItem={(item, handle) => (
            <ListRow
              handle={handle}
              title={`Batch ${item.batchYear}`}
              subtitle={
                <span className="grid grid-cols-3 gap-2 pt-1 sm:max-w-md">
                  <Metric label="Students" value={item.studentCount} />
                  <Metric label="Placements" value={item.placements} />
                  <Metric label="Higher study" value={item.higherStudy} />
                </span>
              }
              onEdit={() => openEditor(item)}
              onDelete={() => setDeleting(item)}
            />
          )}
        />
      )}

      <FormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing === "new" || !editing ? "Add batch" : `Edit batch ${editing.batchYear}`}
        submitLabel={editing === "new" ? "Add batch" : "Save"}
        pending={pending}
        onSubmit={onSubmit}
      >
        <TextField label="Batch" placeholder="2021-2025" autoFocus error={form.formState.errors.batchYear?.message} {...form.register("batchYear")} />
        <div className="grid grid-cols-3 gap-3">
          <TextField label="Students" inputMode="numeric" placeholder="60" {...form.register("studentCount")} />
          <TextField label="Placements" inputMode="numeric" placeholder="59" {...form.register("placements")} />
          <TextField label="Higher study" inputMode="numeric" placeholder="3" {...form.register("higherStudy")} />
        </div>
      </FormDialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Remove batch ${deleting?.batchYear}?`}
        confirmLabel="Remove"
        successMessage="Batch removed"
        onConfirm={() => persist(entries.filter((e) => e.id !== deleting!.id).map(strip))}
      />
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg bg-muted px-2.5 py-1.5">
      <span className="block text-[11px] text-muted-foreground">{label}</span>
      <span className="block font-semibold tabular-nums text-foreground">{value || "-"}</span>
    </span>
  );
}

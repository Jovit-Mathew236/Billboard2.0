"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStaffPositions } from "@/hooks/use-display-data";
import { useAction } from "@/hooks/use-action";
import { addStaffPosition, deleteStaffPosition, reorderStaffPositions, updateStaffPosition } from "@/lib/services/staff";
import { nextOrder } from "@/lib/services/ordering";
import { StaffPosition } from "@/types/display";
import { ConfirmDialog } from "../confirm-dialog";
import { EmptyState } from "../empty-state";
import { FormDialog } from "../form-dialog";
import { ListRow } from "../list-row";
import { ListSkeleton } from "../list-skeleton";
import { PageHeader } from "../page-header";
import { SortableList } from "../sortable-list";
import { TextField } from "../text-field";

const schema = z.object({
  position: z.string().trim().min(1, "Enter a role name").max(24, "Keep it under 24 characters"),
  count: z.string().trim().min(1, "Enter a number").max(6),
});

type StaffValues = z.infer<typeof schema>;

const SUGGESTED = ["PoP", "Asst Prof", "Asso Prof", "Technical Staff"];

export function StaffManager() {
  const { data: positions, loading } = useStaffPositions();
  const { run, pending } = useAction();
  const [editing, setEditing] = useState<StaffPosition | "new" | null>(null);
  const [deleting, setDeleting] = useState<StaffPosition | null>(null);

  const form = useForm<StaffValues>({ resolver: zodResolver(schema), defaultValues: { position: "", count: "" } });

  const openEditor = (item: StaffPosition | "new", preset?: string) => {
    form.reset(item === "new" ? { position: preset ?? "", count: "" } : { position: item.position, count: item.count });
    setEditing(item);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const saved = await run(
      () =>
        editing === "new" || !editing
          ? addStaffPosition(values, nextOrder(positions))
          : updateStaffPosition(editing.id, values),
      { success: editing === "new" ? "Staff role added" : "Staff role updated", error: "Couldn't save staff role" }
    );
    if (saved) setEditing(null);
  });

  const onReorder = (items: StaffPosition[]) =>
    run(() => reorderStaffPositions(items.map((i) => i.id)), { error: "Couldn't save the new order" });

  return (
    <>
      <PageHeader
        title="Staff counts"
        description="The row of numbers under the department name. Drag to change the order; around 4 roles fit best."
        actions={
          <Button onClick={() => openEditor("new")}>
            <Plus /> Add role
          </Button>
        }
      />

      {loading ? (
        <ListSkeleton />
      ) : positions.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No staff roles yet"
          description="The display is showing placeholder dashes. Add a role to start."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => openEditor("new", s)}>
                  <Plus /> {s}
                </Button>
              ))}
            </div>
          }
        />
      ) : (
        <SortableList
          items={positions}
          onReorder={onReorder}
          className="grid grid-cols-1 gap-2"
          renderItem={(item, handle) => (
            <ListRow
              handle={handle}
              title={item.position}
              trailing={<span className="text-2xl font-semibold tabular-nums">{item.count}</span>}
              onEdit={() => openEditor(item)}
              onDelete={() => setDeleting(item)}
            />
          )}
        />
      )}

      <FormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing === "new" ? "Add staff role" : "Edit staff role"}
        submitLabel={editing === "new" ? "Add role" : "Save"}
        pending={pending}
        onSubmit={onSubmit}
      >
        <TextField label="Role" placeholder="Asst Prof" autoFocus error={form.formState.errors.position?.message} {...form.register("position")} />
        <TextField label="Count" placeholder="12" inputMode="numeric" error={form.formState.errors.count?.message} {...form.register("count")} />
      </FormDialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Remove "${deleting?.position}"?`}
        description="It will disappear from the display immediately."
        confirmLabel="Remove"
        successMessage="Staff role removed"
        onConfirm={() => deleteStaffPosition(deleting!.id)}
      />
    </>
  );
}

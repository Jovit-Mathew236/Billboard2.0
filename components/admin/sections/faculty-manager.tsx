"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFaculty } from "@/hooks/use-display-data";
import { useAction } from "@/hooks/use-action";
import { addFaculty, deleteFaculty, parseDegrees, reorderFaculty, updateFaculty } from "@/lib/services/faculty";
import { nextOrder } from "@/lib/services/ordering";
import { FacultyMember } from "@/types/display";
import { ConfirmDialog } from "../confirm-dialog";
import { EmptyState } from "../empty-state";
import { FormDialog } from "../form-dialog";
import { ListRow } from "../list-row";
import { ListSkeleton } from "../list-skeleton";
import { PageHeader } from "../page-header";
import { SortableList } from "../sortable-list";
import { TagInput } from "../tag-input";
import { TextField } from "../text-field";

const PAGE_SIZE = 9;

export function FacultyManager() {
  const { data: faculty, loading } = useFaculty();
  const { run, pending } = useAction();
  const [editing, setEditing] = useState<FacultyMember | "new" | null>(null);
  const [deleting, setDeleting] = useState<FacultyMember | null>(null);
  const [name, setName] = useState("");
  const [degrees, setDegrees] = useState<string[]>([]);
  const [nameError, setNameError] = useState<string>();
  const [search, setSearch] = useState("");

  const commonDegrees = useMemo(() => {
    const counts = new Map<string, number>();
    faculty.forEach((f) => parseDegrees(f.specializedIn).forEach((d) => counts.set(d, (counts.get(d) ?? 0) + 1)));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([d]) => d);
  }, [faculty]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return faculty;
    return faculty.filter((f) => f.name?.toLowerCase().includes(term) || f.specializedIn?.toLowerCase().includes(term));
  }, [faculty, search]);

  const openEditor = (item: FacultyMember | "new") => {
    setName(item === "new" ? "" : item.name);
    setDegrees(item === "new" ? [] : parseDegrees(item.specializedIn));
    setNameError(undefined);
    setEditing(item);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setNameError("Enter a name");
    const input = { name, degrees };
    const saved = await run(
      () => (editing === "new" || !editing ? addFaculty(input, nextOrder(faculty)) : updateFaculty(editing.id, input)),
      { success: editing === "new" ? "Faculty member added" : "Faculty member updated", error: "Couldn't save" }
    );
    if (saved) setEditing(null);
  };

  const onReorder = (items: FacultyMember[]) =>
    run(() => reorderFaculty(items.map((i) => i.id)), { error: "Couldn't save the new order" });

  const pages = Math.max(1, Math.ceil(faculty.length / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Faculty"
        description={`Shown ${PAGE_SIZE} at a time in the white card, rotating every 8 seconds${faculty.length > PAGE_SIZE ? ` (${pages} pages)` : ""}.`}
        actions={
          <Button onClick={() => openEditor("new")}>
            <Plus /> Add faculty
          </Button>
        }
      />

      {loading ? (
        <ListSkeleton rows={6} />
      ) : faculty.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No faculty members yet"
          description="Add names and qualifications to fill the faculty card on the display."
          action={
            <Button onClick={() => openEditor("new")}>
              <Plus /> Add first member
            </Button>
          }
        />
      ) : (
        <>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${faculty.length} members`} className="pl-9" />
          </div>
          {search ? (
            <div className="grid grid-cols-1 gap-2">
              {filtered.map((item) => (
                <FacultyRow key={item.id} item={item} onEdit={() => openEditor(item)} onDelete={() => setDeleting(item)} />
              ))}
              {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No matches for &quot;{search}&quot;</p>}
            </div>
          ) : (
            <SortableList
              items={faculty}
              onReorder={onReorder}
              className="grid grid-cols-1 gap-2"
              renderItem={(item, handle, index) => (
                <>
                  {index > 0 && index % PAGE_SIZE === 0 && (
                    <p className="px-1 pb-1 pt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Page {index / PAGE_SIZE + 1}
                    </p>
                  )}
                  <FacultyRow item={item} handle={handle} onEdit={() => openEditor(item)} onDelete={() => setDeleting(item)} />
                </>
              )}
            />
          )}
        </>
      )}

      <FormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing === "new" ? "Add faculty member" : "Edit faculty member"}
        submitLabel={editing === "new" ? "Add" : "Save"}
        pending={pending}
        onSubmit={onSubmit}
      >
        <TextField
          label="Full name"
          name="name"
          placeholder="Dr. Jane Doe"
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError(undefined);
          }}
          error={nameError}
        />
        <TagInput
          label="Qualifications"
          value={degrees}
          onChange={setDegrees}
          placeholder="PhD, M.Tech..."
          hint="Press Enter or comma after each one."
          suggestions={commonDegrees}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Remove ${deleting?.name}?`}
        description="They will be removed from the display immediately."
        confirmLabel="Remove"
        successMessage="Faculty member removed"
        onConfirm={() => deleteFaculty(deleting!.id)}
      />
    </>
  );
}

function FacultyRow({
  item,
  handle,
  onEdit,
  onDelete,
}: {
  item: FacultyMember;
  handle?: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const degrees = parseDegrees(item.specializedIn);
  return (
    <ListRow
      handle={handle}
      className={handle ? undefined : "pl-3"}
      title={item.name}
      subtitle={
        degrees.length > 0 && (
          <span className="flex flex-wrap gap-1">
            {degrees.map((d) => (
              <Badge key={d}>{d}</Badge>
            ))}
          </span>
        )
      }
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

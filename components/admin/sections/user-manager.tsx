"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "@/hooks/use-action";
import { useUsers } from "@/hooks/use-display-data";
import { useAuth } from "@/lib/provider/authProvider";
import { compressImage } from "@/lib/image/compress";
import { createUser } from "@/lib/services/users";
import { UserRole } from "@/types/display";
import { EmptyState } from "../empty-state";
import { FormDialog } from "../form-dialog";
import { ListRow } from "../list-row";
import { ListSkeleton } from "../list-skeleton";
import { PageHeader } from "../page-header";
import { TextField } from "../text-field";

const ROLES: Array<{ value: UserRole; label: string; description: string }> = [
  { value: "admin", label: "Admin", description: "Can edit all display content" },
  { value: "superadmin", label: "Super admin", description: "Full access including users" },
  { value: "faculty", label: "Faculty", description: "Department staff member" },
];

const schema = z.object({
  username: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  role: z.enum(["admin", "superadmin", "faculty"]),
});

type UserValues = z.infer<typeof schema>;

export function UserManager() {
  const { data: users, loading, error } = useUsers();
  const { user: currentUser, username } = useAuth();
  const { run, pending } = useAction();
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  const form = useForm<UserValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "", role: "admin" },
  });
  const { errors } = form.formState;

  const openDialog = () => {
    form.reset();
    setPhoto(null);
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const saved = await run(
      async () => createUser({ ...values, image: photo ? await compressImage(photo, { maxDimension: 512 }) : undefined, addedBy: username }),
      { success: `${values.username} can now sign in`, error: "Couldn't create user" }
    );
    if (saved) setOpen(false);
  });

  return (
    <>
      <PageHeader
        title="Users"
        description="People who can sign in and manage the billboard."
        actions={
          <Button onClick={openDialog}>
            <UserPlus /> Add user
          </Button>
        }
      />

      {loading ? (
        <ListSkeleton />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title={error ? "Can't load users" : "No users found"} description={error ?? undefined} />
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {users.map((u) => (
            <ListRow
              key={u.id}
              className="pl-3"
              leading={<Avatar name={u.username ?? u.email} src={u.imageUrl} />}
              title={
                <span className="flex items-center gap-2">
                  {u.username}
                  {u.id === currentUser?.uid && <Badge variant="secondary">You</Badge>}
                </span>
              }
              subtitle={u.email}
              trailing={<Badge variant="outline" className="capitalize">{u.role ?? "user"}</Badge>}
            />
          ))}
        </div>
      )}

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Add user"
        description="They'll sign in with this email and password."
        submitLabel="Create user"
        pending={pending}
        onSubmit={onSubmit}
      >
        <TextField label="Full name" autoFocus placeholder="Jane Doe" error={errors.username?.message} {...form.register("username")} />
        <TextField label="Email" type="email" autoComplete="off" placeholder="jane@college.edu" error={errors.email?.message} {...form.register("email")} />
        <TextField label="Temporary password" type="password" autoComplete="new-password" error={errors.password?.message} hint="At least 8 characters." {...form.register("password")} />
        <div className="grid gap-1.5">
          <Label>Role</Label>
          <Select value={form.watch("role")} onValueChange={(v) => form.setValue("role", v as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label} <span className="text-muted-foreground">- {r.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <TextField
          label="Profile photo (optional)"
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          className="file:mr-3 file:rounded-md file:bg-accent file:px-2 file:text-accent-foreground"
        />
      </FormDialog>
    </>
  );
}

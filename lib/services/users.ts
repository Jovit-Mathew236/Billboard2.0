import { apiFetch } from "@/lib/api-client";
import { UserRole } from "@/types/display";

export interface CreateUserInput {
  email: string;
  password: string;
  username: string;
  role: UserRole;
  image?: string;
  addedBy?: string;
}

export const createUser = (input: CreateUserInput) =>
  apiFetch<{ userId: string }>("/api/users", { method: "POST", body: input });

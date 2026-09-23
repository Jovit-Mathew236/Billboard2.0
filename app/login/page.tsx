import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function Page() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

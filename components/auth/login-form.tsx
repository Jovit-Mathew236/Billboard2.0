"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/admin/text-field";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase/config";
import { describeError, resetPassword, signIn } from "@/lib/firebase/auth";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type LoginValues = z.infer<typeof schema>;

const safeNext = (next: string | null) => (next && next.startsWith("/admin") ? next : "/admin");

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const destination = safeNext(params.get("next"));

  const form = useForm<LoginValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });
  const { errors, isSubmitting } = form.formState;

  useEffect(() => onAuthStateChanged(auth, (user) => user && router.replace(destination)), [router, destination]);

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(describeError(err));
    }
  });

  const onForgot = async () => {
    const email = form.getValues("email");
    if (!z.string().email().safeParse(email.trim()).success) {
      form.setError("email", { message: "Enter your email first, then tap Forgot password" });
      return;
    }
    try {
      await resetPassword(email);
      toast({ title: "Check your inbox", description: `We sent a reset link to ${email}.` });
    } catch (err) {
      setError(describeError(err));
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="brand-gradient relative hidden flex-col justify-between p-12 text-white lg:flex">
        <span className="text-lg font-semibold">Billboard</span>
        <div>
          <p className="text-4xl font-semibold leading-tight tracking-tight">Keep your department display fresh, from anywhere.</p>
          <p className="mt-4 max-w-md text-white/75">Update faculty, staff counts, photos and highlights. Changes appear on the screen in real time.</p>
        </div>
        <span className="text-sm text-white/60">Real-time digital signage</span>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="brand-gradient flex h-11 w-11 items-center justify-center rounded-xl text-lg font-black text-white">B</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use the account your administrator created for you.</p>

          <Card className="mt-6 p-5 sm:p-6">
            <form onSubmit={onSubmit} className="grid gap-4" noValidate>
              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <TextField label="Email" type="email" autoComplete="email" autoFocus placeholder="you@college.edu" error={errors.email?.message} {...form.register("email")} />
              <TextField label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...form.register("password")} />
              <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
                {isSubmitting && <Loader2 className="animate-spin" />}
                Sign in
              </Button>
              <button type="button" onClick={onForgot} className="justify-self-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Forgot password?
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

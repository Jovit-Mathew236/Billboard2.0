"use client";

import { forwardRef, ReactNode } from "react";
import { Input, InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextFieldProps extends InputProps {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({ label, error, hint, id, name, ...props }, ref) => {
  const fieldId = id ?? name;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} name={name} ref={ref} aria-invalid={!!error} {...props} />
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
});
TextField.displayName = "TextField";

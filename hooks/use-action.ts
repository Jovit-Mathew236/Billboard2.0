"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { describeError } from "@/lib/firebase/auth";

interface ActionOptions {
  success?: string;
  error?: string;
}

export function useAction() {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (task: () => Promise<unknown>, { success, error }: ActionOptions = {}): Promise<boolean> => {
      setPending(true);
      try {
        await task();
        if (success) toast({ title: success });
        return true;
      } catch (err) {
        toast({ title: error ?? "Something went wrong", description: describeError(err), variant: "destructive" });
        return false;
      } finally {
        setPending(false);
      }
    },
    [toast]
  );

  return { run, pending };
}

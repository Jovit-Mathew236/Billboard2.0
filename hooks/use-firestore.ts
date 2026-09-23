"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { describeError } from "@/lib/firebase/auth";

interface Snapshot<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export function useCollection<T extends { id: string }>(
  path: string,
  sort?: (a: T, b: T) => number
): Snapshot<T[]> {
  const [state, setState] = useState<Snapshot<T[]>>({ data: [], loading: true, error: null });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const rows = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) }) as T);
        setState({ data: sort ? [...rows].sort(sort) : rows, loading: false, error: null });
      },
      (error) => setState((prev) => ({ ...prev, loading: false, error: describeError(error) }))
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return state;
}

export function useDocument<T>(path: string, id: string, fallback: T): Snapshot<T> & { exists: boolean } {
  const [state, setState] = useState<Snapshot<T> & { exists: boolean }>({
    data: fallback,
    loading: true,
    error: null,
    exists: false,
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, path, id),
      (snap) =>
        setState({
          data: snap.exists() ? { ...fallback, ...(snap.data() as T) } : fallback,
          loading: false,
          error: null,
          exists: snap.exists(),
        }),
      (error) => setState((prev) => ({ ...prev, loading: false, error: describeError(error) }))
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, id]);

  return state;
}

export const byOrder = <T extends { order?: number }>(a: T, b: T) =>
  (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);

export const byOrderThenUpload = <T extends { order?: number; uploadedAt?: string }>(a: T, b: T) =>
  byOrder(a, b) || (a.uploadedAt ?? "").localeCompare(b.uploadedAt ?? "");

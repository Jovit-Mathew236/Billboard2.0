"use client";

import { useMemo } from "react";
import { COLLECTIONS, SETTINGS_DOC_ID } from "@/lib/firebase/collections";
import { DEFAULT_SETTINGS } from "@/lib/services/settings";
import { findBatchTable, parseBatchTable, TableBlockLike } from "@/lib/utils/batches";
import { AppUser, CarouselImage, DisplaySettings, FacultyMember, Lab, StaffPosition } from "@/types/display";
import { byOrder, byOrderThenUpload, useCollection, useDocument } from "./use-firestore";

export const useDisplaySettings = () =>
  useDocument<DisplaySettings>(COLLECTIONS.settings, SETTINGS_DOC_ID, DEFAULT_SETTINGS);

export const useStaffPositions = () => useCollection<StaffPosition>(COLLECTIONS.positions, byOrder);

export const useFaculty = () => useCollection<FacultyMember>(COLLECTIONS.faculty, byOrder);

export const useLabs = () => useCollection<Lab>(COLLECTIONS.labs, byOrder);

export const useCarouselImages = () => useCollection<CarouselImage>(COLLECTIONS.images, byOrderThenUpload);

export const useUsers = () =>
  useCollection<AppUser>(COLLECTIONS.users, (a, b) => (a.username ?? "").localeCompare(b.username ?? ""));

export function useBatches() {
  const blocks = useCollection<TableBlockLike>(COLLECTIONS.blocks);
  const table = useMemo(() => findBatchTable(blocks.data), [blocks.data]);
  const entries = useMemo(() => (table ? parseBatchTable(table) : []), [table]);
  return { table, entries, loading: blocks.loading, error: blocks.error };
}

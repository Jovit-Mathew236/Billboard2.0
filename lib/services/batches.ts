import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { BatchEntry, DEFAULT_BATCH_HEADERS, serializeBatchRows, TableBlockLike } from "@/lib/utils/batches";

export type BatchRecord = Omit<BatchEntry, "id">;

export const saveBatches = async (table: TableBlockLike | undefined, entries: BatchRecord[]) => {
  if (table) {
    const headers = table.headers?.length ? table.headers : DEFAULT_BATCH_HEADERS;
    await setDoc(
      doc(db, COLLECTIONS.blocks, table.id),
      { rows: serializeBatchRows(headers, entries) },
      { merge: true }
    );
    return;
  }
  await addDoc(collection(db, COLLECTIONS.blocks), {
    type: "table",
    title: "Students Count",
    headers: DEFAULT_BATCH_HEADERS,
    rows: serializeBatchRows(DEFAULT_BATCH_HEADERS, entries),
    width: 12,
    height: 100,
    theme: "light",
    position: 0,
  });
};

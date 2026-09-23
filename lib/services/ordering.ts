import { doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export const nextOrder = (items: Array<{ order?: number }>) =>
  items.reduce((max, item, index) => Math.max(max, item.order ?? index), -1) + 1;

export const persistOrder = async (path: string, ids: string[]) => {
  const batch = writeBatch(db);
  ids.forEach((id, index) => batch.set(doc(db, path, id), { order: index }, { merge: true }));
  await batch.commit();
};

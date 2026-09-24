import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { apiFetch } from "@/lib/api-client";
import { persistOrder } from "./ordering";

export interface UploadResult {
  url: string;
  key: string;
}

export type UploadFolder = "carousel" | "background" | "avatar" | "lab";

export const uploadImage = (image: string, folder: UploadFolder) =>
  apiFetch<UploadResult>("/api/uploads", { method: "POST", body: { image, folder } });

export const deleteUpload = (key: string) =>
  apiFetch<{ ok: true }>("/api/uploads", { method: "DELETE", body: { key } });

export const addCarouselImage = async (
  image: string,
  meta: { addedBy: string; addedByUid: string; order: number }
) => {
  const { url, key } = await uploadImage(image, "carousel");
  await addDoc(collection(db, COLLECTIONS.images), {
    imageUrl: url,
    s3Key: key,
    uploadedAt: new Date().toISOString(),
    ...meta,
  });
};

export const deleteCarouselImage = async (id: string, s3Key?: string) => {
  await deleteDoc(doc(db, COLLECTIONS.images, id));
  if (s3Key) await deleteUpload(s3Key).catch(() => undefined);
};

export const reorderCarouselImages = (ids: string[]) => persistOrder(COLLECTIONS.images, ids);

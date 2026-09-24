import { addDoc, collection, deleteDoc, deleteField, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { Lab } from "@/types/display";
import { compressImage } from "@/lib/image/compress";
import { deleteUpload, uploadImage } from "./gallery";
import { persistOrder } from "./ordering";

export interface LabInput {
  name: string;
  code: string;
  subject: string;
}

export type ThumbnailChange = { kind: "keep" } | { kind: "remove" } | { kind: "replace"; file: File };

const uploadThumbnail = async (file: File) => {
  const { url, key } = await uploadImage(await compressImage(file, { maxDimension: 1200, quality: 0.88 }), "lab");
  return { thumbnailUrl: url, thumbnailS3Key: key };
};

const clean = ({ name, code, subject }: LabInput) => ({
  name: name.trim(),
  code: code.trim(),
  subject: subject.trim(),
});

export const addLab = async (input: LabInput, thumbnail: File | null, order: number) => {
  const media = thumbnail ? await uploadThumbnail(thumbnail) : {};
  await addDoc(collection(db, COLLECTIONS.labs), { ...clean(input), ...media, order });
};

export const updateLab = async (lab: Lab, input: LabInput, thumbnail: ThumbnailChange) => {
  const ref = doc(db, COLLECTIONS.labs, lab.id);
  if (thumbnail.kind === "keep") {
    await setDoc(ref, clean(input), { merge: true });
    return;
  }
  const media =
    thumbnail.kind === "replace"
      ? await uploadThumbnail(thumbnail.file)
      : { thumbnailUrl: deleteField(), thumbnailS3Key: deleteField() };
  await setDoc(ref, { ...clean(input), ...media }, { merge: true });
  if (lab.thumbnailS3Key) await deleteUpload(lab.thumbnailS3Key).catch(() => undefined);
};

export const deleteLab = async (lab: Lab) => {
  await deleteDoc(doc(db, COLLECTIONS.labs, lab.id));
  if (lab.thumbnailS3Key) await deleteUpload(lab.thumbnailS3Key).catch(() => undefined);
};

export const reorderLabs = (ids: string[]) => persistOrder(COLLECTIONS.labs, ids);

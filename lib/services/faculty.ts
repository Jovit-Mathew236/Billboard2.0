import { addDoc, collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { persistOrder } from "./ordering";

export interface FacultyInput {
  name: string;
  degrees: string[];
}

export const parseDegrees = (specializedIn: string | undefined) =>
  (specializedIn ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

const toDoc = ({ name, degrees }: FacultyInput) => ({
  name: name.trim(),
  specializedIn: degrees.map((d) => d.trim()).filter(Boolean).join(", "),
});

export const addFaculty = (input: FacultyInput, order: number) =>
  addDoc(collection(db, COLLECTIONS.faculty), { ...toDoc(input), order });

export const updateFaculty = (id: string, input: FacultyInput) =>
  setDoc(doc(db, COLLECTIONS.faculty, id), toDoc(input), { merge: true });

export const deleteFaculty = (id: string) => deleteDoc(doc(db, COLLECTIONS.faculty, id));

export const reorderFaculty = (ids: string[]) => persistOrder(COLLECTIONS.faculty, ids);

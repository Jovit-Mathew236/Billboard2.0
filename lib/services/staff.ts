import { addDoc, collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { StaffPosition } from "@/types/display";
import { persistOrder } from "./ordering";

type StaffInput = Pick<StaffPosition, "position" | "count">;

export const addStaffPosition = (input: StaffInput, order: number) =>
  addDoc(collection(db, COLLECTIONS.positions), { ...input, order });

export const updateStaffPosition = (id: string, input: StaffInput) =>
  setDoc(doc(db, COLLECTIONS.positions, id), input, { merge: true });

export const deleteStaffPosition = (id: string) => deleteDoc(doc(db, COLLECTIONS.positions, id));

export const reorderStaffPositions = (ids: string[]) => persistOrder(COLLECTIONS.positions, ids);

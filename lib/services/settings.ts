import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS, SETTINGS_DOC_ID } from "@/lib/firebase/collections";
import { DisplaySettings } from "@/types/display";

export const DEFAULT_SETTINGS: DisplaySettings = {
  headerText: "Department of",
  title: "Electronics & Computer Engineering",
  logoText: "er",
  backgroundImageUrl: "",
  backgroundS3Key: "",
  batchYear: "2021-2025",
  studentCount: "60",
  placements: "59",
  higherStudy: "3",
};

export const settingsRef = () => doc(db, COLLECTIONS.settings, SETTINGS_DOC_ID);

export const updateSettings = (values: Partial<DisplaySettings>) =>
  setDoc(settingsRef(), values, { merge: true });

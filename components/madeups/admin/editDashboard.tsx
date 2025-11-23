"use client";
import SwipeButton from "@/components/swipe-button";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, GripVertical, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useTheme } from "next-themes";
import Image from "next/image";
import WeatherWidget from "@/components/weather-widget";
import TimeWidget from "@/components/time-widget";
import { StaffPositions, NewsTickerBlock } from "@/lib/utils/renderBlock";
import { ColorPicker } from "@/components/ui/color-picker";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BaseField {
  id: string;
  type: string;
  title: string;
  width: number;
  height: number;
  position?: number;
  theme: "light" | "dark" | "system";
  backgroundColor?: string;
  textColor?: string;
}

interface TextField extends BaseField {
  type: "text";
  content: string;
  textAlign?: "left" | "center" | "right";
}

interface ImageField extends BaseField {
  type: "image";
  imageUrl: string;
  alt?: string;
}

interface ListField extends BaseField {
  type: "list";
  items: string[];
  listStyle?: "bullet" | "number" | "none";
}

interface WeatherField extends BaseField {
  type: "weather";
  location: string;
  unit: "celsius" | "fahrenheit";
}

interface TimeField extends BaseField {
  type: "time";
  format: "12h" | "24h";
  showSeconds?: boolean;
}

interface StaffField extends BaseField {
  type: "staff";
  positions: Array<{
    position: string;
    count: string;
  }>;
}

interface NewsField extends BaseField {
  type: "news";
  showNifty?: boolean;
  showWeather?: boolean;
}

interface TableField extends BaseField {
  type: "table";
  headers: string[];
  rows: string; // JSON stringified array of string arrays
}

interface CarouselField extends BaseField {
  type: "carousel";
  transitionInterval: number;
}

type ContentBlock =
  | TextField
  | ImageField
  | ListField
  | WeatherField
  | TimeField
  | StaffField
  | NewsField
  | TableField
  | CarouselField;

// Move renderBlockPreview before SortableBlock
const renderBlockPreview = (block: ContentBlock) => {
  switch (block.type) {
    case "text":
      return <div className="overflow-auto">{block.content}</div>;
    case "image":
      return (
        <div className="relative w-full h-full">
          <Image
            src={block.imageUrl}
            alt={block.alt || block.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      );
    case "list":
      const listBlock = block as ListField;
      return (
        <ul
          className={
            listBlock.listStyle === "number"
              ? "list-decimal"
              : listBlock.listStyle === "bullet"
              ? "list-disc"
              : "list-none"
          }
        >
          {listBlock.items?.map((item, index) => <li key={index}>{item}</li>) ||
            []}
        </ul>
      );
    case "table":
      const tableBlock = block as TableField;
      let parsedRows: string[][] = [];
      try {
        parsedRows = JSON.parse(tableBlock.rows);
        if (
          !Array.isArray(parsedRows) ||
          !parsedRows.every((row) => Array.isArray(row))
        ) {
          parsedRows = []; // Ensure it's an array of arrays
        }
      } catch (error) {
        console.error("Error parsing table rows for preview:", error);
      }
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {tableBlock.headers.map((header, index) => (
                  <th key={index} className="border p-2 text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border p-2">
                      {/* Ensure cell exists for each header */}
                      {cellIndex < tableBlock.headers.length ? cell : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "weather":
      return <WeatherWidget location={block.location} unit={block.unit} />;
    case "time":
      return (
        <TimeWidget format={block.format} showSeconds={block.showSeconds} />
      );
    case "staff":
      return <StaffPositions block={block as StaffField} />;
    case "news":
      return <NewsTickerBlock block={block as NewsField} />;
    case "carousel":
      return <div>Carousel content (images from Images section)</div>; // Updated placeholder
    default:
      return null;
  }
};

const SortableBlock = ({
  block,
  onEdit,
  onDelete,
  // theme,
  customStyle = {},
}: {
  block: ContentBlock;
  onEdit: (block: ContentBlock) => void;
  onDelete: (id: string) => void;
  theme: string | undefined;
  customStyle?: React.CSSProperties;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.9 : 1,
    ...customStyle,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative rounded-2xl shadow-xl overflow-hidden border border-white/10 backdrop-blur-sm",
        "touch-none",
        isDragging ? "ring-4 ring-blue-400 ring-opacity-50 scale-105" : "",
        "hover:shadow-2xl transition-all duration-200"
      )}
      {...attributes}
    >
      {/* Edit Controls Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-2 bg-gradient-to-b from-black/60 to-transparent transition-opacity">
        <div
          {...listeners}
          className="p-1.5 cursor-grab rounded-lg bg-white/20 hover:bg-white/30 active:cursor-grabbing backdrop-blur-sm"
        >
          <GripVertical className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-xs font-semibold truncate mx-2 flex-1 text-white drop-shadow">
          {block.title}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(block)}
            className="h-7 w-7 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          >
            <Edit2 className="h-3 w-3 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(block.id)}
            className="h-7 w-7 p-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          >
            <X className="h-3 w-3 text-white" />
          </Button>
        </div>
      </div>

      {/* Content Preview - Matching Display */}
      <div className="w-full h-full p-2 overflow-hidden flex flex-col text-xs">
        {renderBlockPreview(block)}
      </div>
    </div>
  );
};

const EditDashboard = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<ContentBlock | null>(null);
  const { theme } = useTheme();
  const [globalSettings, setGlobalSettings] = useState({
    backgroundColor: "#000000",
    headerText: "Department of",
    title: "ELECTRONICS & COMPUTER ENGINEERING",
    backgroundImageUrl: "",
    backgroundS3Key: "",
  });

  // --- Input string states for dimension fields ---
  const [widthInputValue, setWidthInputValue] = useState("");
  const [heightInputValue, setHeightInputValue] = useState("");
  const [tableColumnCountInput, setTableColumnCountInput] = useState("");
  const [tableRowCountInput, setTableRowCountInput] = useState("");
  // --- End input string states ---

  useEffect(() => {
    if (editingBlock) {
      setWidthInputValue(String(editingBlock.width ?? "")); // Use ?? for potential undefined initial values
      setHeightInputValue(String(editingBlock.height ?? ""));

      if (editingBlock.type === "table") {
        setTableColumnCountInput(String(editingBlock.headers.length));
        try {
          const parsedRows = JSON.parse(editingBlock.rows);
          setTableRowCountInput(
            String(Array.isArray(parsedRows) ? parsedRows.length : 0)
          );
        } catch {
          setTableRowCountInput("0"); // Default to 0 if parsing fails
        }
      } else {
        setTableColumnCountInput(""); // Reset if not a table
        setTableRowCountInput("");
      }
    } else {
      // Reset all when no block is being edited or dialog closes
      setWidthInputValue("");
      setHeightInputValue("");
      setTableColumnCountInput("");
      setTableRowCountInput("");
    }
  }, [editingBlock]); // This effect syncs input strings when editingBlock changes or dialog opens/closes

  // ... (Load global settings useEffect remains the same) ...
  useEffect(() => {
    const settingsRef = doc(db, "settings", "global");
    const unsubscribe = onSnapshot(settingsRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const settingsData = docSnapshot.data();
        setGlobalSettings((prev) => ({
          ...prev,
          backgroundColor: settingsData.backgroundColor || prev.backgroundColor,
          headerText: settingsData.headerText || prev.headerText,
          title: settingsData.title || prev.title,
          backgroundImageUrl: settingsData.backgroundImageUrl || "",
          backgroundS3Key: settingsData.backgroundS3Key || "",
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Load saved blocks from localStorage/Firebase
  useEffect(() => {
    const fetchBlocks = async () => {
      const blocksCollection = collection(db, "blocks");
      const q = query(blocksCollection, orderBy("position", "asc"));
      const blocksSnapshot = await getDocs(q);
      const blocksList = blocksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ContentBlock[];

      blocksList.sort(
        (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)
      );
      setBlocks(blocksList);
    };

    fetchBlocks();

    // Optional: Realtime listener if needed, but initial load is often getDocs
    const blocksCollection = collection(db, "blocks");
    const q = query(blocksCollection, orderBy("position", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blocksList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ContentBlock[];
      blocksList.sort(
        (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)
      );
      setBlocks(blocksList);
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);

  // ... (addNewBlock, updateBlock, deleteBlock, handleDragEnd, updateGlobalSettings, uploadBackgroundImage, removeBackgroundImage remain largely the same) ...
  // Ensure default width/height are set in addNewBlock
  const addNewBlock = async (type: string) => {
    try {
      const maxPosition = blocks.reduce(
        (max, block) => Math.max(max, block.position ?? -1),
        -1
      );

      const newBlockBase = {
        type,
        title: `New ${type} Block`,
        width: 6, // Default width
        height: 200, // Default height
        theme: "light",
        position: maxPosition + 1,
        backgroundColor:
          type === "news" || type === "carousel" ? "#000000" : "#ffffff", // Specific defaults
        textColor:
          type === "news" || type === "carousel" ? "#ffffff" : "#000000",
      };

      let blockData;
      switch (type) {
        case "text":
          blockData = {
            ...newBlockBase,
            content: "",
            textAlign: "left",
          } as Omit<TextField, "id">;
          break;
        case "list":
          blockData = {
            ...newBlockBase,
            items: ["New item 1"],
            listStyle: "bullet",
          } as Omit<ListField, "id">;
          break;
        case "news":
          blockData = {
            ...newBlockBase,
            showNifty: true,
            showWeather: true,
          } as Omit<NewsField, "id">;
          break;
        case "time":
          blockData = {
            ...newBlockBase,
            format: "12h",
            showSeconds: true,
          } as Omit<TimeField, "id">;
          break;
        case "staff":
          blockData = { ...newBlockBase, positions: [] } as Omit<
            StaffField,
            "id"
          >;
          break;
        case "image": // Kept for consistency, though carousel is preferred by user
          blockData = { ...newBlockBase, type: "image", imageUrl: "" } as Omit<
            ImageField,
            "id"
          >;
          break;
        case "weather":
          blockData = {
            ...newBlockBase,
            type: "weather",
            location: "",
            unit: "celsius",
          } as Omit<WeatherField, "id">;
          break;
        case "table":
          blockData = {
            ...newBlockBase,
            type: "table",
            headers: ["Header 1", "Header 2"],
            rows: JSON.stringify([
              ["Cell 1,1", "Cell 1,2"],
              ["Cell 2,1", "Cell 2,2"],
            ]),
          } as Omit<TableField, "id">;
          break;
        case "carousel":
          blockData = {
            ...newBlockBase,
            type: "carousel",
            transitionInterval: 5000,
          } as Omit<CarouselField, "id">;
          break;
        default:
          console.warn("Unknown block type:", type);
          return; // Or throw error
      }

      const docRef = await addDoc(collection(db, "blocks"), blockData);
      const blockWithId = { ...blockData, id: docRef.id } as ContentBlock;

      // setBlocks([...blocks, blockWithId]); // This will be handled by the onSnapshot listener
      setEditingBlock(blockWithId);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error adding block:", error);
    }
  };

  // Validation function to check if layout is feasible
  const validateBlockDimensions = (
    block: ContentBlock
  ): { valid: boolean; message: string } => {
    const width = Number(block.width) || 4;
    const height = Number(block.height) || 200;

    // Calculate row span using same formula as display
    const rowSpan = Math.min(Math.max(Math.ceil(height / 80), 1), 8);

    // Check if width is valid (1-12)
    if (width < 1 || width > 12) {
      return {
        valid: false,
        message: `Width must be between 1 and 12 columns. Current: ${width}`,
      };
    }

    // Check if height is reasonable (minimum 50px, maximum ~640px for 8 rows)
    if (height < 50) {
      return {
        valid: false,
        message: `Height too small. Minimum is 50px. Current: ${height}px`,
      };
    }

    if (height > 640) {
      return {
        valid: false,
        message: `Height too large. Maximum is 640px (8 rows). Current: ${height}px\nThis will cause overflow on the display.`,
      };
    }

    // Warning for very tall blocks that might not fit well
    if (rowSpan >= 6) {
      return {
        valid: true,
        message: `⚠️ Large block: Takes ${rowSpan} rows. May limit layout flexibility.`,
      };
    }

    return { valid: true, message: "Dimensions OK" };
  };

  const updateBlock = async (updatedBlock: ContentBlock) => {
    if (!updatedBlock || !updatedBlock.id) {
      console.error("Attempted to update a block without an ID.", updatedBlock);
      return;
    }

    // Validate dimensions
    const validation = validateBlockDimensions(updatedBlock);
    if (!validation.valid) {
      alert(
        `❌ Invalid Block Dimensions:\n\n${validation.message}\n\nPlease adjust the width or height.`
      );
      return;
    }

    // Show warning for large blocks
    if (validation.message.includes("⚠️")) {
      const proceed = confirm(
        `${validation.message}\n\nDo you want to continue?`
      );
      if (!proceed) return;
    }

    try {
      // Ensure numeric fields are numbers
      const blockData = {
        ...updatedBlock,
        width: Number(updatedBlock.width) || 6, // Default if parsing fails
        height: Number(updatedBlock.height) || 200, // Default if parsing fails
        // Remove id from the data to be written to Firestore
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (blockData as any).id; // Firestore expects data without the ID field for setDoc/updateDoc

      // Type-specific sanitization/defaults before saving
      if (blockData.type === "table") {
        try {
          JSON.parse(blockData.rows); // Validate rows JSON
        } catch (e) {
          blockData.rows = "[]"; // Default to empty array if invalid
          console.warn(
            "Invalid JSON for table rows, defaulting to empty array.",
            e
          );
        }
      }
      if (blockData.type === "text") {
        blockData.content = blockData.content || "";
        blockData.textAlign = blockData.textAlign || "left";
      }
      if (blockData.type === "list") {
        blockData.items = blockData.items || [];
      }
      if (blockData.type === "news") {
        blockData.showNifty = blockData.showNifty || false;
        blockData.showWeather = blockData.showWeather || false;
      }
      if (blockData.type === "time") {
        blockData.format = blockData.format || "12h";
        blockData.showSeconds = blockData.showSeconds || false;
      }
      if (blockData.type === "carousel") {
        blockData.transitionInterval =
          Number(blockData.transitionInterval) || 5000;
      }

      const blockRef = doc(db, "blocks", updatedBlock.id);
      await setDoc(blockRef, blockData, { merge: true }); // merge:true is good practice

      // Update local state
      setBlocks((prevBlocks) =>
        prevBlocks.map((block) =>
          block.id === updatedBlock.id
            ? ({ ...updatedBlock, ...blockData, id: block.id } as ContentBlock)
            : block
        )
      );

      // Close dialog and clear editing state
      setEditingBlock(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating block:", error);
    }
  };

  const handleDeleteClick = (id: string) => {
    const block = blocks.find((block) => block.id === id);
    if (!block) return;
    setBlockToDelete(block);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!blockToDelete) return;

    try {
      const deletedPosition = blockToDelete.position;
      await deleteDoc(doc(db, "blocks", blockToDelete.id));

      // Position updates will be complex if not handled by a transaction or cloud function.
      // For simplicity, the onSnapshot listener sorting by position should eventually correct the view.
      // Manual re-ordering after delete:
      if (deletedPosition !== undefined) {
        const updates = blocks
          .filter(
            (b) =>
              b.id !== blockToDelete.id &&
              b.position !== undefined &&
              b.position > deletedPosition
          )
          .map((b) =>
            setDoc(
              doc(db, "blocks", b.id),
              { position: b.position! - 1 },
              { merge: true }
            )
          );
        await Promise.all(updates);
      }

      // Close the confirmation dialog
      setDeleteConfirmOpen(false);
      setBlockToDelete(null);
    } catch (error) {
      console.error("Error deleting block:", error);
      alert("Error deleting block. Please try again.");
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setBlockToDelete(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newBlocksArray = arrayMove(blocks, oldIndex, newIndex);

      // Update positions in Firebase
      const updatePromises = newBlocksArray.map((block, index) => {
        const blockRef = doc(db, "blocks", block.id);
        return setDoc(blockRef, { position: index }, { merge: true });
      });
      try {
        await Promise.all(updatePromises);
        // setBlocks will be called by onSnapshot, reflecting the new order from Firestore
      } catch (error) {
        console.error("Error updating positions after drag:", error);
        // Optionally revert local state or show error
      }
    }
  };

  // Global settings save, image upload/remove handlers (assuming they are correct)
  const updateGlobalSettings = async () => {
    try {
      const settingsRef = doc(db, "settings", "global");
      await setDoc(settingsRef, globalSettings, { merge: true });
      alert("Global settings saved!");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Error saving settings.");
    }
  };

  const uploadBackgroundImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const response = await fetch("/api/upload-background", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64String }),
        });
        const data = await response.json();
        if (response.ok) {
          setGlobalSettings((prev) => ({
            ...prev,
            backgroundImageUrl: data.backgroundImageUrl,
            backgroundS3Key: data.backgroundS3Key,
          }));
          // Also update Firestore directly here for global settings
          await updateGlobalSettings(); // This will save all current globalSettings
          alert("Background image uploaded and settings saved!");
        } else {
          console.error("Upload failed:", data.message);
          alert(`Failed to upload background image: ${data.message}`);
        }
      } catch (error) {
        console.error("Error uploading background image:", error);
        alert("Error uploading background image.");
      }
    };
    reader.readAsDataURL(file);
  };

  const removeBackgroundImage = async () => {
    if (!globalSettings.backgroundS3Key && !globalSettings.backgroundImageUrl) {
      alert("No background image to remove.");
      return;
    }
    try {
      if (globalSettings.backgroundS3Key) {
        // Only attempt delete if S3 key exists
        const response = await fetch("/api/upload-background", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key: globalSettings.backgroundS3Key }),
        });
        if (!response.ok) {
          const data = await response.json();
          alert(`Failed to remove background image from S3: ${data.message}`);
          // Optionally, decide if you still want to clear it from settings
        }
      }
      setGlobalSettings((prev) => ({
        ...prev,
        backgroundImageUrl: "",
        backgroundS3Key: "",
      }));
      await updateGlobalSettings(); // Save the cleared settings
      alert("Background image removed and settings saved!");
    } catch (error) {
      console.error("Error removing background image:", error);
      alert("Error removing background image.");
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Billboard Grid Preview - Exact Match to Display Layout */}
      <div
        className="w-full aspect-[9/16] rounded-xl mb-8 overflow-hidden shadow-2xl border-4 border-gray-200"
        style={{
          backgroundColor: globalSettings.backgroundColor,
          backgroundImage: globalSettings.backgroundImageUrl
            ? `url(${globalSettings.backgroundImageUrl})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full flex flex-col p-3 relative">
            {/* Semi-transparent overlay for better text contrast */}
            {globalSettings.backgroundImageUrl && (
              <div className="absolute inset-0 bg-black/30 pointer-events-none backdrop-blur-[1px]" />
            )}

            {/* Header Section - Matching Display Exactly */}
            <div className="text-center relative z-10 mb-2 shrink-0">
              <p className="text-xl font-light text-white/90 mb-1 drop-shadow-lg truncate">
                {globalSettings.headerText}
              </p>
              <h1 className="text-3xl font-bold text-white leading-tight tracking-tight drop-shadow-xl line-clamp-2">
                {globalSettings.title}
              </h1>
            </div>

            {/* Grid Preview - EXACT MATCH to DisplayLayout calculations */}
            <div className="flex-1 relative z-10 min-h-0">
              <div
                className="w-full h-full grid auto-rows-fr"
                ref={containerRef}
                style={{
                  gridTemplateColumns: "repeat(12, 1fr)",
                  gap: "0.5rem",
                  gridAutoFlow: "dense",
                }}
              >
                <SortableContext
                  items={blocks.map((block) => block.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {blocks.map((block) => {
                    // EXACT SAME calculations as DisplayLayout
                    const colSpan = Math.min(Math.max(block.width || 4, 1), 12);
                    const heightValue = block.height || 200;
                    const rowSpan = Math.min(
                      Math.max(Math.ceil(heightValue / 80), 1),
                      8
                    );

                    const customStyle = {
                      gridColumn: `span ${colSpan}`,
                      gridRow: `span ${rowSpan}`,
                      minHeight: 0,
                      minWidth: 0,
                      backgroundColor: block.backgroundColor || "#ffffff",
                      color: block.textColor || "#000000",
                    };

                    return (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        theme={block.theme || theme}
                        customStyle={customStyle}
                        onEdit={(b) => {
                          setEditingBlock(b);
                          setIsDialogOpen(true);
                        }}
                        onDelete={handleDeleteClick}
                      />
                    );
                  })}
                </SortableContext>
              </div>
            </div>
          </div>
        </DndContext>
      </div>

      {/* ... (Bottom Controls: SwipeButton, Add New Block DialogTrigger) ... */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex justify-between gap-4 w-[calc(100%-48px)]">
        <SwipeButton
          label="Swipe right for live view --->" // Assuming this is the intended navigation
          className="w-[75%] text-gray-400 h-16 rounded-full"
          onSwipeRight={() => router.push("/admin/preview")} // Or your live view page
          onSwipeLeft={() => console.log("Swiped left - no action defined")}
        />

        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="w-16 text-white bg-black h-16 rounded-full"
              variant={"secondary"}
            >
              <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-10/12 text-black rounded-lg bg-white overflow-auto h-[90vh]">
            {/* Global Settings Form */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-lg font-semibold mb-4">Display Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label>Background Color</Label>
                  <ColorPicker
                    value={globalSettings.backgroundColor}
                    onChange={(color) =>
                      setGlobalSettings({
                        ...globalSettings,
                        backgroundColor: color,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Background Image</Label>
                  <div className="mt-2 flex flex-col gap-2">
                    {globalSettings.backgroundImageUrl && (
                      <div className="relative w-full h-40 mb-2">
                        <Image
                          src={globalSettings.backgroundImageUrl}
                          alt="Background Preview"
                          fill
                          className="object-cover rounded-md"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                          onClick={removeBackgroundImage}
                        >
                          {" "}
                          <X className="h-4 w-4" />{" "}
                        </Button>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={uploadBackgroundImage}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500">
                      Recommended: High resolution image.
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Header Text</Label>
                  <Input
                    value={globalSettings.headerText}
                    onChange={(e) =>
                      setGlobalSettings({
                        ...globalSettings,
                        headerText: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Textarea
                    value={globalSettings.title}
                    onChange={(e) =>
                      setGlobalSettings({
                        ...globalSettings,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <Button onClick={updateGlobalSettings}>Save Settings</Button>
              </div>
            </div>

            {/* Add New Block Buttons */}
            <h3 className="text-lg font-semibold mb-4">Add New Block</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => addNewBlock("text")}>Text Block</Button>
              <Button onClick={() => addNewBlock("list")}>List Block</Button>
              <Button onClick={() => addNewBlock("weather")}>
                Weather Block
              </Button>
              <Button onClick={() => addNewBlock("time")}>Time Block</Button>
              <Button onClick={() => addNewBlock("staff")}>Staff Block</Button>
              <Button onClick={() => addNewBlock("news")}>News Block</Button>
              <Button onClick={() => addNewBlock("table")}>Table Block</Button>
              <Button onClick={() => addNewBlock("carousel")}>
                Image/Carousel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingBlock(null); // Clear editing block on close
        }}
      >
        <DialogContent className="sm:max-w-[425px] overflow-auto h-[90vh]">
          {editingBlock && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingBlock.title}
                  onChange={(e) =>
                    setEditingBlock((prev) =>
                      prev ? { ...prev, title: e.target.value } : null
                    )
                  }
                />
              </div>

              {/* Content field based on block type */}
              {editingBlock.type === "text" && (
                <div className="space-y-4">
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={(editingBlock as TextField).content}
                      onChange={(e) =>
                        setEditingBlock({
                          ...editingBlock,
                          content: e.target.value,
                        } as TextField)
                      }
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label>Text Alignment</Label>
                    <Select
                      value={(editingBlock as TextField).textAlign || "left"}
                      onValueChange={(value) =>
                        setEditingBlock({
                          ...editingBlock,
                          textAlign: value as "left" | "center" | "right",
                        } as TextField)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select alignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {editingBlock.type === "image" && (
                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={editingBlock.imageUrl}
                    onChange={(e) =>
                      setEditingBlock({
                        ...editingBlock,
                        imageUrl: e.target.value,
                      } as ImageField)
                    }
                  />
                </div>
              )}

              {/* Common fields: Width and Height with new input handling */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Width (1-12 cols)</Label>
                  <Input
                    type="number"
                    value={widthInputValue}
                    onChange={(e) => setWidthInputValue(e.target.value)}
                    onBlur={(e) => {
                      const rawValue = e.target.value;
                      let finalWidth = 6; // Default width
                      if (rawValue === "") {
                        finalWidth = 6; // Or specific minimum if cleared
                      } else {
                        const numValue = parseInt(rawValue, 10);
                        if (!isNaN(numValue)) {
                          finalWidth = Math.max(1, Math.min(numValue, 12));
                        } else {
                          finalWidth = editingBlock?.width || 6; // Revert to current or default if invalid
                        }
                      }
                      setEditingBlock((prev) =>
                        prev ? { ...prev, width: finalWidth } : null
                      );
                      setWidthInputValue(String(finalWidth));
                    }}
                    placeholder="1-12"
                  />
                </div>
                <div>
                  <Label>Height (px)</Label>
                  <Input
                    type="number"
                    value={heightInputValue}
                    onChange={(e) => setHeightInputValue(e.target.value)}
                    onBlur={(e) => {
                      const rawValue = e.target.value;
                      let finalHeight = 200; // Default height
                      if (rawValue === "") {
                        finalHeight = 200; // Or specific minimum if cleared
                      } else {
                        const numValue = parseInt(rawValue, 10);
                        if (!isNaN(numValue)) {
                          finalHeight = Math.max(50, numValue); // Min height 50px
                        } else {
                          finalHeight = editingBlock?.height || 200; // Revert
                        }
                      }
                      setEditingBlock((prev) =>
                        prev ? { ...prev, height: finalHeight } : null
                      );
                      setHeightInputValue(String(finalHeight));
                    }}
                    placeholder="e.g., 200"
                  />
                </div>
              </div>

              {/* Theme Controls */}
              <div className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <Select
                    value={editingBlock.theme}
                    onValueChange={(value) =>
                      setEditingBlock((prev) =>
                        prev
                          ? {
                              ...prev,
                              theme: value as "light" | "dark" | "system",
                            }
                          : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Background Color</Label>
                  <ColorPicker
                    value={
                      editingBlock.backgroundColor ||
                      (editingBlock.theme === "dark" ? "#000000" : "#ffffff")
                    }
                    onChange={(color) =>
                      setEditingBlock((prev) =>
                        prev ? { ...prev, backgroundColor: color } : null
                      )
                    }
                  />
                </div>

                <div>
                  <Label>Text Color</Label>
                  <ColorPicker
                    value={
                      editingBlock.textColor ||
                      (editingBlock.theme === "dark" ? "#ffffff" : "#000000")
                    }
                    onChange={(color) =>
                      setEditingBlock((prev) =>
                        prev ? { ...prev, textColor: color } : null
                      )
                    }
                  />
                </div>
              </div>

              {/* Block-specific controls */}
              {editingBlock.type === "time" && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={(editingBlock as TimeField).format === "12h"}
                      onCheckedChange={(checked: boolean) =>
                        setEditingBlock({
                          ...editingBlock,
                          format: checked ? "12h" : "24h",
                        } as TimeField)
                      }
                    />
                    <Label>12-hour format (with AM/PM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={(editingBlock as TimeField).showSeconds || false}
                      onCheckedChange={(checked: boolean) =>
                        setEditingBlock({
                          ...editingBlock,
                          showSeconds: checked,
                        } as TimeField)
                      }
                    />
                    <Label>Show seconds</Label>
                  </div>
                </div>
              )}

              {editingBlock.type === "news" && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingBlock.showNifty}
                      onCheckedChange={(checked: boolean) =>
                        setEditingBlock({
                          ...editingBlock,
                          showNifty: checked,
                        } as NewsField)
                      }
                    />
                    <Label>Show NIFTY50</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={(editingBlock as NewsField).showWeather || false}
                      onCheckedChange={(checked: boolean) =>
                        setEditingBlock({
                          ...editingBlock,
                          showWeather: checked,
                        } as NewsField)
                      }
                    />
                    <Label>Show Weather</Label>
                  </div>
                </div>
              )}

              {editingBlock.type === "list" && (
                <div className="space-y-4">
                  <div>
                    <Label>List Items</Label>
                    <div className="space-y-2">
                      {(editingBlock as ListField).items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            value={item}
                            onChange={(e) => {
                              const newItems = [
                                ...(editingBlock as ListField).items,
                              ];
                              newItems[index] = e.target.value;
                              setEditingBlock((prev) =>
                                prev
                                  ? ({ ...prev, items: newItems } as ListField)
                                  : null
                              );
                            }}
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const newItems = (
                                editingBlock as ListField
                              ).items.filter((_, i) => i !== index);
                              setEditingBlock((prev) =>
                                prev
                                  ? ({ ...prev, items: newItems } as ListField)
                                  : null
                              );
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingBlock((prev) =>
                            prev
                              ? ({
                                  ...prev,
                                  items: [...(prev as ListField).items, ""],
                                } as ListField)
                              : null
                          );
                        }}
                      >
                        Add Item
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>List Style</Label>
                    <Select
                      value={(editingBlock as ListField).listStyle || "bullet"}
                      onValueChange={(value) =>
                        setEditingBlock((prev) =>
                          prev
                            ? ({
                                ...prev,
                                listStyle: value as string,
                              } as ListField)
                            : null
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select list style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bullet">Bullet</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {editingBlock.type === "table" && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium mb-2">Table Dimensions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Columns</Label>
                        <Input
                          type="number"
                          value={tableColumnCountInput}
                          onChange={(e) =>
                            setTableColumnCountInput(e.target.value)
                          }
                          onBlur={(e) => {
                            const rawValue = e.target.value;
                            let newColumnCount: number;
                            if (rawValue === "") {
                              newColumnCount = 1; // Min 1 column
                            } else {
                              const parsed = parseInt(rawValue, 10);
                              newColumnCount =
                                isNaN(parsed) || parsed < 1 ? 1 : parsed;
                            }
                            setTableColumnCountInput(String(newColumnCount)); // Update string state

                            setEditingBlock((prev) => {
                              if (!prev || prev.type !== "table") return prev;
                              const currentHeaders = prev.headers;
                              const currentCount = currentHeaders.length;
                              if (newColumnCount === currentCount) return prev;

                              let parsedRows: string[][] = [];
                              try {
                                parsedRows = JSON.parse(prev.rows);
                                if (
                                  !Array.isArray(parsedRows) ||
                                  !parsedRows.every(Array.isArray)
                                )
                                  parsedRows = [];
                              } catch {
                                parsedRows = [];
                              }

                              let updatedHeaders = [...currentHeaders];
                              let updatedRows = parsedRows.map((r) => [...r]);

                              if (newColumnCount > currentCount) {
                                for (
                                  let i = currentCount;
                                  i < newColumnCount;
                                  i++
                                )
                                  updatedHeaders.push(`Header ${i + 1}`);
                                updatedRows = updatedRows.map((row) => {
                                  while (row.length < newColumnCount)
                                    row.push(`Cell ${row.length + 1}`);
                                  return row;
                                });
                              } else {
                                updatedHeaders = updatedHeaders.slice(
                                  0,
                                  newColumnCount
                                );
                                updatedRows = updatedRows.map((row) =>
                                  row.slice(0, newColumnCount)
                                );
                              }
                              return {
                                ...prev,
                                headers: updatedHeaders,
                                rows: JSON.stringify(updatedRows),
                              };
                            });
                          }}
                          placeholder="Min 1"
                        />
                      </div>
                      <div>
                        <Label>Rows</Label>
                        <Input
                          type="number"
                          value={tableRowCountInput}
                          onChange={(e) =>
                            setTableRowCountInput(e.target.value)
                          }
                          onBlur={(e) => {
                            const rawValue = e.target.value;
                            let newRowCount: number;
                            if (rawValue === "") {
                              newRowCount = 0; // Min 0 rows
                            } else {
                              const parsed = parseInt(rawValue, 10);
                              newRowCount =
                                isNaN(parsed) || parsed < 0 ? 0 : parsed;
                            }
                            setTableRowCountInput(String(newRowCount)); // Update string state

                            setEditingBlock((prev) => {
                              if (!prev || prev.type !== "table") return prev;
                              let parsedCurrentRows: string[][] = [];
                              try {
                                parsedCurrentRows = JSON.parse(prev.rows);
                                if (
                                  !Array.isArray(parsedCurrentRows) ||
                                  !parsedCurrentRows.every(Array.isArray)
                                )
                                  parsedCurrentRows = [];
                              } catch {
                                parsedCurrentRows = [];
                              }
                              const currentRowCount = parsedCurrentRows.length;
                              const columnCount = prev.headers.length;
                              if (newRowCount === currentRowCount) return prev;

                              let updatedRows = parsedCurrentRows.map((r) => [
                                ...r,
                              ]);
                              if (newRowCount > currentRowCount) {
                                for (
                                  let i = currentRowCount;
                                  i < newRowCount;
                                  i++
                                ) {
                                  updatedRows.push(
                                    Array(Math.max(0, columnCount))
                                      .fill("")
                                      .map((_, ci) => `Cell ${i + 1},${ci + 1}`)
                                  );
                                }
                              } else {
                                updatedRows = updatedRows.slice(0, newRowCount);
                              }
                              return {
                                ...prev,
                                rows: JSON.stringify(updatedRows),
                              };
                            });
                          }}
                          placeholder="Min 0"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Headers and Table Data inputs, ensure they use editingBlock correctly after dimensions change */}
                  <div>
                    <Label>Headers</Label>
                    {(editingBlock as TableField).headers.map(
                      (header, index) => (
                        <Input
                          key={index}
                          value={header}
                          className="my-1"
                          onChange={(e) => {
                            const newHeaders = [
                              ...(editingBlock as TableField).headers,
                            ];
                            newHeaders[index] = e.target.value;
                            setEditingBlock((prev) =>
                              prev
                                ? ({
                                    ...prev,
                                    headers: newHeaders,
                                  } as TableField)
                                : null
                            );
                          }}
                        />
                      )
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <Label>Table Data</Label>
                    <div className="overflow-x-auto border rounded mt-2">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="border p-1 text-xs">#</th>
                            {(editingBlock as TableField).headers.map(
                              (h, i) => (
                                <th key={i} className="border p-1 text-xs">
                                  {h}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            try {
                              const R = JSON.parse(
                                (editingBlock as TableField).rows
                              ) as string[][];
                              if (!Array.isArray(R) || !R.every(Array.isArray))
                                throw new Error("Invalid row data");
                              return R.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  <td className="border p-1 text-xs text-center">
                                    {rIdx + 1}
                                  </td>
                                  {(editingBlock as TableField).headers.map(
                                    (_, cIdx) => (
                                      <td key={cIdx} className="border p-0">
                                        <Input
                                          className="text-xs border-0 rounded-none focus:ring-0 h-full px-1 py-0.5"
                                          value={row[cIdx] || ""}
                                          onChange={(e) => {
                                            const nR = JSON.parse(
                                              (editingBlock as TableField).rows
                                            );
                                            nR[rIdx][cIdx] = e.target.value;
                                            setEditingBlock((prev) =>
                                              prev
                                                ? ({
                                                    ...prev,
                                                    rows: JSON.stringify(nR),
                                                  } as TableField)
                                                : null
                                            );
                                          }}
                                        />
                                      </td>
                                    )
                                  )}
                                </tr>
                              ));
                            } catch (e: unknown) {
                              return (
                                <tr>
                                  <td
                                    colSpan={
                                      (editingBlock as TableField).headers
                                        .length + 1
                                    }
                                    className="border p-2"
                                  >
                                    Error loading data {(e as Error).message}
                                    {JSON.stringify((e as Error).stack)}
                                  </td>
                                </tr>
                              );
                            }
                          })()}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Note: Adjust table dimensions first, then edit content as
                      needed.
                    </div>
                  </div>
                </div>
              )}

              {editingBlock.type === "carousel" && (
                <div className="space-y-4">
                  <div>
                    <Label>Transition Interval (ms)</Label>
                    <Input
                      type="number"
                      min={1000}
                      max={15000}
                      step={500}
                      value={
                        (editingBlock as CarouselField).transitionInterval ||
                        5000
                      }
                      onChange={(e) =>
                        setEditingBlock({
                          ...editingBlock,
                          transitionInterval: parseInt(e.target.value),
                        } as CarouselField)
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Interval between image transitions (1000ms = 1 second)
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Image Preview</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Images are loaded from the Images section. To add or
                      remove images, go to the Images management.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open("/admin/edit/images", "_blank")
                      }
                      className="w-full"
                    >
                      Manage Images
                    </Button>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <Button onClick={() => editingBlock && updateBlock(editingBlock)}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="sm:max-w-[425px] w-10/12 rounded-lg bg-background text-foreground border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <span className="text-3xl">⚠️</span>
              Delete Block?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3 pt-4">
              <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
                <p className="font-semibold text-red-900 dark:text-red-200">
                  Are you sure you want to delete this block?
                </p>
              </div>

              {blockToDelete && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Title:</span>
                    <span className="text-foreground font-semibold">
                      {blockToDelete.title}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Type:</span>
                    <span className="text-foreground font-semibold uppercase">
                      {blockToDelete.type}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-red-600 dark:text-red-400 font-semibold text-sm">
                ⚠️ This action cannot be undone!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel
              onClick={cancelDelete}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
            >
              Delete Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditDashboard;

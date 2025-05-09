"use client";
import SwipeButton from "@/components/swipe-button";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, GripVertical, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
      } catch (error) {
        console.error("Error parsing table rows:", error);
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
                      {cell}
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
      return <div>Carousel content</div>;
    default:
      return null;
  }
};

const SortableBlock = ({
  block,
  onEdit,
  onDelete,
  theme,
}: {
  block: ContentBlock;
  onEdit: (block: ContentBlock) => void;
  onDelete: (id: string) => void;
  theme: string | undefined;
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
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "content-block relative rounded-lg shadow-md p-4 edit-dashboard-block",
        `col-span-${block.width}`,
        block.theme || theme,
        "touch-none",
        isDragging ? "border-2 border-blue-500 bg-blue-50" : "",
        "hover:shadow-lg transition-shadow"
      )}
      {...attributes}
    >
      <div className="flex justify-between items-center mb-2">
        <div
          {...listeners}
          className="p-2 -m-2 cursor-grab rounded hover:bg-gray-100 active:cursor-grabbing"
        >
          <GripVertical className="text-gray-500" />
        </div>
        <h3 className="font-medium truncate mx-2">{block.title}</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(block)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(block.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        className="overflow-hidden"
        style={{ maxHeight: `${block.height - 50}px` }}
      >
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
  const { theme } = useTheme();
  const [globalSettings, setGlobalSettings] = useState({
    backgroundColor: "#000000",
    headerText: "Department of",
    title: "ELECTRONICS & COMPUTER ENGINEERING",
    backgroundImageUrl: "",
    backgroundS3Key: "",
  });

  // Load global settings from Firebase
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

      // Sort by position
      blocksList.sort((a, b) => {
        const posA = a.position !== undefined ? a.position : 999;
        const posB = b.position !== undefined ? b.position : 999;
        return posA - posB;
      });

      setBlocks(blocksList);
    };

    fetchBlocks();
  }, []);

  const addNewBlock = async (type: string) => {
    try {
      // Get the highest position value from existing blocks
      const maxPosition = blocks.reduce((max, block) => {
        return block.position !== undefined && block.position > max
          ? block.position
          : max;
      }, -1);

      const newBlock = {
        type,
        title: `New ${type} Block`,
        width: 6,
        height: 200,
        theme: "light",
        position: maxPosition + 1, // Set the position to the next available
        backgroundColor: "#ffffff",
        textColor: "#000000",
      };

      let blockData;
      switch (type) {
        case "text":
          blockData = {
            ...newBlock,
            content: "",
            textAlign: "left",
          } as Omit<TextField, "id">;
          break;

        case "list":
          blockData = {
            ...newBlock,
            items: ["New item 1", "New item 2"],
            listStyle: "bullet",
          } as Omit<ListField, "id">;
          break;

        case "news":
          blockData = {
            ...newBlock,
            showNifty: true,
            showWeather: true,
            backgroundColor: "#000000",
            textColor: "#ffffff",
          } as Omit<NewsField, "id">;
          break;

        case "time":
          blockData = {
            ...newBlock,
            format: "24h",
            showSeconds: true,
          } as Omit<TimeField, "id">;
          break;

        case "staff":
          blockData = {
            ...newBlock,
            positions: [],
            backgroundColor: "#ffffff",
            textColor: "#000000",
          } as Omit<StaffField, "id">;
          break;

        case "image":
          blockData = {
            ...newBlock,
            type: "image",
            imageUrl: "",
          } as Omit<ImageField, "id">;
          break;

        case "weather":
          blockData = {
            ...newBlock,
            type: "weather",
            location: "",
            unit: "celsius",
          } as Omit<WeatherField, "id">;
          break;

        case "table":
          blockData = {
            ...newBlock,
            type: "table",
            headers: ["Header 1", "Header 2", "Header 3"],
            rows: JSON.stringify([
              ["Cell 1,1", "Cell 1,2", "Cell 1,3"],
              ["Cell 2,1", "Cell 2,2", "Cell 2,3"],
            ]),
            backgroundColor: "#ffffff",
            textColor: "#000000",
          } as Omit<TableField, "id">;
          break;

        case "carousel":
          blockData = {
            ...newBlock,
            type: "carousel",
            transitionInterval: 5000, // 5 seconds default
            backgroundColor: "#000000",
            textColor: "#ffffff",
          } as Omit<CarouselField, "id">;
          break;

        default:
          blockData = newBlock as Omit<ContentBlock, "id">;
      }

      // Add to Firebase
      const docRef = await addDoc(collection(db, "blocks"), blockData);

      // Now use Firebase's document ID for the block
      const blockWithId = {
        ...blockData,
        id: docRef.id,
      } as ContentBlock;

      // Update local state
      setBlocks([...blocks, blockWithId]);
      setEditingBlock(blockWithId);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error adding block:", error);
    }
  };

  const updateBlock = async (updatedBlock: ContentBlock) => {
    try {
      // Create a clean data object without id
      const blockData = {
        type: updatedBlock.type,
        title: updatedBlock.title,
        width: Number(updatedBlock.width) || 6,
        height: Number(updatedBlock.height) || 200,
        theme: updatedBlock.theme || "light",
        backgroundColor: updatedBlock.backgroundColor || "#ffffff",
        textColor: updatedBlock.textColor || "#000000",
        position: updatedBlock.position,
      };

      // Add type-specific fields
      switch (updatedBlock.type) {
        case "text":
          Object.assign(blockData, {
            content: (updatedBlock as TextField).content,
            textAlign: (updatedBlock as TextField).textAlign || "left",
          });
          break;
        case "list":
          Object.assign(blockData, {
            items: (updatedBlock as ListField).items || [],
            listStyle: (updatedBlock as ListField).listStyle || "bullet",
          });
          break;
        case "news":
          Object.assign(blockData, {
            showNifty: (updatedBlock as NewsField).showNifty,
            showWeather: (updatedBlock as NewsField).showWeather,
          });
          break;
        case "table":
          Object.assign(blockData, {
            headers: (updatedBlock as TableField).headers || [],
            rows: (updatedBlock as TableField).rows || "[]",
          });
          break;
        case "carousel":
          Object.assign(blockData, {
            transitionInterval:
              (updatedBlock as CarouselField).transitionInterval || 5000,
          });
          break;
        // Add other cases as needed
      }

      // Update in Firebase
      const blockRef = doc(db, "blocks", updatedBlock.id);
      await setDoc(blockRef, blockData, { merge: true });

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

  const deleteBlock = async (id: string) => {
    try {
      // Get the block to be deleted
      const blockToDelete = blocks.find((block) => block.id === id);
      if (!blockToDelete || blockToDelete.position === undefined) {
        await deleteDoc(doc(db, "blocks", id));
        setBlocks(blocks.filter((block) => block.id !== id));
        return;
      }

      // Store position value in a local constant
      const deletedPosition = blockToDelete.position;

      // Delete the block
      await deleteDoc(doc(db, "blocks", id));

      // Get remaining blocks that need position updates
      const remainingBlocks = blocks.filter(
        (block) =>
          block.id !== id &&
          block.position !== undefined &&
          block.position > deletedPosition
      );

      // Update positions of blocks that came after the deleted one
      const updatePromises = remainingBlocks.map((block) => {
        const blockRef = doc(db, "blocks", block.id);
        const newPosition = (block.position || 0) - 1;
        return setDoc(blockRef, { position: newPosition }, { merge: true });
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      // Update local state
      setBlocks((prevBlocks) => {
        // Remove the deleted block
        const filteredBlocks = prevBlocks.filter((block) => block.id !== id);

        // Update positions
        return filteredBlocks.map((block) => {
          if (
            block.position !== undefined &&
            block.position > deletedPosition
          ) {
            return { ...block, position: block.position - 1 };
          }
          return block;
        });
      });
    } catch (error) {
      console.error("Error deleting block:", error);
    }
  };

  // Update the PointerSensor configuration for better mobile support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before activating drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Add this handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((prevBlocks) => {
        const oldIndex = prevBlocks.findIndex(
          (block) => block.id === active.id
        );
        const newIndex = prevBlocks.findIndex((block) => block.id === over.id);

        // Create new array with updated positions
        const newBlocks = arrayMove(prevBlocks, oldIndex, newIndex);

        // Assign sequential positions
        const blocksWithUpdatedPositions = newBlocks.map((block, index) => ({
          ...block,
          position: index,
        }));

        // Update positions in Firebase - batch updates for better performance
        (async () => {
          try {
            // Process each update
            const updatePromises = blocksWithUpdatedPositions.map(
              (block, index) => {
                const blockRef = doc(db, "blocks", block.id);
                return setDoc(blockRef, { position: index }, { merge: true });
              }
            );

            await Promise.all(updatePromises);
            console.log("All positions updated successfully");
          } catch (error) {
            console.error("Error updating positions:", error);
          }
        })();

        return blocksWithUpdatedPositions;
      });
    }
  };

  const updateGlobalSettings = async () => {
    try {
      const settingsRef = doc(db, "settings", "global");
      await setDoc(settingsRef, globalSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  // Add a function to handle background image upload
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64String }),
        });

        const data = await response.json();

        if (response.ok) {
          // Update local state
          setGlobalSettings({
            ...globalSettings,
            backgroundImageUrl: data.backgroundImageUrl,
            backgroundS3Key: data.backgroundS3Key,
          });

          // Show success message
          alert("Background image uploaded successfully!");
        } else {
          console.error("Upload failed:", data.message);
          alert("Failed to upload background image");
        }
      } catch (error) {
        console.error("Error uploading background image:", error);
        alert("Error uploading background image");
      }
    };

    reader.readAsDataURL(file);
  };

  // Add a function to remove background image
  const removeBackgroundImage = async () => {
    if (!globalSettings.backgroundImageUrl) return;

    try {
      const response = await fetch("/api/upload-background", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          s3Key: globalSettings.backgroundS3Key || "",
        }),
      });

      if (response.ok) {
        setGlobalSettings({
          ...globalSettings,
          backgroundImageUrl: "",
          backgroundS3Key: "",
        });
        alert("Background image removed successfully!");
      } else {
        alert("Failed to remove background image");
      }
    } catch (error) {
      console.error("Error removing background image:", error);
      alert("Error removing background image");
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Billboard Preview - 9:16 aspect ratio */}
      <div className="w-full aspect-[9/16] bg-gray-100 rounded-lg mb-8 overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[]}
        >
          <div
            className="grid grid-cols-12 gap-4 p-4 relative"
            ref={containerRef}
          >
            <SortableContext
              items={blocks.map((block) => block.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  theme={theme}
                  onEdit={(block) => {
                    setEditingBlock(block);
                    setIsDialogOpen(true);
                  }}
                  onDelete={deleteBlock}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex justify-between gap-4 w-[calc(100%-48px)]">
        <SwipeButton
          label="Swipe right for edits --->"
          className="w-[75%] text-gray-400 h-16 rounded-full"
          onSwipeRight={() => router.push("/admin/edit")}
          onSwipeLeft={() => console.log("Swiped left")}
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
          <DialogContent className="sm:max-w-[425px] w-10/12 text-black rounded-lg bg-white  overflow-auto h-[90vh]">
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
                          className="absolute top-2 right-2 opacity-80"
                          onClick={removeBackgroundImage}
                        >
                          <X className="h-4 w-4" />
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
                      Recommended: High resolution image for 4K display
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

                <Button onClick={() => updateGlobalSettings()}>
                  Save Settings
                </Button>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Add New Block</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => addNewBlock("text")}>Text Block</Button>
              <Button onClick={() => addNewBlock("image")}>Image Block</Button>
              <Button onClick={() => addNewBlock("list")}>List Block</Button>
              <Button onClick={() => addNewBlock("weather")}>
                Weather Block
              </Button>
              <Button onClick={() => addNewBlock("time")}>Time Block</Button>
              <Button onClick={() => addNewBlock("staff")}>Staff Block</Button>
              <Button onClick={() => addNewBlock("news")}>News Block</Button>
              <Button onClick={() => addNewBlock("table")}>Table Block</Button>
              <Button onClick={() => addNewBlock("carousel")}>
                Carousel Block
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] overflow-auto h-[90vh]">
          {editingBlock && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingBlock.title}
                  onChange={(e) =>
                    setEditingBlock({ ...editingBlock, title: e.target.value })
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

              {/* Common fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Width (1-12)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={editingBlock.width}
                    onChange={(e) =>
                      setEditingBlock({
                        ...editingBlock,
                        width: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Height (px)</Label>
                  <Input
                    type="number"
                    value={editingBlock.height}
                    onChange={(e) =>
                      setEditingBlock({
                        ...editingBlock,
                        height: parseInt(e.target.value),
                      })
                    }
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
                      setEditingBlock({
                        ...editingBlock,
                        theme: value as "light" | "dark" | "system",
                      })
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
                    value={editingBlock.backgroundColor || "#ffffff"}
                    onChange={(color) =>
                      setEditingBlock({
                        ...editingBlock,
                        backgroundColor: color,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Text Color</Label>
                  <ColorPicker
                    value={editingBlock.textColor || "#000000"}
                    onChange={(color) =>
                      setEditingBlock({
                        ...editingBlock,
                        textColor: color,
                      })
                    }
                  />
                </div>
              </div>

              {/* Block-specific controls */}
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
                        <div key={index} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) => {
                              const newItems = [
                                ...(editingBlock as ListField).items,
                              ];
                              newItems[index] = e.target.value;
                              setEditingBlock({
                                ...editingBlock,
                                items: newItems,
                              } as ListField);
                            }}
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newItems = (
                                editingBlock as ListField
                              ).items.filter((_, i) => i !== index);
                              setEditingBlock({
                                ...editingBlock,
                                items: newItems,
                              } as ListField);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingBlock({
                            ...editingBlock,
                            items: [...(editingBlock as ListField).items, ""],
                          } as ListField);
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
                        setEditingBlock({
                          ...editingBlock,
                          listStyle: value as "bullet" | "number" | "none",
                        } as ListField)
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
                        <div className="flex gap-2 items-center mt-1">
                          <Input
                            type="number"
                            min={1}
                            max={12}
                            value={(editingBlock as TableField).headers.length}
                            onChange={(e) => {
                              const newColumnCount = parseInt(e.target.value);
                              const currentCount = (editingBlock as TableField)
                                .headers.length;

                              // Parse current rows
                              let parsedRows: string[][] = [];
                              try {
                                parsedRows = JSON.parse(
                                  (editingBlock as TableField).rows
                                );
                              } catch (error) {
                                console.error("Error parsing rows:", error);
                                parsedRows = [];
                              }

                              if (newColumnCount > currentCount) {
                                // Add columns
                                const newHeaders = [
                                  ...(editingBlock as TableField).headers,
                                ];

                                for (
                                  let i = currentCount;
                                  i < newColumnCount;
                                  i++
                                ) {
                                  newHeaders.push(`Header ${i + 1}`);
                                  // Add new cell to each existing row
                                  parsedRows.forEach((row) =>
                                    row.push(`Cell ${row.length + 1}`)
                                  );
                                }

                                setEditingBlock({
                                  ...editingBlock,
                                  headers: newHeaders,
                                  rows: JSON.stringify(parsedRows),
                                } as TableField);
                              } else if (
                                newColumnCount < currentCount &&
                                newColumnCount >= 1
                              ) {
                                // Remove columns
                                const newHeaders = (
                                  editingBlock as TableField
                                ).headers.slice(0, newColumnCount);
                                const newRows = parsedRows.map((row) =>
                                  row.slice(0, newColumnCount)
                                );

                                setEditingBlock({
                                  ...editingBlock,
                                  headers: newHeaders,
                                  rows: JSON.stringify(newRows),
                                } as TableField);
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Rows</Label>
                        <div className="flex gap-2 items-center mt-1">
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={(() => {
                              try {
                                return JSON.parse(
                                  (editingBlock as TableField).rows
                                ).length;
                              } catch (error) {
                                console.log(error);

                                return 0;
                              }
                            })()}
                            onChange={(e) => {
                              const newRowCount = parseInt(e.target.value);

                              // Parse current rows
                              let parsedRows: string[][] = [];
                              try {
                                parsedRows = JSON.parse(
                                  (editingBlock as TableField).rows
                                );
                              } catch (error) {
                                console.error("Error parsing rows:", error);
                                parsedRows = [];
                              }

                              const currentRowCount = parsedRows.length;
                              const columnCount = (editingBlock as TableField)
                                .headers.length;

                              if (newRowCount > currentRowCount) {
                                // Add rows
                                const newRows = [...parsedRows];

                                for (
                                  let i = currentRowCount;
                                  i < newRowCount;
                                  i++
                                ) {
                                  // Create new row with empty cells for each column
                                  const newRow = Array(columnCount)
                                    .fill("")
                                    .map(
                                      (_, colIndex) =>
                                        `Cell ${i + 1},${colIndex + 1}`
                                    );
                                  newRows.push(newRow);
                                }

                                setEditingBlock({
                                  ...editingBlock,
                                  rows: JSON.stringify(newRows),
                                } as TableField);
                              } else if (
                                newRowCount < currentRowCount &&
                                newRowCount >= 1
                              ) {
                                // Remove rows
                                const newRows = parsedRows.slice(
                                  0,
                                  newRowCount
                                );

                                setEditingBlock({
                                  ...editingBlock,
                                  rows: JSON.stringify(newRows),
                                } as TableField);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Headers</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <div className="flex flex-wrap gap-2">
                        {(editingBlock as TableField).headers.map(
                          (header, index) => (
                            <div
                              key={index}
                              className="flex gap-1 items-center"
                            >
                              <Input
                                value={header}
                                onChange={(e) => {
                                  const newHeaders = [
                                    ...(editingBlock as TableField).headers,
                                  ];
                                  newHeaders[index] = e.target.value;
                                  setEditingBlock({
                                    ...editingBlock,
                                    headers: newHeaders,
                                  } as TableField);
                                }}
                                className="w-[120px]"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-center mb-3">
                      <Label>Table Data</Label>
                    </div>
                    <div className="overflow-x-auto border rounded">
                      <table className="w-full border-collapse">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border p-2 text-center w-12">#</th>
                            {(editingBlock as TableField).headers.map(
                              (header, index) => (
                                <th
                                  key={index}
                                  className="border p-2 text-center"
                                >
                                  {header}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            try {
                              const parsedRows = JSON.parse(
                                (editingBlock as TableField).rows
                              );
                              return parsedRows.map(
                                (row: string[], rowIndex: number) => (
                                  <tr key={rowIndex}>
                                    <td className="border p-2 text-center font-medium">
                                      {rowIndex + 1}
                                    </td>
                                    {row.map(
                                      (cell: string, cellIndex: number) => (
                                        <td
                                          key={cellIndex}
                                          className="border p-1"
                                        >
                                          <Input
                                            value={cell}
                                            onChange={(e) => {
                                              try {
                                                const parsedRows = JSON.parse(
                                                  (editingBlock as TableField)
                                                    .rows
                                                );
                                                parsedRows[rowIndex][
                                                  cellIndex
                                                ] = e.target.value;
                                                setEditingBlock({
                                                  ...editingBlock,
                                                  rows: JSON.stringify(
                                                    parsedRows
                                                  ),
                                                } as TableField);
                                              } catch (error) {
                                                console.error(
                                                  "Error updating cell:",
                                                  error
                                                );
                                              }
                                            }}
                                            className="border-0 focus:ring-0"
                                          />
                                        </td>
                                      )
                                    )}
                                  </tr>
                                )
                              );
                            } catch (error) {
                              console.error(
                                "Error rendering table data:",
                                error
                              );
                              return (
                                <tr>
                                  <td
                                    colSpan={
                                      (editingBlock as TableField).headers
                                        .length + 1
                                    }
                                    className="border p-2"
                                  >
                                    Error loading table data
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
              <Button onClick={() => updateBlock(editingBlock)}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditDashboard;

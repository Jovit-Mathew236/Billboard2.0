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
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useTheme } from "next-themes";
import Image from "next/image";
import WeatherWidget from "@/components/weather-widget";
import TimeWidget from "@/components/time-widget";
import { v4 as uuidv4 } from "uuid";
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
}

type ContentBlock =
  | TextField
  | ImageField
  | ListField
  | WeatherField
  | TimeField
  | StaffField
  | NewsField;

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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "content-block relative rounded-lg shadow-md p-4",
        `col-span-${block.width}`,
        block.theme || theme,
        "touch-none",
        "hover:border-2 hover:border-blue-500"
      )}
      {...attributes}
    >
      <div className="flex justify-between items-center mb-2">
        <div {...listeners}>
          <GripVertical className="cursor-move text-gray-400" />
        </div>
        <h3 className="font-medium">{block.title}</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(block)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(block.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {renderBlockPreview(block)}
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
  });

  // Load saved blocks from localStorage/Firebase
  useEffect(() => {
    const fetchBlocks = async () => {
      const blocksCollection = collection(db, "blocks");
      const blocksSnapshot = await getDocs(blocksCollection);
      const blocksList = blocksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ContentBlock[];
      setBlocks(blocksList);
    };

    fetchBlocks();
  }, []);

  const addNewBlock = async (type: string) => {
    try {
      const newBlock = {
        id: uuidv4(),
        type,
        title: `New ${type} Block`,
        width: 6,
        height: 200,
        theme: "light",
        position: blocks.length,
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
          } as TextField;
          break;

        case "list":
          blockData = {
            ...newBlock,
            items: ["New item 1", "New item 2"],
            listStyle: "bullet",
          } as ListField;
          break;

        case "news":
          blockData = {
            ...newBlock,
            showNifty: true,
            backgroundColor: "#000000",
            textColor: "#ffffff",
          } as NewsField;
          break;

        case "time":
          blockData = {
            ...newBlock,
            format: "24h",
            showSeconds: true,
          } as TimeField;
          break;

        case "staff":
          blockData = {
            ...newBlock,
            positions: [],
            backgroundColor: "#ffffff",
            textColor: "#000000",
          } as StaffField;
          break;

        case "image":
          blockData = {
            ...newBlock,
            type: "image",
            imageUrl: "",
          } as ImageField;
          break;

        case "weather":
          blockData = {
            ...newBlock,
            type: "weather",
            location: "",
            unit: "celsius",
          } as WeatherField;
          break;

        default:
          blockData = newBlock as ContentBlock;
      }

      // Add to Firebase
      const docRef = await addDoc(collection(db, "blocks"), blockData);
      const blockWithId = { ...blockData, id: docRef.id };

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
      await deleteDoc(doc(db, "blocks", id));
      setBlocks(blocks.filter((block) => block.id !== id));
    } catch (error) {
      console.error("Error deleting block:", error);
    }
  };

  // Add these sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Add this handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((blocks) => {
        const oldIndex = blocks.findIndex((block) => block.id === active.id);
        const newIndex = blocks.findIndex((block) => block.id === over.id);

        const newBlocks = arrayMove(blocks, oldIndex, newIndex);

        // Update positions in Firebase
        newBlocks.forEach(async (block, index) => {
          const blockRef = doc(db, "blocks", block.id);
          await setDoc(blockRef, { position: index }, { merge: true });
        });

        return newBlocks;
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

  return (
    <div className="min-h-screen pb-32">
      {/* Billboard Preview - 9:16 aspect ratio */}
      <div className="w-full aspect-[9/16] bg-gray-100 rounded-lg mb-8 overflow-hidden">
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
          <DialogContent className="sm:max-w-[425px] w-10/12 text-black rounded-lg bg-white">
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
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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

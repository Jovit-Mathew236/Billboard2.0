"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/provider/authProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface UploadedImage {
  id: string;
  imageUrl: string;
  addedBy: string;
  addedByUid: string;
  uploadedAt: string;
  s3Key: string;
}

const formSchema = z.object({
  image: z.instanceof(File).optional(),
});

const ImageEdit = () => {
  const { toast } = useToast();
  const { user: currentUser, username } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/add-image");
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setUploadedImages(data.images);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: any
  ) => {
    if (e.target.files) {
      const file = e.target.files[0];
      field.onChange(file);
      setFiles((prevFiles) => [...prevFiles, file]);
    }
  };

  const handleDelete = async (id: string, s3Key: string) => {
    try {
      setDeleting(id);
      const response = await fetch("/api/add-image", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, s3Key }),
      });

      if (!response.ok) throw new Error("Failed to delete image");

      setUploadedImages((prev) => prev.filter((img) => img.id !== id));
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete image",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      let imageBase64 = "";
      if (data.image) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(data.image as File);
        });
      }

      const response = await fetch("/api/add-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageBase64,
          addedBy: username,
          addedByUid: currentUser!.uid,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to upload image");
      }

      const result = await response.json();
      setUploadedImages((prev) => [result, ...prev]);
      setFiles([]);
      form.reset();
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[85dvh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto min-h-[85dvh] relative pb-32">
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Preview of files to be uploaded */}
        {files.map((file, index) => (
          <div
            key={index}
            className="rounded-lg overflow-hidden shadow-md relative"
          >
            <Image
              src={URL.createObjectURL(file)}
              alt={file.name}
              width={800}
              height={525}
              className="h-28 w-full object-cover"
            />
            <div
              className="bg-red-500 h-10 flex items-center justify-center cursor-pointer absolute bottom-0 w-full"
              onClick={() => setFiles(files.filter((_, i) => i !== index))}
            >
              <Trash2 size={20} color="white" />
            </div>
          </div>
        ))}

        {/* Uploaded images */}
        {uploadedImages.map((image) => (
          <div
            key={image.id}
            className="rounded-lg overflow-hidden shadow-md relative"
          >
            <Image
              src={image.imageUrl}
              alt={`Uploaded by ${image.addedBy}`}
              width={800}
              height={525}
              className="h-28 w-full object-cover"
            />
            <div
              className="bg-red-500 h-10 flex items-center justify-center cursor-pointer absolute bottom-0 w-full"
              onClick={() => handleDelete(image.id, image.s3Key)}
            >
              {deleting === image.id ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Trash2 size={20} color="white" />
              )}
            </div>
          </div>
        ))}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-xl shadow-lg p-6 fixed bottom-0 left-1/2 -translate-x-1/2 max-w-4xl w-full"
        >
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, field)}
                    ref={fileInputRef}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-4 h-12 w-full rounded-2xl">
            Upload
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ImageEdit;

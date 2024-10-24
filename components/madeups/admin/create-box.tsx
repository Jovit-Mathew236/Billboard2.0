"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/provider/authProvider";

const FormSchema = z.object({
  theme_name: z.string().min(2, {
    message: "Theme name must be at least 2 characters.",
  }),
  font: z.string().min(2, {
    message: "Font must be selected.",
  }),
  primary_color: z.string().min(2, {
    message: "Primary color must be filled.",
  }),
  secondary_color: z.string().min(2, {
    message: "Secondary color must be filled.",
  }),
  accent_color: z.string().min(2, {
    message: "Accent color must be filled.",
  }),
  background_color: z.string().min(2, {
    message: "Background color must be filled.",
  }),
  text_color: z.string().min(2, {
    message: "Text color must be filled.",
  }),
  background_image: z.instanceof(File),
});
type ThemeFormValues = z.infer<typeof FormSchema>;
const defaultValues: Partial<ThemeFormValues> = {};

interface Font {
  family: string;
  variants: string[];
  subsets: string[];
}

export function CreateTheme() {
  const { toast } = useToast();
  const { user: currentUser, username } = useAuth();
  const [loading, setLoading] = useState(false);

  const [fonts, setFonts] = useState<Font[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: any
  ) => {
    if (e.target.files) {
      const file = e.target.files[0];
      field.onChange(file);

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const response = await fetch("/api/webfonts");
        if (!response.ok) {
          throw new Error("Failed to fetch fonts");
        }
        const data = await response.json();
        setFonts(data.font.items);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
        console.log(error);
      }
    };

    fetchFonts();
  }, [error]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    console.log(data); // Add this line for debugging
    setLoading(true); // Start loading state

    try {
      let imageBase64 = "";
      if (data.background_image) {
        // Convert image to Base64
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(data.background_image as File);
        });
      }

      const response = await fetch("/api/create-theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme_name: data.theme_name,
          font: data.font,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          accent_color: data.accent_color,
          background_color: data.background_color,
          text_color: data.text_color,
          background_image: imageBase64,
          addedBy: username,
          addedByUid: currentUser!.uid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      const result = await response.json();
      setLoading(false); // Stop loading state
      toast({
        title: "Registration completed successfully",
        description: "We've completed your volunteer registration.",
        variant: "default",
        className: "bg-primary text-primary-foreground",
      });
      console.log("Registration completed successfully:", result);

      setTimeout(() => {
        window.location.reload(); // Optional: reload the page after 2 seconds
      }, 2000);
    } catch (error) {
      setLoading(false); // Stop loading state in case of error
      toast({
        title: "Error creating user",
        description: "An error occurred while creating your account.",
        variant: "destructive",
      });
      console.error("Error creating user:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="theme_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme name</FormLabel>
              <FormControl>
                <Input placeholder="Theme name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="font"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fonts.map((font, i) => (
                    <SelectItem key={i} value={font.family}>
                      {font.family}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Color Fields */}
        <div className="grid grid-cols-2 gap-1">
          <FormField
            control={form.control}
            name="primary_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Color</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondary_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Color</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accent_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accent Color</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="background_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Color</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="text_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Color</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="background_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload a casual single photo of yours</FormLabel>
              <FormControl>
                <div
                  className="flex items-center justify-center w-full h-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition duration-200 bg-secondary"
                  onClick={() => fileInputRef.current!.click()} // Trigger file input on div click
                >
                  <span className="text-black">Click to upload an image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, field)} // Update handler to use the new function
                    className="hidden"
                    ref={fileInputRef}
                  />
                </div>
              </FormControl>
              <FormMessage />

              {imagePreview && ( // Render image preview if it exists
                <div className="mt-4">
                  <Image
                    src={imagePreview}
                    alt="Image preview"
                    width={200}
                    height={200}
                    className="rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </FormItem>
          )}
        />

        <Button type="submit">{loading ? "Creating..." : "Create"}</Button>
      </form>
    </Form>
  );
}

"use client";
import React, { useRef, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/provider/authProvider";
import Image from "next/image";

const formSchema = z.object({
  email: z.string().min(2, { message: "Enter a valid email." }),
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  role: z.enum(["admin", "superadmin", "faculty"]),
  image: z.instanceof(File).optional(), // Add image field
});

const Create = () => {
  const { user: currentUser, username } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State for image preview

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "admin",
      username: "",
    },
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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      let imageBase64 = "";
      if (data.image) {
        // Convert image to Base64
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(data.image as File);
        });
      }

      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          username: data.username,
          role: data.role,
          image: imageBase64,
          addedBy: username,
          addedByUid: currentUser!.uid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      const result = await response.json();
      console.log("User created successfully:", result);

      // Add success notification or redirect here
    } catch (error) {
      console.error("Error creating user:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };
  return (
    <div className="flex flex-col gap-9 justify-center items-center">
      <div className="w-full flex flex-col gap-4 items-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="bg-white rounded-xl py-16 px-10 w-full space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter email"
                      type="email"
                      className="bg-[#F1F1F1] text-black h-12 border-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter name"
                      type="text"
                      className="bg-[#F1F1F1] text-black h-12 border-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <LabelInputContainer>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <SelectTrigger className="">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {["admin", "superadmin", "faculty"].map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </LabelInputContainer>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Password"
                      type="password"
                      className="bg-[#F1F1F1] text-black h-12 border-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="flex justify-end">
                    <a className="font-thin text-gray-400 text-xs">
                      forget password
                    </a>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, field)} // Update handler to use the new function
                      className="bg-[#F1F1F1] text-black h-12 border-none"
                      ref={fileInputRef}
                    />
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
            {/* forget password */}
          </form>
        </Form>
        <div className="flex gap-4 justify-between w-11/12">
          <Button
            variant={"secondary"}
            onClick={() => {
              window.location.href = "/";
            }}
            className=" h-16 font-thin text-black text-md font-regular bottom-5 w-11/12 rounded-2xl"
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            className=" h-16 text-md font-thin font-regular bottom-5 w-11/12 rounded-2xl"
          >
            create
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Create;

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

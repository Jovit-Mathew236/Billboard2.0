"use client";
import React, { useRef } from "react";
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
// import Image from "next/image";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/config";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase/config"; // Import Firestore instance
import { doc, setDoc } from "firebase/firestore";
import { s3 } from "@/lib/awsConfig"; // Import your S3 config
import { useAuth } from "@/lib/provider/authProvider";
// import imageConversion from "image-conversion";

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
  //   const router = useRouter();
  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);

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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Step 1: Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        data.email,
        data.password
      );

      if (!userCredential) {
        throw new Error("User creation failed");
      }

      const user = userCredential.user;

      // Step 2: Prepare user details to save
      const userDetails = {
        username: data.username,
        email: data.email,
        role: data.role,
        addedBy: username,
        addedByUid: currentUser!.uid,
      };

      let imageUrl = "";
      if (data.image) {
        // Read the image as Base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result?.toString().split(",")[1]; // Extract Base64 part
          const response = await fetch("/api/convert-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: base64data }),
          });

          if (response.ok) {
            const result = await response.json();
            imageUrl = result.image;

            // Step 3: Upload to S3
            const params = {
              Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
              Key: `users/${user.uid}.webp`,
              Body: Buffer.from(result.image.split(",")[1], "base64"), // Convert back to Buffer
              ContentType: "image/webp",
            };

            const uploadResult = await s3.upload(params).promise();
            console.log("Image uploaded successfully");

            imageUrl = uploadResult.Location; // Get the uploaded image URL

            // Step 4: Save user details to Firestore
            await setDoc(doc(db, "users", user.uid), {
              ...userDetails,
              ...(imageUrl && { imageUrl }), // Add imageUrl if it exists
            });

            console.log(
              "User created and details added to Firestore:",
              userDetails
            );
          } else {
            console.error("Error converting image:", await response.text());
          }
        };

        reader.readAsDataURL(data.image); // Read the image as Base64
      } else {
        // If no image, save user details directly to Firestore
        await setDoc(doc(db, "users", user.uid), userDetails);
        console.log("User created without image:", userDetails);
      }
    } catch (error) {
      console.error("Error creating user or adding details:", error);
    }
  };

  return (
    <div className="flex flex-col gap-9 justify-center items-center">
      <div className="w-full flex flex-col gap-4 items-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="bg-white rounded-xl py-16 px-10 w-11/12 space-y-6"
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
                      onChange={(e) => {
                        if (e.target.files) {
                          field.onChange(e.target.files[0]);
                        }
                      }}
                      className="bg-[#F1F1F1] text-black h-12 border-none"
                      ref={fileInputRef}
                    />
                  </FormControl>
                  <FormMessage />
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

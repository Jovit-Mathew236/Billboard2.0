"use client";
import React from "react";
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
// import { useRouter } from "next/navigation";
// import { create } from "domain";
import { db } from "@/lib/firebase/config"; // Import Firestore instance
import { doc, setDoc } from "firebase/firestore";

const formSchema = z.object({
  email: z.string().min(2, {
    message: "Enter a valid email.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  role: z.enum(["admin", "superadmin", "faculty"]),
});

const Create = () => {
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
  //   useEffect(() => {
  //     const unsubscribe = auth.onAuthStateChanged((user) => {
  //       if (!user) {
  //         router.push("/login");
  //       }
  //     });
  //     return unsubscribe;
  //   }, [router]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        data.email,
        data.password
      );

      // Check if userCredential is defined
      if (!userCredential) {
        throw new Error("User creation failed");
      }

      // Get the user UID
      const user = userCredential.user;

      // Prepare user details to save
      const userDetails = {
        username: data.username,
        email: data.email,
        role: data.role,
      };

      // Add user details to Firestore
      await setDoc(doc(db, "users", user.uid), userDetails);

      console.log("User created and details added to Firestore:", userDetails);
    } catch (error) {
      console.error("Error creating user or adding details:", error);
    }
  };

  return (
    <div className="flex flex-col gap-9 justify-center items-center">
      {/* <h1 className="text-[#4C4C4C] font-semibold text-2xl text-center">
        Welcome to
        <br />
        <span className="bg-gradient-custom bg-clip-text text-transparent">
          Billboard App
        </span>
      </h1> */}
      {/* <Image
        src="/welcome.png"
        alt="welcome"
        width={2000}
        height={2000}
        className="w-[200px] h-auto"
      /> */}
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
            {/* forgent password */}
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

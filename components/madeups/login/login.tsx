"use client";
import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { signInWithEmail } from "@/lib/firebase/auth"; // Import your login function
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "@/lib/firebase/auth"; // Import the auth state listener

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Password must be at least 2 characters.",
  }),
});

const Login = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await signInWithEmail(values.username, values.password);
      router.push("/admin"); // Redirect after successful login
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setErrorMessage("Login failed. Please check your credentials."); // Handle error
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      if (authUser) {
        router.push("/admin"); // Redirect if user is already logged in
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="h-screen w-screen flex flex-col gap-9 justify-center items-center">
      <Image
        src="/welcome.png"
        alt="welcome"
        width={2000}
        height={2000}
        className="w-[200px] h-auto"
      />
      <div className="w-full flex flex-col gap-4 items-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="bg-white rounded-xl py-16 px-10 w-11/12 space-y-6"
          >
            {errorMessage && (
              <div className="text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter username"
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
                      Forgot password?
                    </a>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <div className="flex gap-4 justify-between w-11/12">
          <Button
            variant={"secondary"}
            onClick={() => {
              window.location.href = "/";
            }}
            className="h-16 font-thin text-black text-md font-regular bottom-5 w-11/12 rounded-2xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            className="h-16 text-md font-thin font-regular bottom-5 w-11/12 rounded-2xl"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;

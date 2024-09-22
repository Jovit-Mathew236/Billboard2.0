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
import { Input } from "@/components/ui/input";
import Image from "next/image";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Password must be at least 2 characters.",
  }),
});

const Login = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    window.location.href = "/admin";
    console.log(values);
  }
  return (
    <div className="bg-[#C9CFDB] h-screen w-screen flex flex-col gap-9 justify-center items-center">
      {/* <h1 className="text-[#4C4C4C] font-semibold text-2xl text-center">
        Welcome to
        <br />
        <span className="bg-gradient-custom bg-clip-text text-transparent">
          Billboard App
        </span>
      </h1> */}
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
            onClick={() => {
              window.location.href = "/";
            }}
            className=" h-16 bg-[#EFEFEF] font-thin text-black text-md font-regular bottom-5 w-11/12 rounded-2xl"
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            className=" h-16 text-md font-thin font-regular bottom-5 w-11/12 rounded-2xl"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;

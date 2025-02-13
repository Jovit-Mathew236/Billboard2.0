"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BellDot,
  ImageDownIcon,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import LogoutButton from "@/components/ui/logoutButton";
import { dp } from "@/lib/constants";
import Image from "next/image";
import { useAuth } from "@/lib/provider/authProvider";
import { useTheme } from "next-themes";

export default function HeaderButtons() {
  const { userImage } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="top-5 right-3 flex gap-2 justify-end px-6 py-4">
      {pathname !== "/admin" && (
        <div className="flex-1">
          <Button
            variant="primary"
            className="rounded-full p-0 w-[50px] h-[50px] place-self-start"
            onClick={() => router.back()}
          >
            <ArrowLeft className="text-primary-foreground" size={20} />
          </Button>
        </div>
      )}

      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="primary"
            className="rounded-full p-0 w-[50px] h-[50px]"
          >
            <Settings className="text-primary-foreground" size={20} />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-background">
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Settings</DrawerTitle>
              <DrawerDescription>Customize your experience</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-5 w-5" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      Dark Mode
                    </>
                  )}
                </Button>
              </div>
              <div className="border-t border-border/50" />
              <LogoutButton />
            </div>
            <DrawerFooter>
              <DrawerClose>
                <Button variant="outline" className="w-full">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"primary"}
            className="rounded-full p-0 w-[50px] h-[50px]"
          >
            <Settings color="#4C4C4C" size={20} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0">
          <LogoutButton />
        </PopoverContent>
      </Popover> */}
      <Button variant="primary" className="rounded-full p-0 w-[50px] h-[50px]">
        <BellDot className="text-primary-foreground" size={20} />
      </Button>
      <Button
        variant="primary"
        className="rounded-full p-0 w-[50px] h-[50px]"
        onClick={() => router.push("/admin/image")}
      >
        <ImageDownIcon className="text-primary-foreground" size={20} />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="primary"
            className="rounded-full p-0 w-[50px] h-[50px]"
          >
            <Image
              src={userImage || dp}
              width={500}
              height={500}
              alt="Picture of the user"
              className="rounded-full w-full h-full object-cover"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/admin/create")}
            >
              Add new user
            </Button>
          </DropdownMenuItem>
          {/* <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuItem>Subscription</DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

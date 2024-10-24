"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BellDot, ImageDownIcon, Settings } from "lucide-react";
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

export default function HeaderButtons() {
  const { userImage } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="top-5 right-3 flex gap-2 justify-end px-6 py-4">
      {pathname !== "/admin" && (
        <div className="flex-1">
          <Button
            variant={"primary"}
            className="rounded-full p-0 w-[50px] h-[50px] place-self-start"
            onClick={() => router.back()}
          >
            <ArrowLeft color="#4C4C4C" size={20} />
          </Button>
        </div>
      )}

      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant={"primary"}
            className="rounded-full p-0 w-[50px] h-[50px]"
          >
            <Settings color="#4C4C4C" size={20} />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-white">
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>
                This will logout your account.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <LogoutButton />
              <DrawerClose>
                <Button variant="outline" className="w-full">
                  Cancel
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
      <Button
        variant={"primary"}
        className="rounded-full p-0 w-[50px] h-[50px]"
      >
        <BellDot color="#4C4C4C" size={20} />
      </Button>
      <Button
        variant={"primary"}
        className="rounded-full p-0 w-[50px] h-[50px]"
        onClick={() => {
          router.push("/admin/image");
        }}
      >
        <ImageDownIcon color="#4C4C4C" size={20} />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"primary"}
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
              variant="outline"
              className="h-fit p-0 border-none m-0 w-fit bg-white"
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

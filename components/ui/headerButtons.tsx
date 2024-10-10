"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BellDot, Settings } from "lucide-react";
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

import LogoutButton from "@/components/ui/logoutButton";

export default function HeaderButtons() {
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
      ></Button>
    </div>
  );
}

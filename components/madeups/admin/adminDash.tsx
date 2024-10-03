import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

function AdminDash() {
  return (
    <>
      <div className="flex flex-col gap-10">
        <h1 className="text-3xl">
          Welcome <br />
          <b className="text-4xl text-bold">Mr. Giby Jose</b>
          <Image
            src="/pen.png"
            alt="pen"
            width={150}
            height={150}
            className="h-auto w-auto ml-20"
          />
        </h1>

        <div className="flex flex-col gap-8 w-full p-8 min-h-4 bg-white rounded-3xl">
          <div className="w-full max-w-full flex">
            <div className="flex flex-row w-[30%]">
              <p className="w-10 h-10 bg-cyan-200 rounded-full"></p>
              <p className="w-10 h-10 bg-slate-300 rounded-full -ml-4"></p>
              <p className="w-10 h-10 bg-orange-200 rounded-full -ml-4"></p>
            </div>
            <Button
              variant={"ghost"}
              className="text-bold text-gray-400 w-[40%]"
            >
              Manage Access
            </Button>
            <div className="flex flex-row gap-1 w-[30%]">
              <p className="w-10 h-10 bg-gradient-to-br from-indigo-500  to-pink-500 rounded-full"></p>
              <p className="w-10 h-10 bg-black rounded-full"></p>
            </div>
          </div>

          <div>
            <div className="h-full flex flex-row gap-8">
              <div className="flex flex-1 flex-col gap-10">
                <div className="text-light text-xs leading-3 text-gray-400">
                  <h1 className="text-3xl text-bold text-black var(--font-sf-ui-display-bold)">
                    100 <span className="text-sm text-gray-400">hrs</span>
                  </h1>{" "}
                  Server up time
                </div>
                <div className="text-light text-xs leading-3 text-gray-400">
                  <h1 className="text-3xl text-bold text-black var(--font-sf-ui-display-bold)">
                    5 <span className="text-sm text-gray-400"></span>
                  </h1>{" "}
                  Users with access
                </div>
              </div>
              <div className="h-[140px] w-[2px] bg-gray-400"></div>
              <div className="flex flex-1 flex-col gap-10">
                <div className="text-light text-xs leading-3 text-gray-400">
                  <h1 className="text-3xl text-bold text-black var(--font-sf-ui-display-bold)">
                    Good <span className="text-sm text-gray-400"></span>
                  </h1>{" "}
                  Api health status
                </div>
                <div className="text-light text-xs leading-3 text-gray-400">
                  <h1 className="text-3xl text-bold text-black var(--font-sf-ui-display-bold)">
                    7 <span className="text-sm text-gray-400"></span>
                  </h1>{" "}
                  Themes Available
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="h-[8px] w-[30%] bg-green-500 rounded-full"></div>
            <div className="h-[8px] w-[20%] bg-teal-300 rounded-full"></div>
            <div className="h-[8px] w-[20%] bg-gray-400 rounded-full"></div>
            <div className="h-[8px] w-[30%] bg-gray-800 rounded-full"></div>
          </div>
        </div>
        <Button className="h-20 rounded-full">Active Preview</Button>
      </div>
      <Button
        className="absolute bottom-8 w-[calc(100%-48px)] text-gray-400 h-20 rounded-full"
        variant={"secondary"}
      >
        swipe right for edits ---&gt;
      </Button>
    </>
  );
}

export default AdminDash;

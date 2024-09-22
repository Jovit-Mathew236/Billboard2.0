import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";

const GetStart = () => {
  return (
    <div className="w-screen">
      <Image
        src="/getstart.png"
        alt="splash"
        width={1024}
        height={1024}
        className="absolute h-screen w-auto"
      />
      <div className="flex place-content-center">
        <Button
          onClick={() => {
            window.location.href = "/login";
          }}
          className="absolute h-14 text-md text-gray-400 font-regular bottom-5 w-11/12 rounded-full"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default GetStart;

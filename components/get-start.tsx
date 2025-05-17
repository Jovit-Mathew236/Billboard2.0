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
        className="absolute h-screen w-screen object-cover"
      />
      <div className="flex place-content-center">
        {/* <p className="text-[#4C4C4C] absolute  bottom-28 text-3xl">
          Welcome to
          <br />
          <span>Billboard App</span>
        </p> */}
        <Image
          src="/getstarttext.png"
          alt="text"
          width={150}
          height={150}
          className="absolute bottom-24"
        />
        <Button
          onClick={() => {
            window.location.href = "/admin";
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

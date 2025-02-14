"use client"

import ChatArea from "@/app/components/Chat/ChatArea";
import InputBox from "@/app/components/InputBox";
import { useAtom } from "jotai";
import { isStartChatAtom, isSidebarVisibleAtom } from "@/app/lib/store";
import Image from "next/image";
import ChatHistory from "@/app/components/Chat/ChatHistory";
import ResearchArea from "@/app/components/Chat/ResearchArea";

const ChatText = () => {
  const [isStartChat,] = useAtom(isStartChatAtom);
  const [isSidebarVisible, setIsSidebarVisible] = useAtom(isSidebarVisibleAtom);

  return (
    <main className={`flex justify-center text-mainFont w-screen min-h-screen ${isSidebarVisible && "max-md:backdrop-blur-md"}`}>
      <ChatHistory />
      <div className={`flex flex-col flex-auto items-center mt-[72px] justify-center h-[calc(100vh-72px)] py-5 relative`}>
        <div className="flex flex-col h-full items-center justify-center w-full gap-2 px-2 md:px-4" onClick={() => setIsSidebarVisible(false)}>
          {!isStartChat ? (
            <div className="text-3xl font-bold whitespace-nowrap w-full flex flex-col items-center">
              <div className="flex items-end justify-center border-none outline-none focus:outline-none">
                <Image
                  src="/image/EDITH_logo_png.png"
                  alt="logo"
                  width={300}
                  height={300}
                  className="h-16 w-auto"
                />
              </div>
              <span className="hidden sm:block text-[24px] text-[#777777] mt-[45px] text-center">
                Every Day I&apos;m Theoretically Human
              </span>
              <InputBox />
            </div>
          ) : (
            <>
              <ChatArea />
            </>
          )}
          {isStartChat && <InputBox />}
        </div>
        <ResearchArea />
      </div>
    </main>
  );
};

export default ChatText;
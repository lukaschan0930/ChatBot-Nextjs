"use client"

import { notFound } from "next/navigation";
import { useState } from "react";
import { useAtom } from "jotai";
import { isSidebarVisibleAtom, isStartChatAtom, roboActiveChatAtom } from "@/app/lib/store";
import Image from "next/image";
import RoboInputBox from "@/app/components/innovation/robochat/RoboInputBox";
import RoboChatArea from "@/app/components/innovation/robochat/RoboChatArea";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import ShadowBtn from "@/app/components/ShadowBtn";
import RoboCodeViewer from "@/app/components/innovation/robochat/RoboCodeViewer";

const RoboChat = () => {
    notFound();
    
    const [, setIsSidebarVisible] = useAtom(isSidebarVisibleAtom);
    const [isStartChat,] = useAtom(isStartChatAtom);
    const [roboActiveChat,] = useAtom(roboActiveChatAtom);
    const [fullScreen, setFullScreen] = useState(false);

    return (
        <main className={`flex justify-center text-mainFont w-screen min-h-screen`}>
            <div className={`flex flex-auto items-center mt-[72px] justify-center h-[calc(100vh-72px)] py-5 relative w-full px-6`}>
                <div
                    className={`flex flex-col h-full items-center justify-center gap-2 ${roboActiveChat ? fullScreen ? "w-0 opacity-0 px-0" : "w-fit opacity-100 px-2 md:px-4" : "w-full opacity-100 px-2 md:px-4"} transition-all duration-300 ease-in-out`}
                    onClick={() => setIsSidebarVisible(false)}
                >
                    {!isStartChat ? (
                        <div className="text-3xl font-bold whitespace-nowrap w-full max-sm:h-full flex flex-col items-center justify-center">
                            <div className="flex flex-col items-center justify-center max-sm:flex-auto">
                                <div className="flex items-end justify-center border-none outline-none focus:outline-none">
                                    <Image
                                        src="/image/logo-chat.png"
                                        alt="logo"
                                        width={300}
                                        height={300}
                                        className="h-[60px] sm:h-[92px] w-auto"
                                    />
                                </div>
                                <span className="text-[16px] sm:text-[24px] text-white mt-6 text-center mb-[60px]">
                                    Turn your idea into an app
                                </span>
                            </div>
                            <RoboInputBox />
                        </div>
                    ) : (
                        <>
                            <RoboChatArea  />
                        </>
                    )}
                    {isStartChat && <RoboInputBox />}
                </div>
                <div className={`flex items-center gap-4 h-full ${roboActiveChat ? "w-full opacity-100" : "w-0 opacity-0"} transition-all duration-300 ease-in-out`}>
                    <ShadowBtn className="w-6 h-10" mainClassName="w-6 h-10 flex items-center justify-center px-1" onClick={() => setFullScreen(!fullScreen)}>
                        {fullScreen ? <ChevronsRight /> : <ChevronsLeft />}
                    </ShadowBtn>
                    <RoboCodeViewer fullScreen={fullScreen} setFullScreen={setFullScreen} />
                </div>
            </div>
        </main>
    );
};

export default RoboChat;
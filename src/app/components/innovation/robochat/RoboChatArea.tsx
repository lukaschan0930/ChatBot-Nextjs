import { useEffect, useRef } from "react";
import UserPrompt from "@/app/components/Chat/UserPrompt";
import { ChatLog, IRoboChatHistory, IRoboChatLog } from "@/app/lib/interface";
import { sessionIdAtom, roboChatHistoryAtom, roboChatLogAtom, roboModelAtom } from "@/app/lib/store";
import { useAtom } from "jotai";
import Image from "next/image";
import { isSidebarVisibleAtom, progressAtom, researchLogAtom } from "@/app/lib/store";
import Progress from "@/app/components/ui/Progress";
import AccordionResearchArea from "@/app/components/Chat/AccordionResearchArea";
import { activeChatIdAtom } from "@/app/lib/store";
import ProgressSite from "@/app/assets/progressSite";
import RoboResponse from "./RoboResponse";

const RoboChatArea = () => {
    const [roboChatHistory,] = useAtom(roboChatHistoryAtom);
    const [roboChatLog,] = useAtom(roboChatLogAtom);
    const [roboModel,] = useAtom(roboModelAtom);
    const [progress,] = useAtom(progressAtom);
    const [sessionId,] = useAtom(sessionIdAtom);
    const [researchLog,] = useAtom(researchLogAtom);
    const chatLogEndRef = useRef<HTMLDivElement>(null);
    const [, setIsSidebarVisible] = useAtom(isSidebarVisibleAtom);
    const [activeChatId,] = useAtom(activeChatIdAtom);

    useEffect(() => {
        if (chatLogEndRef.current) {
            chatLogEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: 'end',
            })
        }
    }, [roboChatLog]);

    return (
        <div className="flex flex-col flex-auto w-full gap-6 overflow-y-auto items-center px-2 mt-8" onClick={() => setIsSidebarVisible(false)}>
            {roboChatLog && roboChatLog.length > 0 && roboChatLog.map((chat: IRoboChatLog, id: number) => (
                chat.role === "user" ? 
                <UserPrompt prompt={chat.prompt || ""} fileUrls={[]} key={id} />
                :
                <div key={id} className="flex flex-col w-full gap-6 lg:max-w-[700px] px-0 md:px-4">
                    <div className="flex justify-start flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-lg border border-gray-500 bg-[#181818] relative`}>
                                <Image
                                    src="/image/logo-chat.png"
                                    alt="chat loading"
                                    width={100}
                                    height={100}
                                    className={`w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
                                />
                            </div>
                            {
                                !chat.content &&
                                <>
                                    <div className="loading-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </>
                            }
                        </div>
                        {
                            !chat.content ?
                            <div className="flex flex-col w-full items-start gap-2 mb-4">
                                <p className="text-2xl">EDITH is thinking...</p>
                            </div> :
                            <RoboResponse message={chat} content={chat.content} version={Math.floor(id / 2) + 1} />
                        }
                    </div>
                </div>
            ))}
            <div ref={chatLogEndRef} />
        </div>
    );
};

export default RoboChatArea;
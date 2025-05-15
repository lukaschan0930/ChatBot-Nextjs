import { useEffect, useRef } from "react";
import UserPrompt from "./UserPrompt";
import { ChatLog } from "@/app/lib/interface";
import Response from "./Response";
import { chatLogAtom, chatTypeAtom, sessionIdAtom } from "@/app/lib/store";
import { useAtom } from "jotai";
import Image from "next/image";
import { isSidebarVisibleAtom, progressAtom, researchLogAtom } from "@/app/lib/store";
import Progress from "@/app/components/ui/Progress";
import AccordionResearchArea from "./AccordionResearchArea";
import { activeChatIdAtom } from "@/app/lib/store";
import ProgressSite from "@/app/assets/progressSite";

const ChatArea = () => {
  const [chatLog,] = useAtom(chatLogAtom);
  const [chatType,] = useAtom(chatTypeAtom);
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
  }, [chatLog]);

  return (
    <div className="flex flex-col flex-auto w-full gap-6 overflow-y-auto items-center px-2 mt-8" onClick={() => setIsSidebarVisible(false)}>
      {chatLog && chatLog.length > 0 && chatLog.map((chat: ChatLog, id: number) => (
        <div key={id} className="flex flex-col w-full gap-6 lg:max-w-[700px] px-0 md:px-4">
          <UserPrompt prompt={chat.prompt} />
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
                ((!chat.response || chat.response === null) && chatLog.length - 1 === id) &&
                <>
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </>
              }
            </div>
            <div className="flex flex-col w-full items-start">
              {
                ((!chat.response || chat.response === null) && chatLog.length - 1 === id) &&
                <>
                  {chat.response}
                  <div className="flex flex-col w-full items-start gap-2 mb-4">
                    <p className="text-2xl">EDITH is thinking...</p>
                    {
                      (chatType == 1 || chat.chatType == 1) &&
                      <>
                        <Progress progress={progress} />
                        <div className="max-sm:hidden mt-4 rounded-full bg-[#0E0E10] border border-[#25252799] shadow-input-box p-[6px] flex gap-2 items-center">
                          <ProgressSite />
                          <span className="text-mainFont text-sm">
                            {
                              researchLog.reduce((acc, step) => (
                                acc + step.sources.length
                              ), 0)
                            } web pages
                          </span>
                        </div>
                      </>
                    }
                  </div>
                </>
              }
              {
                chatLog.length - 1 === id && activeChatId === sessionId && (chatType == 1 || chat.chatType == 1) &&
                <AccordionResearchArea />
              }
              {
                chat.response &&
                <Response
                  response={chat.response}
                  timestamp={chat.timestamp}
                  last={chatLog.length - 1 === id}
                  inputToken={chat.inputToken}
                  outputToken={chat.outputToken}
                  outputTime={chat.outputTime}
                  chatType={chat.chatType}
                  fileUrls={chat.fileUrls}
                  model={chat.model}
                  points={chat.points}
                />
              }
            </div>
          </div>
        </div>
      ))}
      <div ref={chatLogEndRef} />
    </div>
  );
};

export default ChatArea;
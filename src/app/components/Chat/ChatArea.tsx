import { useEffect, useRef } from "react";
import UserPrompt from "./UserPrompt";
import { ChatLog } from "@/app/lib/interface";
import Response from "./Response";
import { chatLogAtom, chatTypeAtom, sessionIdAtom } from "@/app/lib/store";
import { useAtom } from "jotai";
import Image from "next/image";
import { isSidebarVisibleAtom, progressAtom } from "@/app/lib/store";
import Progress from "@/app/components/ui/Progress";
import AccordionResearchArea from "./AccordionResearchArea";
import { activeChatIdAtom } from "@/app/lib/store";

const ChatArea = () => {
  const [chatLog,] = useAtom(chatLogAtom);
  const [chatType,] = useAtom(chatTypeAtom);
  const [progress,] = useAtom(progressAtom);
  const [sessionId,] = useAtom(sessionIdAtom);
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
                      chatType == 1 &&
                      <Progress progress={progress} />
                    }
                  </div>
                </>
              }
              {chatLog.length - 1 === id && activeChatId === sessionId && chatType == 1 && <AccordionResearchArea />}
              {
                chat.response &&
                <Response
                  response={chat.response}
                  timestamp={chat.timestamp}
                  last={chatLog.length - 1 === id}
                  inputToken={chat.inputToken}
                  outputToken={chat.outputToken}
                  inputTime={chat.inputTime}
                  outputTime={chat.outputTime}
                  totalTime={chat.totalTime}
                  chatType={chat.chatType}
                  datasource={chat.datasource}
                  fileUrls={chat.fileUrls}
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
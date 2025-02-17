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
          <div className="flex justify-start flex-col md:flex-row gap-1 md:gap-0">
            <div className="flex items-center gap-2 md:gap-0 h-fit md:!w-14 md:!h-14 md:hidden">
              <Image src="/image/Edith_Logo.png" alt="chat loading" width={100} height={100} className={`${chatLog.length === id ? 'rotate' : ''} !w-10 !h-10 md:!w-14 md:!h-14 rounded-lg border-2 border-gray-500`} />
              <div className="text-lg md:hidden">EDITH</div>
            </div>
            <Image src="/image/Edith_Logo.png" alt="chat loading" width={100} height={100} className={`${chatLog.length === id ? 'rotate' : ''} w-14 h-14 hidden md:block rounded-lg border-2 border-gray-500`} />
            {/* <p className="text-2xl pl-4">{chatLog.length === id ? "Edith is thinking..." : "Answer"}</p> */}
            <div className="flex flex-col w-full items-start">
              {
                ((!chat.response || chat.response === null) && chatLog.length - 1 === id) &&
                <>
                {chat.response}
                <div className="flex flex-col w-full items-start gap-2 md:pl-4 mb-4">
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
                <Response response={chat.response} timestamp={chat.timestamp} last={chatLog.length - 1 === id} inputToken={chat.inputToken} outputToken={chat.outputToken} inputTime={chat.inputTime} outputTime={chat.outputTime} totalTime={chat.totalTime} chatType={chat.chatType} />
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
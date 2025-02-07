import { useEffect, useRef } from "react";
import UserPrompt from "./UserPrompt";
import { ChatLog } from "@/app/lib/interface";
import Response from "./Response";
import { chatLogAtom } from "@/app/lib/store";
import { useAtom } from "jotai";
import Image from "next/image";

const ChatArea = () => {
  const [chatLog,] = useAtom(chatLogAtom);
  const chatLogEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatLogEndRef.current) {
      chatLogEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: 'end',
      })
    }
  }, [chatLog]);

  return (
    <div className="flex flex-col flex-auto w-full gap-6 overflow-y-auto items-center mt-8">
      {chatLog && chatLog.length > 0 && chatLog.map((chat: ChatLog, id: number) => (
        <div key={id} className="flex flex-col w-full gap-6 lg:max-w-[800px] px-4">
          <UserPrompt prompt={chat.prompt} />
          <div className="flex justify-start">
            <Image src="/image/Edith_Logo.png" alt="chat loading" width={100} height={100} className={`${chatLog.length === id ? 'rotate' : ''} w-14 h-14 rounded-lg border-2 border-gray-500`} />
            {/* <p className="text-2xl pl-4">{chatLog.length === id ? "Edith is thinking..." : "Answer"}</p> */}
            {
              (chat.response) ?
                <Response response={chat.response} timestamp={chat.timestamp} last={chatLog.length - 1 === id} /> :
                chatLog.length - 1 === id && <p className="text-2xl pl-4">Edith is thinking...</p>
            }
          </div>
        </div>
      ))}
      <div ref={chatLogEndRef} />
    </div>
  );
};

export default ChatArea;

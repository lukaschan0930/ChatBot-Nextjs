import { toast } from "@/app/hooks/use-toast";
import React, { useEffect, useRef, useState } from "react";
import { FaArrowUp, FaSpinner } from "react-icons/fa6";
import { useAtom } from "jotai";
import { chatHistoryAtom, isStartChatAtom } from "@/app/lib/store";
import { chatLogAtom, sessionIdAtom, isStreamingAtom } from "@/app/lib/store";
import { generateSessionId, processChunkedString } from "@/app/lib/utils";
import { useSession } from "next-auth/react";

const TEXTAREA_MIN_HEIGHT = "36px";
const TEXTAREA_MAX_HEIGHT = "100px";

const InputBox = () => {
  const [isStartChat, setIsStartChat] = useAtom(isStartChatAtom);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messageOver, setMessageOver] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isStreaming, setIsStreaming] = useAtom(isStreamingAtom);
  // const [isOpen, setIsOpen] = useState<boolean>(false);
  const [textareaWidth, setTextareaWidth] = useState<number>(0);

  const [chatLog, setChatLog] = useAtom(chatLogAtom);
  const [sessionId, setSessionId] = useAtom(sessionIdAtom);
  const { data: session } = useSession();
  const [, setChatHistory] = useAtom(chatHistoryAtom);

  // Adjust text input area 's height
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = TEXTAREA_MIN_HEIGHT;
      textarea.style.height = `${Math.min(
        textarea.scrollHeight,
        parseInt(TEXTAREA_MAX_HEIGHT)
      )}px`;
    }
  };

  // Initialize text area's width on mount
  useEffect(() => {
    setTextareaWidth(textareaRef.current?.clientWidth || 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setInputPrompt(newPrompt);
    adjustTextareaHeight();
    // Observe if text is over a line
    const textWidth = newPrompt.length * 8;
    setMessageOver(textWidth > textareaWidth * 0.8);
  };

  const keyDownHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isStreaming) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClickSend = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = TEXTAREA_MIN_HEIGHT;
    }
    e.preventDefault();
    handleSendMessage();
  }

  const handleSendMessage = async () => {
    if (inputPrompt === "") {
      toast({
        variant: "destructive",
        title: 'Enter a message to send',
      });
      return;
    }
    setIsStreaming(true);
    setIsStartChat(true);
    try {
      await sendMessage(inputPrompt);
    } finally {
      setIsStreaming(false);
      setInputPrompt("");
      setMessageOver(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/chat/history");
      const data = await res.json();
      if (data.success) {
        setChatHistory(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const sendMessage = async (prompt: string) => {
    let requestSessionId = sessionId;
    if (!requestSessionId) {
      const newId = generateSessionId(
        session?.user?.email as string,
        Date.now().toString()
      );
      setSessionId(newId);
      requestSessionId = newId;
    }

    try {
      // Add an initial empty chat log entry for the prompt.
      setChatLog((prevChatLog) => {
        const newLog = prevChatLog && prevChatLog.length > 0 ? [...prevChatLog] : [];
        newLog.push({
          prompt,
          response: "",
          timestamp: Date.now().toString()
        });
        return newLog;
      });


      const res = await fetch("/api/chat/generateText", {
        method: "POST",
        body: JSON.stringify({ prompt, sessionId: requestSessionId, chatLog: chatLog.slice(-5), reGenerate: false }),
      });

      if (!res.body) {
        console.error("No response body");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullResponse = "";
      const buffer = "";
      const newChat = chatLog.length == 0 ? true : false;

      try {
        // Process each streamed chunk
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the incoming chunk and add it to our buffer.
          const chunk = decoder.decode(value, { stream: true });
          const { content, inputToken, outputToken, inputTime, outputTime } = await processChunkedString(chunk);
          fullResponse += content;

          setChatLog((prevChatLog) => {
            const newLog = prevChatLog && prevChatLog.length > 0 ? [...prevChatLog] : [];
            if (newLog.length > 0) {
              newLog[newLog.length - 1] = {
                prompt,
                response: fullResponse,
                timestamp: newLog[newLog.length - 1].timestamp,
                inputToken: inputToken,
                outputToken: outputToken,
                inputTime: inputTime,
                outputTime: outputTime
              };
            } else {
              newLog.push({
                prompt,
                response: fullResponse,
                timestamp: Date.now().toString(),
                inputToken: inputToken,
                outputToken: outputToken,
                inputTime: inputTime,
                outputTime: outputTime
              });
            }
            return newLog;
          });
        }

        if (buffer.trim() !== "") {
          const { content, inputToken, outputToken, inputTime, outputTime } = await processChunkedString(buffer);
          fullResponse += content;
          setChatLog((prevChatLog) => {
            const newLog = prevChatLog && prevChatLog.length > 0 ? [...prevChatLog] : [];
            if (newLog.length > 0) {
              newLog[newLog.length - 1] = {
                prompt,
                response: fullResponse,
                timestamp: newLog[newLog.length - 1].timestamp,
                inputToken: inputToken,
                outputToken: outputToken,
                inputTime: inputTime,
                outputTime: outputTime
              };
            } else {
              newLog.push({
                prompt,
                response: fullResponse,
                timestamp: Date.now().toString(),
                inputToken: inputToken,
                outputToken: outputToken,
                inputTime: inputTime,
                outputTime: outputTime
              });
            }
            return newLog;
          });
        }
      } finally {
        // Always release the reader's lock.
        reader.releaseLock();
        if (newChat) {
          fetchHistory();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatLog((prevChatLog) => {
        const newLog = prevChatLog && prevChatLog.length > 0 ? [...prevChatLog] : [];
        if (newLog.length > 0) {
          newLog[newLog.length - 1] = {
            prompt,
            response: "Failed to get response from server.",
            timestamp: newLog[newLog.length - 1].timestamp,
            inputToken: 0,
            outputToken: 0,
            inputTime: 0,
            outputTime: 0
          };
        } else {
          newLog.push({
            prompt,
            response: "Failed to get response from server.",
            timestamp: Date.now().toString(),
            inputToken: 0,
            outputToken: 0,
            inputTime: 0,
            outputTime: 0
          });
        }
        return newLog;
      });
      toast({
        variant: "destructive",
        title: 'Failed to get response from server.',
      });
    }
  };

  return (
    <div
      className={`${isStartChat ? "w-full" : ""
        } flex flex-nowrap sm:flex-wrap justify-between items-center gap-4 bg-inputBg p-[21px] border-secondaryBorder border rounded-lg w-full lg:max-w-[800px]`}
    >
      <div
        className={`${messageOver ? "order-0 basis-full" : "order-1"
          } flex-grow`}
      >
        <textarea
          ref={textareaRef}
          className={`${isStreaming ? '' : "text-mainFont"} bg-transparent pt-2 border-none w-full h-[36px] font-semibold text-base placeholder:text-subButtonFont overflow-y-hidden outline-none resize-none`}
          placeholder="Message EDITH..."
          onKeyDown={keyDownHandler}
          value={inputPrompt}
          onChange={(e) => handleChange(e)}
          translate="no"
          disabled={isStreaming}
          style={{
            minHeight: TEXTAREA_MIN_HEIGHT,
            maxHeight: TEXTAREA_MAX_HEIGHT,
          }}
        />
      </div>
      {/* <div className={`${messageOver ? "order-1" : "order-0"}`}>
        <DropdownMenu onOpenChange={setIsOpen}>
          <DropdownMenuTrigger className="flex items-center gap-2 bg-buttonBg p-0 border border-secondaryBorder hover:border-tertiaryBorder focus:border-secondaryBorder focus:outline-none rounded-full w-[62px] min-w-[62px] h-9">
            <Image src="/image/Edith_Logo.png" alt="chat logo" width={32} height={32} className="rounded-full w-8 h-8" />
            <FaChevronDown
              className={`${isOpen ? "rotate-180" : ""
                } transition-all duration-300 text-mainFont w-3 h-3`}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start"></DropdownMenuContent>
        </DropdownMenu>
      </div> */}
      <div className="order-2">
        <button
          className="flex items-center justify-center p-2 rounded-full border-secondaryBorder bg-buttonBg hover:border-tertiaryBorder focus:outline-none w-9 h-9 text-mainFont"
          onClick={(e) => handleClickSend(e)}
        >
          {isStreaming ? (
            <FaSpinner className="w-auto h-full animate-spin" />
          ) : (
            <FaArrowUp className="w-auto h-full" />
          )}
        </button>
      </div>

    </div>
  );
};

export default InputBox;

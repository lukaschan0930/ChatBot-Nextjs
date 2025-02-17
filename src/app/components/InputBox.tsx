import { toast } from "@/app/hooks/use-toast";
import React, { useEffect, useRef, useState } from "react";
import { FaArrowUp, FaSpinner } from "react-icons/fa6";
import { useAtom } from "jotai";
import { chatHistoryAtom, isStartChatAtom, researchStepAtom, activeChatIdAtom } from "@/app/lib/store";
import { chatLogAtom, sessionIdAtom, isStreamingAtom, researchLogAtom, chatTypeAtom, progressAtom, isResearchAreaVisibleAtom } from "@/app/lib/store";
import { generateSessionId, processChunkedString } from "@/app/lib/utils";
import { useSession } from "next-auth/react";
import { IResearchLog } from "@/app/lib/interface";

const TEXTAREA_MIN_HEIGHT = "36px";
const TEXTAREA_MAX_HEIGHT = "100px";

const InputBox = () => {
  const [isStartChat, setIsStartChat] = useAtom(isStartChatAtom);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messageOver, setMessageOver] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isStreaming, setIsStreaming] = useAtom(isStreamingAtom);
  const [, setResearchLog] = useAtom(researchLogAtom);
  const [, setResearchStep] = useAtom(researchStepAtom);
  const [chatType, setChatType] = useAtom(chatTypeAtom);
  const [, setProgress] = useAtom(progressAtom);
  const [, setIsResearchAreaVisible] = useAtom(isResearchAreaVisibleAtom);
  const [, setActiveChatId] = useAtom(activeChatIdAtom);
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
      setInputPrompt("");
      if (chatType === 0) {
        await sendMessage(inputPrompt, [], requestSessionId);
      } else {
        setProgress(0);
        await generateResearch(inputPrompt, requestSessionId);
      }
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

  const sendMessage = async (prompt: string, learnings: string[], requestSessionId: string, time = 0) => {
    if (learnings.length == 0) {
      setIsResearchAreaVisible(false);
    }

    try {
      // Add an initial empty chat log entry for the prompt.
      if (learnings.length == 0) {
        setChatLog((prevChatLog) => {
          const newLog = prevChatLog && prevChatLog.length > 0 ? [...prevChatLog] : [];
          newLog.push({
            prompt,
            response: "",
            timestamp: Date.now().toString(),
            chatType: chatType,
            inputToken: 0,
            outputToken: 0,
            inputTime: 0,
            outputTime: 0
          });
          console.log("Updated chatLog:", newLog);
          return newLog;
        });
      }

      const res = await fetch("/api/chat/generateText", {
        method: "POST",
        body: JSON.stringify({ prompt, sessionId: requestSessionId, chatLog: chatLog.slice(-5), reGenerate: false, learnings, time }),
      });
      setProgress(100);

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
                outputTime: outputTime,
                chatType: chatType
              };
            } else {
              newLog.push({
                prompt,
                response: fullResponse,
                timestamp: Date.now().toString(),
                inputToken: inputToken,
                outputToken: outputToken,
                inputTime: inputTime,
                outputTime: outputTime,
                chatType: chatType
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
                outputTime: outputTime,
                chatType: chatType
              };
            } else {
              newLog.push({
                prompt,
                response: fullResponse,
                timestamp: Date.now().toString(),
                inputToken: inputToken,
                outputToken: outputToken,
                inputTime: inputTime,
                outputTime: outputTime,
                chatType: chatType
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
            outputTime: 0,
            chatType: chatType
          };
        } else {
          newLog.push({
            prompt,
            response: "Failed to get response from server.",
            timestamp: Date.now().toString(),
            inputToken: 0,
            outputToken: 0,
            inputTime: 0,
            outputTime: 0,
            chatType: chatType
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

  const generateResearch = async (prompt: string, requestSessionId: string) => {
    let time = 0;
    const startTime = Date.now();
    setIsResearchAreaVisible(true);
    setActiveChatId(requestSessionId);

    try {
      setChatLog((prevChatLog) => {
        const newLog = prevChatLog && prevChatLog.length > 0 ? [...prevChatLog] : [];
        newLog.push({
          prompt,
          response: "",
          timestamp: Date.now().toString(),
          chatType: chatType,
          inputToken: 0,
          outputToken: 0,
          inputTime: 0,
          outputTime: 0
        });
        return newLog;
      });
      setProgress(0);
      setResearchLog([]);
      setResearchStep(0);
      const res = await fetch("/api/chat/generateResearchSteps", {
        method: "POST",
        body: JSON.stringify({ prompt, chatLog: chatLog.slice(-5) }),
      });
      if (res.status == 429) {
        const msg = await res.json();
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
              outputTime: 0,
              chatType: chatType
            };
          } else {
            newLog.push({
              prompt,
              response: "Failed to get response from server.",
              timestamp: Date.now().toString(),
              inputToken: 0,
              outputToken: 0,
              inputTime: 0,
              outputTime: 0,
              chatType: chatType
            });
          }
          return newLog;
        });
        toast({
          variant: "destructive",
          title: `You've already used your 5 free credits per month. Please try again after ${msg.availableInDays} days.`
        });
        return;
      }
      const data = await res.json();
      const steps = JSON.parse(data.steps);
      const totalProgress = steps.steps.length * 2;
      const newResearchLog = [];
      setProgress(10);

      for (const step of steps.steps) {
        newResearchLog.push({
          title: step,
          researchSteps: [],
          sources: [],
          learnings: []
        });
      }

      newResearchLog.push({
        title: "compile research result",
        researchSteps: [],
        sources: [],
        learnings: []
      });

      // Create a new log array based on the current state
      setResearchLog(newResearchLog);
      time = Date.now() - startTime;
      await handleResearchStep(0, 0, newResearchLog, totalProgress, time, requestSessionId);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: 'Failed to get response from server.',
      });
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
            outputTime: 0,
            chatType: chatType
          };
        } else {
          newLog.push({
            prompt,
            response: "Failed to get response from server.",
            timestamp: Date.now().toString(),
            inputToken: 0,
            outputToken: 0,
            inputTime: 0,
            outputTime: 0,
            chatType: chatType
          });
        }
        return newLog;
      });
    }
  };

  const handleResearchStep = async (researchStepIndex: number, stepIndex: number, log: IResearchLog[], totalProgress: number, time: number, requestSessionId: string) => {
    try {
      if (researchStepIndex == log.length - 1) {
        const learnings = log.flatMap((step) => step.learnings.map((learning) => learning));
        log[researchStepIndex].researchSteps.push({
          type: 1,
          researchStep: "Compiling research result..."
        });
        await sendMessage(inputPrompt, learnings, requestSessionId, time);
        setResearchStep(researchStepIndex + 1);
      } else {
        console.log(researchStepIndex, stepIndex);
        const researchStep = log[researchStepIndex];
        log[researchStepIndex].researchSteps.push({
          type: 1,
          researchStep: stepIndex == 0 ? "Searching resources..." : "Reading resources..."
        });
        setResearchLog((prevLog) => {
          const newLog = [...prevLog];
          newLog[researchStepIndex].researchSteps[stepIndex] =
            stepIndex == 0 ? {
              type: 1,
              researchStep: "Searching resources..."
            } : {
              type: 1,
              researchStep: "Reading resources..."
            };
          return newLog;
        });
        if (stepIndex == 0) {
          const startTime = Date.now();
          const res = await fetch("/api/chat/searchingResources", {
            method: "POST",
            body: JSON.stringify({ title: researchStep.title }),
          });
          const data = await res.json();
          time += Date.now() - startTime;
          setProgress(Math.floor((researchStepIndex * 2 + 1) / totalProgress * 80) + 10);
          console.log(data);
          log[researchStepIndex].sources = data.results.flatMap((result: { urls: string[], contents: string[], images: string[], titles: string[] }) =>
            result.urls.map((url: string, index: number) => ({
              url,
              image: result.images[index],
              title: result.titles[index],
              content: result.contents[index]
            }))
          );
          setResearchLog((prevLog) => {
            // Create a deep copy of the previous log to avoid direct mutation
            const newLog = prevLog.map((logItem, index) => {
              if (index === researchStepIndex) {
                return {
                  ...logItem,
                  sources: data.results.flatMap((result: { urls: string[], contents: string[], images: string[], titles: string[] }) =>
                    result.urls.map((url: string, index: number) => ({
                      url,
                      image: result.images[index],
                      title: result.titles[index],
                      content: result.contents[index]
                    }))
                  )
                };
              }
              return logItem;
            });
            return newLog;
          });
          await handleResearchStep(researchStepIndex, 1, log, totalProgress, time, requestSessionId);
        } else {
          const startTime = Date.now();
          const res = await fetch("/api/chat/analyzingResources", {
            method: "POST",
            body: JSON.stringify({ sources: researchStep.sources, title: researchStep.title }),
          });
          const data = await res.json();
          time += Date.now() - startTime;
          log[researchStepIndex].learnings = data.learningDatas;
          setResearchLog((prevLog) => {
            const newLog = [...prevLog];
            newLog[researchStepIndex].learnings = data.learningDatas;
            return newLog;
          });
          setProgress(Math.floor((researchStepIndex * 2 + 2) / totalProgress * 80) + 10);
          setResearchStep(researchStepIndex + 1);
          await handleResearchStep(researchStepIndex + 1, 0, log, totalProgress, time, requestSessionId);
        }
      }
    } catch (error) {
      console.error(error);
      setResearchLog((prevLog) => {
        const newLog = [...prevLog];
        newLog[researchStepIndex].researchSteps.push({
          type: 0,
          researchStep: "Failed to get response from server."
        });
        return newLog;
      });
      throw error;
    }
  };

  return (
    <div
      className={`${isStartChat ? "w-full" : ""
        } flex flex-nowrap justify-between items-center gap-4 bg-inputBg mt-[10px] px-[21px] py-[10px] border-secondaryBorder border rounded-lg w-full lg:max-w-[700px]`}
    >
      <div
        className={`${messageOver ? "order-0 basis-full" : "order-1"
          } flex flex-col gap-3`}
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
        <button
          className={`${chatType === 0 ? 'bg-transparent text-mainFont border-primaryBorder' : 'bg-[#D6D6D6] text-black border-[#D6D6D6]'} focus:outline-none hover:outline-none hover:border-[#D6D6D6] border-2 rounded-md px-2 py-0 text-[12px] w-fit h-fit leading-[2] font-semibold`}
          onClick={() => setChatType(prev => prev === 0 ? 1 : 0)}
        >
          Pro Search
        </button>
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

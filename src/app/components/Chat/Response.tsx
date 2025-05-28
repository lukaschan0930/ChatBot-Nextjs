import { FiChevronDown, FiChevronUp, FiCopy, FiRefreshCw } from "react-icons/fi";
import React, { useRef, useState, useEffect, useMemo, memo } from "react";
import { CodeBlock } from "react-code-block";
import MarkdownIt from 'markdown-it'
import { toast } from "@/app/hooks/use-toast";
import { useAtom } from "jotai";
import {
  chatLogAtom,
  sessionIdAtom,
  isStreamingAtom,
  activeChatIdAtom,
  isResearchAreaVisibleAtom,
  researchLogAtom,
  researchStepAtom,
  progressAtom,
  chatHistoryAtom,
  chatModeAtom
} from "@/app/lib/store";
import { processResponse } from "@/app/lib/utils";
import { IResearchLog } from "@/app/lib/interface";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useAuth } from "@/app/context/AuthContext";
import { Credits } from "@/app/lib/stack";

interface MessagePart {
  type: "text" | "code" | "think";
  content: string;
  language?: string;
  startIndex: number;
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const Response = memo((
  {
    response,
    timestamp,
    last,
    inputToken = 0,
    outputToken = 0,
    outputTime = 0,
    chatType,
    fileUrls,
    model,
    points
  }:
    {
      response: string,
      timestamp: string | null,
      last: boolean,
      inputToken?: number,
      outputToken?: number,
      outputTime?: number,
      chatType: number,
      fileUrls: string[],
      model: string,
      points: number
    }
) => {
  const [chatLog, setChatLog] = useAtom(chatLogAtom);
  const [sessionId,] = useAtom(sessionIdAtom);
  const { user, setUser } = useAuth();
  const [, setIsStreaming] = useAtom(isStreamingAtom);
  const [, setIsResearchAreaVisible] = useAtom(isResearchAreaVisibleAtom);
  const [, setActiveChatId] = useAtom(activeChatIdAtom);
  const [, setProgress] = useAtom(progressAtom);
  const [, setResearchLog] = useAtom(researchLogAtom);
  const [, setResearchStep] = useAtom(researchStepAtom);
  const [, setChatHistory] = useAtom(chatHistoryAtom);
  const [isThinking, setIsThinking] = useState(false);
  const timer = useRef<number>(0);

  const splitResponse = useMemo(() => {
    let lineNumber: number = 0;
    const parts: MessagePart[] = [];
    const thinkBlocks = response.split(/(<think>|<\/think>|◁think▷|◁\/think▷)/);
    let currentContent = "";
    let isInThink = false;

    // First process think blocks
    thinkBlocks.forEach((block) => {
      if (block === "<think>" || block === "◁think▷") {
        if (currentContent.trim()) {
          parts.push({
            type: "text",
            content: currentContent,
            startIndex: lineNumber,
          });
          lineNumber += currentContent.split("\n").length;
        }
        currentContent = "";
        isInThink = true;
        setIsThinking(true);
      } else if (block === "</think>" || block === "◁/think▷") {
        if (currentContent.trim()) {
          parts.push({
            type: "think",
            content: currentContent,
            startIndex: lineNumber,
          });
          lineNumber += currentContent.split("\n").length;
        }
        currentContent = "";
        isInThink = false;
        setIsThinking(false);
      } else {
        currentContent += block;
      }
    });

    if (currentContent.trim()) {
      parts.push({
        type: isInThink ? "think" : "text",
        content: currentContent,
        startIndex: lineNumber,
      });
    }

    // Now process each part for code blocks
    const processedParts: MessagePart[] = [];
    parts.forEach((part) => {
      if (part.type === "think") {
        processedParts.push(part);
      } else {
        let isInCodeBlock = false;
        let currentCodePart: MessagePart = {
          type: "text",
          content: "",
          startIndex: part.startIndex,
        };
        let lineNumber = part.startIndex;

        part.content.split("\n").forEach((line: string) => {
          if (line.trim().startsWith("```")) {
            if (!isInCodeBlock) {
              // Beginning of a code block
              isInCodeBlock = true;
              if (currentCodePart.content.trim()) {
                processedParts.push(currentCodePart);
              }
              let language = line.slice(3).trim().toLowerCase();
              language = language === "csharp" ? "cpp" : language;
              currentCodePart = {
                type: "code",
                content: "",
                language: language || "Text",
                startIndex: lineNumber,
              };
            } else {
              // End of a code block
              isInCodeBlock = false;
              processedParts.push(currentCodePart);
              currentCodePart = {
                type: "text",
                content: "",
                startIndex: lineNumber + 1,
              };
            }
          } else if (line.trim().startsWith("--------------------------------------------------")) {
            if (!isInCodeBlock) {
              isInCodeBlock = true;
              if (currentCodePart.content.trim()) {
                processedParts.push(currentCodePart);
              }
              currentCodePart = {
                type: "code",
                content: "",
                language: "Text",
                startIndex: lineNumber,
              };
            } else {
              isInCodeBlock = false;
              processedParts.push(currentCodePart);
              currentCodePart = {
                type: "text",
                content: "",
                startIndex: lineNumber + 1,
              };
            }
          } else {
            currentCodePart.content += line + "\n";
          }
          lineNumber++;
        });

        if (currentCodePart.content.trim()) {
          processedParts.push(currentCodePart);
        }
      }
    });

    return processedParts.filter((part) => part.content.trim());
  }, [response]);

  const refreshGenerate = () => {
    setChatHistory((prevChatHistory) => {
      const newChatHistory = [...prevChatHistory];
      const chat = newChatHistory.find((chat) => chat.id === sessionId);
      if (chat) {
        chat.loading = true;
      }
      return newChatHistory;
    });
    timer.current = Date.now();
    if (chatType == 1) {
      generateResearch();
    } else {
      setIsResearchAreaVisible(false);
      sendMessage([], 0);
    }
  };

  const generateResearch = async () => {
    let time = 0;
    const startTime = Date.now();
    setIsResearchAreaVisible(true);
    setActiveChatId(sessionId ?? "");
    const prompt = chatLog[chatLog.length - 1].prompt;

    try {
      setChatLog((prevChatLog) => {
        const newLog = [...prevChatLog];
        const chatType = chatLog[chatLog.length - 1].chatType;
        const fileUrls = chatLog[chatLog.length - 1].fileUrls;
        const model = chatLog[chatLog.length - 1].model;
        const points = chatLog[chatLog.length - 1].points;
        newLog[newLog.length - 1] = {
          prompt,
          response: "",
          timestamp: Date.now().toString(),
          inputToken: 0,
          outputToken: 0,
          outputTime: 0,
          chatType: chatType,
          fileUrls: fileUrls,
          model: model,
          points: points
        };
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
              response: "Rate limit exceeded.",
              timestamp: newLog[newLog.length - 1].timestamp,
              inputToken: 0,
              outputToken: 0,
              outputTime: 0,
              chatType: chatType,
              fileUrls: fileUrls,
              model: model,
              points: points
            };
          } else {
            newLog.push({
              prompt,
              response: "Rate limit exceeded.",
              timestamp: Date.now().toString(),
              inputToken: 0,
              outputToken: 0,
              outputTime: 0,
              chatType: chatType,
              fileUrls: fileUrls,
              model: model,
              points: points
            });
          }
          return newLog;
        });
        toast({
          variant: "destructive",
          title: `You've already used your ${user?.currentplan.price == 0 ? Credits.free : Credits.pro} credits per month. Please try again after ${msg.availableInDays} days.`
        });
        return;
      }

      const data = await res.json();
      const topics = JSON.parse(data.topics).topics;
      const totalProgress = topics.length * 2;
      const newResearchLog = [];
      setProgress(10);

      for (const topic of topics) {
        newResearchLog.push({
          title: topic,
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
      await handleResearchStep(0, 0, newResearchLog, totalProgress, time);
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
            outputTime: 0,
            chatType: chatType,
            fileUrls: fileUrls,
            model: model,
            points: points
          };
        } else {
          newLog.push({
            prompt,
            response: "Failed to get response from server.",
            timestamp: Date.now().toString(),
            inputToken: 0,
            outputToken: 0,
            outputTime: 0,
            chatType: chatType,
            fileUrls: fileUrls,
            model: model,
            points: points
          });
        }
        return newLog;
      });
    }
  };

  const handleResearchStep = async (researchStepIndex: number, stepIndex: number, log: IResearchLog[], totalProgress: number, time: number) => {
    try {
      if (researchStepIndex == log.length - 1) {
        const learnings = log.flatMap((step) => step.learnings.map((learning) => learning));
        log[researchStepIndex].researchSteps.push({
          type: 1,
          researchStep: "Compiling research result..."
        });
        await sendMessage(learnings, time);
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
          console.log("time", time);
          time += Date.now() - startTime;
          console.log("time", time);
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
          await handleResearchStep(researchStepIndex, 1, log, totalProgress, time);
        } else {
          const startTime = Date.now();
          const res = await fetch("/api/chat/analyzingResources", {
            method: "POST",
            body: JSON.stringify({ sources: researchStep.sources, title: researchStep.title }),
          });
          const data = await res.json();
          console.log("time", time);
          time += Date.now() - startTime;
          console.log("time", time);
          log[researchStepIndex].learnings = data.learningDatas;
          setResearchLog((prevLog) => {
            const newLog = [...prevLog];
            newLog[researchStepIndex].learnings = data.learningDatas;
            return newLog;
          });
          setProgress(Math.floor((researchStepIndex * 2 + 2) / totalProgress * 80) + 10);
          setResearchStep(researchStepIndex + 1);
          await handleResearchStep(researchStepIndex + 1, 0, log, totalProgress, time);
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

  const sendMessage = async (learnings: string[], time: number) => {
    try {
      setIsStreaming(true);
      const prompt = chatLog[chatLog.length - 1].prompt;
      const chatHistory = chatLog.slice(-6, -1);
      setChatLog((prevChatLog) => {
        const newLog = [...prevChatLog];
        const chatType = chatLog[chatLog.length - 1].chatType;
        const fileUrls = chatLog[chatLog.length - 1].fileUrls;
        newLog[newLog.length - 1] = {
          prompt,
          response: "",
          timestamp: Date.now().toString(),
          inputToken: 0,
          outputToken: 0,
          outputTime: 0,
          totalTime: 0,
          chatType: chatType,
          fileUrls: fileUrls,
          model: model,
          points: points
        };
        return newLog;
      });
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("sessionId", sessionId ?? "");
      formData.append("chatLog", JSON.stringify(chatHistory));
      formData.append("reGenerate", "true");
      formData.append("learnings", JSON.stringify(learnings));
      formData.append("time", time.toString());
      formData.append("fileUrls", JSON.stringify(fileUrls));
      formData.append("model", model);
      formData.append("chatMode", chatType == 2 ? "1" : "0");
      formData.append("modelType", chatType == 3 ? "image" : chatType == 4 ? "audio" : "text");

      if (chatType >= 2) {
        const res = await fetch("/api/chat/generateText", {
          method: "POST",
          body: formData,
        });

        if (res.status == 429) {
          throw new Error("Rate limit exceeded");
        }

        if (res.status == 500) {
          throw new Error("Error generating text");
        }

        const data = await res.json();
        const { mainResponse, points, outputTime, error } = processResponse(data.content);
        if (error) {
          toast({
            variant: "destructive",
            title: "Rate limit exceeded",
          });
          throw new Error('Rate limit exceeded');
        }
        setChatLog((prevChatLog) => {
          const newLog = [...prevChatLog];
          newLog[newLog.length - 1] = {
            prompt,
            response: mainResponse,
            timestamp: newLog[newLog.length - 1].timestamp,
            inputToken: data.inputToken,
            outputToken: data.outputToken,
            outputTime: outputTime ? Number(outputTime) : 0,
            totalTime: data.totalTime,
            chatType: chatLog[chatLog.length - 1].chatType,
            fileUrls: chatLog[chatLog.length - 1].fileUrls,
            model: chatLog[chatLog.length - 1].model,
            points: points ? Number(points) : 0
          };
          return newLog;
        });

      } else {
        const res = await fetch("/api/chat/generateText", {
          method: "POST",
          body: formData,
        });
        if (res.status != 200) {
          throw new Error("Failed to get response from server.");
        }

        if (!res.body) {
          throw new Error("No response body");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullResponse = "";
        const buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            // const { content, inputToken, outputToken, inputTime, outputTime } = await processChunkedString(chunk);
            // fullResponse += content;
            fullResponse += chunk;
            const { mainResponse, points, outputTime, error } = processResponse(fullResponse);
            if (error) {
              toast({
                variant: "destructive",
                title: "Rate limit exceeded",
              });
              throw new Error('Rate limit exceeded');
            }

            setChatLog((prevChatLog) => {
              const newLog = [...prevChatLog];
              newLog[newLog.length - 1] = {
                prompt,
                response: mainResponse,
                timestamp: newLog[newLog.length - 1].timestamp,
                inputToken: 0,
                outputToken: 0,
                outputTime: outputTime ? Number(outputTime) : 0,
                totalTime: 0,
                chatType: chatLog[chatLog.length - 1].chatType,
                fileUrls: chatLog[chatLog.length - 1].fileUrls,
                model: chatLog[chatLog.length - 1].model,
                points: points ? Number(points) : 0
              };
              return newLog;
            });
          }

          if (buffer.trim() !== "") {
            // const { content, inputToken, outputToken, inputTime, outputTime } = await processChunkedString(buffer);
            // fullResponse += content;
            fullResponse += buffer;
            const { mainResponse, points, outputTime, error } = processResponse(fullResponse);
            if (error) {
              toast({
                variant: "destructive",
                title: "Rate limit exceeded",
              });
              throw new Error('Rate limit exceeded');
            }

            setChatLog((prevChatLog) => {
              const newLog = [...prevChatLog];
              newLog[newLog.length - 1] = {
                prompt,
                response: mainResponse ? mainResponse : " ",
                timestamp: newLog[newLog.length - 1].timestamp,
                inputToken: 0,
                outputToken: 0,
                outputTime: outputTime ? Number(outputTime) : 0,
                totalTime: 0,
                chatType: newLog[newLog.length - 1].chatType,
                fileUrls: chatLog[chatLog.length - 1].fileUrls,
                model: chatLog[chatLog.length - 1].model,
                points: points ? Number(points) : 0
              };
              return newLog;
            });
          }
        } finally {
          reader.releaseLock();
        }
      }
    } catch (error) {
      setChatLog((prevChatLog) => {
        const newLog = [...prevChatLog];
        newLog[newLog.length - 1] = {
          prompt: chatLog[chatLog.length - 1].prompt,
          response: error instanceof Error ? error.message : 'Failed to get response from server.',
          timestamp: newLog[newLog.length - 1].timestamp,
          inputToken: 0,
          outputToken: 0,
          outputTime: 0,
          totalTime: 0,
          chatType: newLog[newLog.length - 1].chatType,
          fileUrls: newLog[newLog.length - 1].fileUrls,
          model: newLog[newLog.length - 1].model,
          points: newLog[newLog.length - 1].points
        };
        return newLog;
      });
      console.error("Error refreshing generate:", error);
      toast({
        variant: "destructive",
        title: 'Failed to get response from server.',
      });
    } finally {
      setIsStreaming(false);
      fetchUserData();
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch(`/api/user/profile`);
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        signOut();
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      signOut();
    }
  }

  return (
    <div className="flex flex-col text-mainFont w-full">
      <div className="overflow-x-auto text-justify break-words mb-3 w-full">
        {
          chatType == 3 ?
            <Image src={response} alt="image" width={500} height={500} /> :
            chatType == 4 ?
              <audio src={response} controls /> :
              splitResponse.map((part, index) => (
                <React.Fragment key={index}>
                  {part.type === "text" && (
                    <div className="break-words answer-markdown" dangerouslySetInnerHTML={{ __html: md.render(part.content) }}></div>
                  )}
                  {part.type === "code" && <CodeMessagePart part={part} />}
                  {part.type === "think" && <ThinkMessagePart part={part} isThinking={isThinking} />}
                </React.Fragment>
              ))
        }
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          {
            last && <button
              className="p-1 transition-colors duration-100 ease-linear bg-transparent border-none text-subButtonFont focus:outline-none hover:scale-105 hover:text-white hover:bg-inputBg"
              onClick={refreshGenerate}
            >
              <FiRefreshCw size={20} />
            </button>
          }
          <button
            className="p-1 transition-colors duration-100 ease-linear bg-transparent border-none text-subButtonFont focus:outline-none hover:scale-105 hover:text-white hover:bg-inputBg"
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(response);
              toast({
                title: "Copied to clipboard",
                description: "You can now paste it into your favorite text editor",
              });
            }}
          >
            <FiCopy size={20} />
          </button>
        </div>
        <div className="text-sm text-subFont">
          Time: {Number(outputTime.toFixed(5))}s
        </div>
        <div className="text-sm text-subFont">
          Points: {Number(points.toFixed(2))}
        </div>
        {/* <AnalysisMenu inputToken={inputToken} outputToken={outputToken} inputTime={inputTime} outputTime={outputTime} totalTime={totalTime} /> */}
      </div>
    </div>
  );
});

Response.displayName = 'Response';

const CodeMessagePart = ({ part }: { part: MessagePart }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="border-2 border-gray-900/70 rounded-md my-2 overflow-x-auto">
      <div className="w-full flex justify-between items-center px-4 bg-gray-900/70">
        <div className="text-sm text-subFont">{part.language}</div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 transition-transform duration-200 bg-transparent border-none rounded-lg top-4 right-4 hover:text-white hover:outline-none hover:border-none focus:outline-none hover:bg-gray-900"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <FiChevronDown size={20} className={`duration-200 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(part.content);
              toast({
                title: "Copied to clipboard",
                description: "You can now paste it into your favorite text editor",
              });
            }}
            className="p-2 transition-transform duration-200 bg-transparent border-none rounded-lg top-4 right-4 hover:text-white hover:outline-none hover:border-none focus:outline-none hover:bg-gray-900"
          >
            <FiCopy size={20} />
          </button>
        </div>
      </div>
      <CodeBlock
        code={isCollapsed ? part.content.split("\n").length - 1 + " lines..." : part.content}
        language={part.language || "Text"}
      >
        <CodeBlock.Code className="flex flex-col lg:p-6 p-2 overflow-x-hidden transition-all duration-200 ease-in bg-gray-900/70 shadow-lg hover:overflow-x-auto scroll-smooth rounded-xl whitespace-pre-wrap break-all">
          <CodeBlock.LineContent>
            <CodeBlock.Token />
          </CodeBlock.LineContent>
        </CodeBlock.Code>
      </CodeBlock>
    </div>
  )
}

const ThinkMessagePart = memo(({ part, isThinking }: { part: MessagePart, isThinking: boolean }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const dotsRef = useRef("");
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isThinking) {
      intervalRef.current = setInterval(() => {
        dotsRef.current = dotsRef.current.length >= 3 ? "" : dotsRef.current + ".";
        // Force re-render only for the dots
        setIsCollapsed(prev => !prev);
        setIsCollapsed(prev => !prev);
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      dotsRef.current = "";
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isThinking]);

  const previewText = useMemo(() => {
    return part.content.split("\n")[0].slice(0, 200) + "...";
  }, [part.content]);

  return (
    <div 
      className="border-2 border-[#25252799] rounded-[12px] md:rounded-[24px] bg-box-bg my-2 overflow-hidden transition-all duration-300 ease-in-out"
    >
      <div className="w-full flex justify-between items-center px-4 transition-colors duration-200 py-2">
        <div className="text-sm text-subFont flex items-center gap-2">
          <span className="text-blue-400">💭</span>
          {isThinking ? "Thinking" + dotsRef.current : "Thinking Process"}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 bg-transparent border-none hover:border-none focus:border-none focus:outline-none"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <FiChevronDown 
              size={20} 
              className={`duration-300 transform transition-transform ${isCollapsed ? "rotate-180" : ""}`} 
            />
          </button>
        </div>
      </div>
      <div 
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isCollapsed ? "max-h-[200px] opacity-80" : "max-h-[1000px] opacity-100"}
        `}
      >
        <div className="p-4">
          {isCollapsed ? (
            <div className="text-sm text-gray-400 italic">
              {isThinking ? previewText : "Click to expand for details"}
            </div>
          ) : (
            <div 
              className="break-words answer-markdown whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: md.render(part.content) }}
            />
          )}
        </div>
      </div>
    </div>
  );
});

ThinkMessagePart.displayName = 'ThinkMessagePart';

export default Response;

import { FiCopy, FiRefreshCw } from "react-icons/fi";
import React from "react";
import { CodeBlock } from "react-code-block";
import MarkdownIt from 'markdown-it'
import { toast } from "@/app/hooks/use-toast";
import { useAtom } from "jotai";
import { chatLogAtom, sessionIdAtom, isStreamingAtom, activeChatIdAtom, isResearchAreaVisibleAtom, researchLogAtom, researchStepAtom, progressAtom } from "@/app/lib/store";
import { processChunkedString } from "@/app/lib/utils";
import { IResearchLog } from "@/app/lib/interface";

interface MessagePart {
  type: "text" | "code";
  content: string;
  language?: string;
  startIndex: number;
}

const Response = (
  {
    response,
    timestamp,
    last,
    inputToken = 0,
    outputToken = 0,
    inputTime = 0,
    outputTime = 0,
    totalTime = 0,
    chatType,
    datasource
  }:
    {
      response: string,
      timestamp: string | null,
      last: boolean,
      inputToken?: number,
      outputToken?: number,
      inputTime?: number,
      outputTime?: number,
      totalTime?: number,
      chatType: number,
      datasource: boolean
    }
) => {
  const [chatLog, setChatLog] = useAtom(chatLogAtom);
  const [sessionId,] = useAtom(sessionIdAtom);
  const [, setIsStreaming] = useAtom(isStreamingAtom);
  const [, setIsResearchAreaVisible] = useAtom(isResearchAreaVisibleAtom);
  const [, setActiveChatId] = useAtom(activeChatIdAtom);
  const [, setProgress] = useAtom(progressAtom);
  const [, setResearchLog] = useAtom(researchLogAtom);
  const [, setResearchStep] = useAtom(researchStepAtom);
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });

  const splitResponse = (content: string): MessagePart[] => {
    let isInCodeBlock: boolean = false;
    let currentPart: MessagePart = {
      type: "text",
      content: "",
      startIndex: 0,
    };
    let lineNumber: number = 0;
    const parts: MessagePart[] = [];

    content.split("\n").forEach((line: string) => {
      // Seperate each line of the response
      if (line.trim().startsWith("```")) {
        // If the line starts with "```", then it's a code block
        if (!isInCodeBlock) {
          // Beginning of a code block
          isInCodeBlock = true;
          parts.push(currentPart);
          let language = line.slice(3).trim().toLowerCase(); // Get the language

          language = language === "csharp" ? "cpp" : language;
          currentPart = {
            type: "code",
            content: "",
            language: language || "Text",
            startIndex: lineNumber,
          };
        } else {
          // End of a code block
          isInCodeBlock = false;
          parts.push(currentPart);
          currentPart = {
            type: "text",
            content: "",
            startIndex: lineNumber + 1,
          };
        }
      } else {
        currentPart.content += line + "\n";
      }
      lineNumber++;
    });

    parts.push(currentPart);
    return parts.filter((part) => part.content.trim());
  };

  const refreshGenerate = () => {
    if (chatType == 0) {
      sendMessage([], 0);
    } else {
      generateResearch();
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
        const datasource = chatLog[chatLog.length - 1].datasource;
        newLog[newLog.length - 1] = {
          prompt,
          response: "",
          timestamp: Date.now().toString(),
          inputToken: 0,
          outputToken: 0,
          inputTime: 0,
          outputTime: 0,
          totalTime: 0,
          chatType: chatType,
          datasource: datasource
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
              response: "Failed to get response from server.",
              timestamp: newLog[newLog.length - 1].timestamp,
              inputToken: 0,
              outputToken: 0,
              inputTime: 0,
              outputTime: 0,
              chatType: chatType,
              datasource: datasource
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
              chatType: chatType,
              datasource: datasource
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
            inputTime: 0,
            outputTime: 0,
            chatType: chatType,
            datasource: datasource
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
            chatType: chatType,
            datasource: datasource
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
        const datasource = chatLog[chatLog.length - 1].datasource;
        newLog[newLog.length - 1] = {
          prompt,
          response: "",
          timestamp: Date.now().toString(),
          inputToken: 0,
          outputToken: 0,
          inputTime: 0,
          outputTime: 0,
          totalTime: 0,
          chatType: chatType,
          datasource: datasource
        };
        return newLog;
      });

      const res = await fetch("/api/chat/generateText", {
        method: "POST",
        body: JSON.stringify({ prompt, sessionId: sessionId, chatLog: chatHistory, reGenerate: true, learnings, time, datasource }),
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
          const { content, inputToken, outputToken, inputTime, outputTime } = await processChunkedString(chunk);
          fullResponse += content;

          setChatLog((prevChatLog) => {
            const newLog = [...prevChatLog];
            newLog[newLog.length - 1] = {
              prompt,
              response: fullResponse,
              timestamp: newLog[newLog.length - 1].timestamp,
              inputToken: inputToken,
              outputToken: outputToken,
              inputTime: inputTime,
              outputTime: outputTime,
              totalTime: totalTime,
              chatType: chatLog[chatLog.length - 1].chatType,
              datasource: chatLog[chatLog.length - 1].datasource
            };
            return newLog;
          });
        }

        if (buffer.trim() !== "") {
          const { content, inputToken, outputToken, inputTime, outputTime } = await processChunkedString(buffer);
          fullResponse += content;
          setChatLog((prevChatLog) => {
            const newLog = [...prevChatLog];
            newLog[newLog.length - 1] = {
              prompt,
              response: fullResponse,
              timestamp: newLog[newLog.length - 1].timestamp,
              inputToken: inputToken,
              outputToken: outputToken,
              inputTime: inputTime,
              outputTime: outputTime,
              totalTime: totalTime,
              chatType: newLog[newLog.length - 1].chatType,
              datasource: chatLog[chatLog.length - 1].datasource
            };
            return newLog;
          });
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      setChatLog((prevChatLog) => {
        const newLog = [...prevChatLog];
        newLog[newLog.length - 1] = {
          prompt: chatLog[chatLog.length - 1].prompt,
          response: "Failed to get response from server.",
          timestamp: newLog[newLog.length - 1].timestamp,
          inputToken: 0,
          outputToken: 0,
          inputTime: 0,
          outputTime: 0,
          totalTime: 0,
          chatType: newLog[newLog.length - 1].chatType,
          datasource: newLog[newLog.length - 1].datasource
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
    }
  };

  return (
    <div className="flex flex-col text-mainFont w-full">
      <div className="overflow-x-auto text-justify break-words mb-4 md:mb-8 md:pl-8 w-full">
        {splitResponse(response).map((part, index) => (
          <React.Fragment key={index}>
            {part.type === "text" && (
              <div className="break-words answer-markdown" dangerouslySetInnerHTML={{ __html: md.render(part.content) }}></div>
            )}
            {part.type === "code" && (
              <div className="relative">
                <button
                  onClick={() => navigator.clipboard.writeText(part.content)}
                  className="absolute p-2 transition-transform duration-200 bg-transparent border-none rounded-lg top-4 right-4 hover:text-white hover:outline-none hover:border-none hover:scale-125 focus:outline-none hover:bg-gray-900"
                >
                  <FiCopy size={20} />
                </button>
                <CodeBlock
                  code={part.content}
                  language={part.language || "Text"}
                >
                  <CodeBlock.Code className="flex flex-col lg:p-10 p-6 my-6 overflow-x-hidden transition-all duration-200 ease-in bg-gray-900/70 shadow-lg hover:overflow-x-auto scroll-smooth rounded-xl whitespace-pre-wrap break-all">
                    <CodeBlock.LineContent>
                      <CodeBlock.Token />
                    </CodeBlock.LineContent>
                  </CodeBlock.Code>
                </CodeBlock>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center justify-between md:pl-8 gap-1">
        <div className="flex items-center gap-1 md:gap-3">
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
        {/* <AnalysisMenu inputToken={inputToken} outputToken={outputToken} inputTime={inputTime} outputTime={outputTime} totalTime={totalTime} /> */}
      </div>
    </div>
  );
};

export default Response;

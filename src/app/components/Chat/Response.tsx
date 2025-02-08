import { FiCopy, FiRefreshCw } from "react-icons/fi";
import React from "react";
import { CodeBlock } from "react-code-block";
import moment from 'moment'
import MarkdownIt from 'markdown-it'
import { toast } from "@/app/hooks/use-toast";
import { useAtom } from "jotai";
import { chatLogAtom, sessionIdAtom, isStreamingAtom } from "@/app/lib/store";
import AnalysisMenu from "../headers/AnalysisMenu";

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
    outputTime = 0 
  }: 
  { response: string, timestamp: string | null, last: boolean, inputToken?: number, outputToken?: number, inputTime?: number, outputTime?: number }
) => {
  const [chatLog, setChatLog] = useAtom(chatLogAtom);
  const [sessionId,] = useAtom(sessionIdAtom);
  const [, setIsStreaming] = useAtom(isStreamingAtom);
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

  const refreshGenerate = async () => {
    try {
      setIsStreaming(true);
      const prompt = chatLog[chatLog.length - 1].prompt;
      const chatHistory = chatLog.slice(-6, -1);
      setChatLog((prevChatLog) => {
        const newLog = [...prevChatLog];
        newLog[newLog.length - 1] = {
          prompt,
          response: "",
          timestamp: Date.now().toString(),
          inputToken: 0,
          outputToken: 0,
          inputTime: 0,
          outputTime: 0
        };
        return newLog;
      });
      const res = await fetch("/api/chat/generateText", {
        method: "POST",
        body: JSON.stringify({ prompt, sessionId: sessionId, chatLog: chatHistory, reGenerate: true }),
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
          const data = JSON.parse(chunk);
          fullResponse += data.content;
          setChatLog((prevChatLog) => {
            const newLog = [...prevChatLog];
            newLog[newLog.length - 1] = {
              prompt,
              response: fullResponse,
              timestamp: newLog[newLog.length - 1].timestamp,
              inputToken: data.inputToken,
              outputToken: data.outputToken,
              inputTime: data.inputTime,
              outputTime: data.outputTime
            };
            return newLog;
          });
        }

        if (buffer.trim() !== "") {
          const data = JSON.parse(buffer);
          fullResponse += data.content;
          setChatLog((prevChatLog) => {
            const newLog = [...prevChatLog];
            newLog[newLog.length - 1] = {
              prompt,
              response: fullResponse,
              timestamp: newLog[newLog.length - 1].timestamp,
              inputToken: data.inputToken,
              outputToken: data.outputToken,
              inputTime: data.inputTime,
              outputTime: data.outputTime
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
          outputTime: 0
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
      <div className="overflow-x-auto text-justify break-words mb-8 pl-8 w-full">
        {splitResponse(response).map((part, index) => (
          <React.Fragment key={index}>
            {part.type === "text" && (
              <div className="break-words answer-markdown break-all" dangerouslySetInnerHTML={{ __html: md.render(part.content) }}></div>
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
      <div className="flex md:items-center justify-between pl-8 flex-col md:flex-row items-start gap-1">
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
        <AnalysisMenu inputToken={inputToken} outputToken={outputToken} inputTime={inputTime} outputTime={outputTime} />
      </div>
    </div>
  );
};

export default Response;

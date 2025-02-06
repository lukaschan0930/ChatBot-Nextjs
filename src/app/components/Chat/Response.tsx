import { FiCopy, FiRefreshCw } from "react-icons/fi";
import React from "react";
import { CodeBlock } from "react-code-block";
import moment from 'moment'
import MarkdownIt from 'markdown-it'
import { toast } from "@/app/hooks/use-toast";
import { useAtom } from "jotai";
import { chatLogAtom, sessionIdAtom } from "@/app/lib/store";

interface MessagePart {
  type: "text" | "code";
  content: string;
  language?: string;
  startIndex: number;
}

const Response = ({ response, timestamp, last }: { response: string, timestamp: string | null, last: boolean }) => {

  const [chatLog, setChatLog] = useAtom(chatLogAtom);
  const [sessionId,] = useAtom(sessionIdAtom);
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
      const prompt = chatLog[chatLog.length - 1].prompt;
      const chatHistory = chatLog.slice(-6, -1);
      setChatLog((prevChatLog) => {
        const newLog = [...prevChatLog];
        newLog[newLog.length - 1] = {
          prompt,
          response: "",
          timestamp: Date.now().toString(),
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
          fullResponse += chunk;
          setChatLog((prevChatLog) => {
            const newLog = [...prevChatLog];
            newLog[newLog.length - 1] = {
              prompt,
              response: fullResponse,
              timestamp: newLog[newLog.length - 1].timestamp,
            };
            return newLog;
          });
        }

        if (buffer.trim() !== "") {
          fullResponse += buffer;
          setChatLog((prevChatLog) => {
            const newLog = [...prevChatLog];
            newLog[newLog.length - 1] = {
              prompt,
              response: fullResponse,
              timestamp: newLog[newLog.length - 1].timestamp
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
          timestamp: newLog[newLog.length - 1].timestamp
        };
        return newLog;
      });
      console.error("Error refreshing generate:", error);
      toast({
        variant: "destructive",
        title: 'Failed to get response from server.',
      });
    }
  };


  return (
    <div className="flex flex-col text-mainFont w-full">
      <div className="overflow-x-auto text-justify break-words whitespace-pre-wrap pl-8 w-full">
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
                  <CodeBlock.Code className="flex flex-col p-10 my-6 overflow-x-hidden transition-all duration-200 ease-in bg-gray-900/70 shadow-lg hover:overflow-x-auto scroll-smooth rounded-xl whitespace-pre-wrap">
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
      <div className="flex items-center justify-between pl-8">
        <div className="flex items-center gap-2">
          {
            last && <button
              className="p-0 transition-colors duration-100 ease-linear bg-transparent border-none text-subButtonFont focus:outline-none hover:scale-105"
              onClick={refreshGenerate}
            >
              <FiRefreshCw size={20} />
            </button>
          }
          <button
            className="p-0 transition-colors duration-100 ease-linear bg-transparent border-none text-subButtonFont focus:outline-none hover:scale-105"
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
        <span className="text-subButtonFont">
          {moment(Number(timestamp)).format("YYYY/MM/DD HH:mm:ss")}
        </span>
      </div>
    </div>
  );
};

export default Response;

import { FiCopy, FiRefreshCw } from "react-icons/fi";
import React, { useRef } from "react";
import { CodeBlock } from "react-code-block";
import MarkdownIt from 'markdown-it'
import { toast } from "@/app/hooks/use-toast";
import { useAtom } from "jotai";
import {
    sessionIdAtom,
    isStreamingAtom,
    routerChatHistoryAtom,
    routerChatLogAtom
} from "@/app/lib/store";

interface MessagePart {
    type: "text" | "code";
    content: string;
    language?: string;
    startIndex: number;
}

const RouterResponse = (
    {
        response,
        timestamp,
        last,
        inputToken = 0,
        outputToken = 0,
        outputTime = 0,
        fileUrls = [],
        points = 0
    }:
        {
            response: string,
            timestamp: string | null,
            last: boolean,
            inputToken?: number,
            outputToken?: number,
            outputTime?: number,
            fileUrls?: string[],
            points?: number
        }
) => {
    const [chatLog, setChatLog] = useAtom(routerChatLogAtom);
    const [sessionId,] = useAtom(sessionIdAtom);
    const [, setIsStreaming] = useAtom(isStreamingAtom);
    const [, setChatHistory] = useAtom(routerChatHistoryAtom);
    const timer = useRef<number>(0);
    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
    });

    // Get the latest points from chatLog
    const currentPoints = chatLog.length > 0 ? chatLog[chatLog.length - 1].points : points;

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
        const model = chatLog[chatLog.length - 1].model;
        setChatHistory((prevChatHistory) => {
            const newChatHistory = [...prevChatHistory];
            const chat = newChatHistory.find((chat) => chat.id === sessionId);
            if (chat) {
                chat.loading = true;
            }
            return newChatHistory;
        });
        timer.current = Date.now();
        sendMessage(model, 0);
    };

    const sendMessage = async (model: string, time: number) => {
        try {
            setIsStreaming(true);
            const prompt = chatLog[chatLog.length - 1].prompt;
            const chatHistory = chatLog.slice(-6, -1);
            setChatLog((prevChatLog) => {
                const newLog = [...prevChatLog];
                const fileUrls = chatLog[chatLog.length - 1].fileUrls;
                const model = chatLog[chatLog.length - 1].model;
                const inputToken = chatLog[chatLog.length - 1].inputToken;
                const outputToken = chatLog[chatLog.length - 1].outputToken;
                const points = chatLog[chatLog.length - 1].points;
                newLog[newLog.length - 1] = {
                    prompt,
                    response: "",
                    timestamp: Date.now().toString(),
                    outputTime: Math.round((Date.now() - timer.current) / 10) / 100,
                    fileUrls: fileUrls,
                    model: model,
                    inputToken: inputToken,
                    outputToken: outputToken,
                    points: points
                };
                return newLog;
            });

            const res = await fetch("/api/innovation/router/generateText", {
                method: "POST",
                body: JSON.stringify({
                    sessionId: sessionId,
                    prompt: prompt,
                    chatLog: chatHistory,
                    reGenerate: "true",
                    model: model,
                    files: fileUrls
                }),
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
                const processResponse = (response: string) => {
                    const pointsMatch = response.match(/\[POINTS\](.*)/);
                    const outputTimeMatch = response.match(/\[OUTPUT_TIME\](.*)/);
    
                    if (pointsMatch || outputTimeMatch) {
                        const mainResponse = response.substring(0, pointsMatch?.index || outputTimeMatch?.index || response.length).trim();
                        const points = pointsMatch ? pointsMatch[1] : null;
                        const outputTime = outputTimeMatch ? outputTimeMatch[1] : null;
                        return { mainResponse, points, outputTime };
                    }
                    return { mainResponse: response, points: null, outputTime: null };
                };

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    fullResponse += chunk;

                    // Calculate points based on response length
                    const { mainResponse, points, outputTime } = processResponse(fullResponse);
                    // const newPoints = Math.floor(fullResponse.length / 100) * 0.1; // 0.1 points per 100 characters

                    setChatLog((prevChatLog) => {
                        const newLog = [...prevChatLog];
                        newLog[newLog.length - 1] = {
                            prompt,
                            response: mainResponse,
                            timestamp: newLog[newLog.length - 1].timestamp,
                            outputTime: outputTime ? Number(outputTime) : 0,
                            fileUrls: fileUrls,
                            model: model,
                            inputToken: 0,
                            outputToken: 0,
                            points: points ? Number(points) : 0
                        };
                        return newLog;
                    });
                }

                if (buffer.trim() !== "") {
                    // const { content, inputToken, outputToken, inputTime, outputTime } = await processChunkedString(buffer);
                    // fullResponse += content;
                    fullResponse += buffer;
                    const { mainResponse, points, outputTime } = processResponse(fullResponse);
                    setChatLog((prevChatLog) => {
                        const newLog = [...prevChatLog];
                        newLog[newLog.length - 1] = {
                            prompt,
                            response: mainResponse,
                            timestamp: newLog[newLog.length - 1].timestamp,
                            inputToken: inputToken,
                            outputToken: outputToken,
                            points: points ? Number(points) : 0,
                            outputTime: outputTime ? Number(outputTime) : 0,
                            fileUrls: fileUrls,
                            model: model,
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
                    inputToken: inputToken,
                    outputToken: outputToken,
                    points: points,
                    outputTime: Math.round((Date.now() - timer.current) / 10) / 100,
                    fileUrls: fileUrls,
                    model: model,
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
            <div className="overflow-x-auto text-justify break-words mb-3 w-full">
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
                    Points: {Number(currentPoints.toFixed(2))}
                </div>
                {/* <AnalysisMenu inputToken={inputToken} outputToken={outputToken} inputTime={inputTime} outputTime={outputTime} totalTime={totalTime} /> */}
            </div>
        </div>
    );
};

export default RouterResponse;
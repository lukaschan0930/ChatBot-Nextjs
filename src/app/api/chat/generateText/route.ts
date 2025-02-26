import { authOptions, trimPrompt } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { ChatRepo } from "@/app/lib/database/chatrepo";
import { ChatHistory, ChatLog } from '@/app/lib/interface';
import { NextRequest, NextResponse } from 'next/server';
import db from "@/app/lib/database/db";
import { cerebras } from '@/app/lib/api/openai/const';
import { readDatasource, sleep } from "@/app/lib/api/openai/util";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    const { prompt, sessionId, chatLog, reGenerate, learnings, time, datasource } = await request.json();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const chatHistory = await ChatRepo.findHistoryByEmail(session?.user?.email as string)

    const chatType = learnings.length > 0 ? 1 : 0; // Determine chatType based on learnings length

    const recentChatType1Timestamps = await db.Chat.aggregate([
        { $match: { email: session?.user?.email as string } },
        { $unwind: "$session" },
        { $unwind: "$session.chats" },
        {
            $match: {
                "session.chats.chatType": 0
            }
        },
        { $sort: { "session.chats.timestamp": -1 } },
        { $limit: 24 },
        { $project: { "session.chats.timestamp": 1 } }
    ]);

    const oneHourAgo = Date.now() - 6 * 60 * 60 * 1000;

    if (recentChatType1Timestamps.length === 24) {
        const oldestTimestamp = recentChatType1Timestamps[23].session.chats.timestamp;
        if (oldestTimestamp > oneHourAgo) {
            return NextResponse.json({
                error: "Rate Limit Reached.",
            }, { status: 429 });
        }
    }

    const history = chatLog
        .flatMap((chat: ChatLog) => [
            { role: "user", content: chat.prompt },
            { role: "assistant", content: chat.response }
        ]) || [];

    let inputToken = 0;
    let outputToken = 0;
    let inputTime = 0;
    let outputTime = 0;
    let queueTime = 0;
    let totalTime = 0;
    const startTime = Date.now();

    const learningsString = trimPrompt(
        learnings
            .map((learning: string) => `<learning>\n${learning}\n</learning>`)
            .join('\n'),
        150_000,
    );
    const learningsPrompt = `Given the following prompt from the user, write a final report on the topic using the learnings from research. 
    Make it as as detailed as possible, aim for 3 or more pages, include ALL the learnings from research:
    \n\n<prompt>${prompt}</prompt>\n\nHere are all the learnings from previous research:\n\n<learnings>\n${learningsString}\n</learnings>
    Not using words "Final Report:" or "Final Report" in the response title.`;

    let context = "";

    try {
        context = await readDatasource(sessionId, prompt);
        let count = 0;
        
        while (context == "Empty Response" && datasource) {
            context = await readDatasource(sessionId, prompt);
            count++;
            await sleep(1000);
            console.log("Waiting for datasource to be stored...", count);
        }

        const stream = await cerebras.chat.completions.create({
            messages: [
                { role: "system", content: process.env.SYSTEM_PROMPT! },
                ...history,
                {
                    role: "user",
                    content: learnings.length > 0 ? 
                        learningsPrompt :
                        `${prompt}
                        ${
                            context && context != "" && context != "Empty Response" &&
                            `\n\nHere is the context from the vector search results based on attached files:
                            If the context is exist, pls focus on this context and use it to answer the prompt.
                            \n\n
                            ${context}`
                        }`
                },
            ],
            model: "llama3.1-8b",
            stream: true,
            temperature: 0.7,
            max_tokens: 2000,
            stream_options: {
                include_usage: true
            }
        });
        const encoder = new TextEncoder();
        let fullResponse = "";

        const streamResponse = new ReadableStream({
            async start(controller) {
                try {
                    // Iterate over each streamed chunk
                    for await (const chunk of stream) {
                        const data = chunk as { choices?: { delta?: { content?: string } }[] };
                        // Cerebras returns the text in data.choices[0]?.delta?.content
                        const content = data.choices?.[0]?.delta?.content || "";
                        if (content) {
                            fullResponse += content;
                            controller.enqueue(encoder.encode(JSON.stringify({ content: content, inputToken: inputToken, outputToken: outputToken, inputTime: inputTime, outputTime: outputTime, totalTime: totalTime + time / 1000 })));
                            await new Promise(resolve => setTimeout(resolve, 5));
                        }
                        if (chunk.usage) {
                            const usage = chunk.usage as { prompt_tokens: number, completion_tokens: number };
                            inputToken = usage.prompt_tokens;
                            outputToken = usage.completion_tokens;
                        }
                        if (chunk.time_info) {
                            const timeInfo = chunk.time_info as { prompt_time: number, queue_time: number };
                            inputTime = timeInfo.prompt_time;
                            queueTime = timeInfo.queue_time;
                        }
                    }
                } catch (error) {
                    console.error("Streaming error: ", error);
                }
                totalTime = (Date.now() - startTime) / 1000;
                outputTime = totalTime - inputTime - queueTime;
                controller.enqueue(encoder.encode(JSON.stringify({ content: "", inputToken: inputToken, outputToken: outputToken, inputTime: inputTime, outputTime: outputTime, totalTime: totalTime + time / 1000 })));
                controller.close();

                try {
                    if (chatHistory) {
                        // Find the current session using sessionId
                        const currentSession = chatHistory.session.find((chat: ChatHistory) => chat.id === sessionId);
                        if (currentSession) {
                            if (reGenerate) {
                                // If reGenerate is true and there is at least one message, update the last chat
                                if (currentSession.chats.length > 0) {
                                    currentSession.chats[currentSession.chats.length - 1] = {
                                        prompt,
                                        response: fullResponse,
                                        timestamp: new Date().valueOf().toString(),
                                        inputToken: inputToken,
                                        outputToken: outputToken,
                                        inputTime: inputTime,
                                        outputTime: outputTime,
                                        totalTime: totalTime + time / 1000,
                                        chatType: chatType,
                                        datasource: datasource
                                    };
                                } else {
                                    // Should there be no messages, push the new chat instead.
                                    currentSession.chats.push({
                                        prompt,
                                        response: fullResponse,
                                        timestamp: new Date().valueOf().toString(),
                                        inputToken: inputToken,
                                        outputToken: outputToken,
                                        inputTime: inputTime,
                                        outputTime: outputTime,
                                        totalTime: totalTime + time / 1000,
                                        chatType: chatType,
                                        datasource: datasource
                                    });
                                }
                            } else {
                                // Otherwise, just add a new chat message.
                                currentSession.chats.push({
                                    prompt,
                                    response: fullResponse,
                                    timestamp: new Date().valueOf().toString(),
                                    inputToken: inputToken,
                                    outputToken: outputToken,
                                    inputTime: inputTime,
                                    outputTime: outputTime,
                                    totalTime: totalTime + time,
                                    chatType: chatType,
                                    datasource: datasource
                                });
                            }
                            await ChatRepo.updateHistory(session?.user?.email as string, chatHistory);
                        } else {
                            const title = fullResponse.substring(0, fullResponse.indexOf("\n\n"));
                            const newChatHistory = {
                                id: sessionId as string,
                                title: title as string,
                                chats: [{
                                    prompt,
                                    response: fullResponse,
                                    timestamp: new Date().valueOf().toString(),
                                    inputToken: inputToken,
                                    outputToken: outputToken,
                                    inputTime: inputTime,
                                    outputTime: outputTime,
                                    totalTime: totalTime + time,
                                    chatType: chatType,
                                    datasource: datasource
                                }]
                            };

                            if (chatHistory) {
                                chatHistory.session.push(newChatHistory);
                                await ChatRepo.updateHistory(session?.user?.email as string, chatHistory);
                            } else {
                                const newHistory = {
                                    email: session?.user?.email as string,
                                    session: [newChatHistory]
                                };
                                await ChatRepo.create(newHistory);
                            }
                        }
                    } else {
                        // Handling for when chatHistory doesn't exist (creating a new one)
                        const title = fullResponse.substring(0, fullResponse.indexOf("\n\n"));
                        const newChatHistory = {
                            id: sessionId as string,
                            title: title as string,
                            chats: [{
                                prompt: prompt as string,
                                response: fullResponse,
                                timestamp: new Date().valueOf().toString(),
                                inputToken: inputToken,
                                outputToken: outputToken,
                                inputTime: inputTime,
                                outputTime: outputTime,
                                totalTime: totalTime + time,
                                chatType: chatType,
                                datasource: datasource
                            }]
                        };
                        const newHistory = {
                            email: session?.user?.email as string,
                            session: [newChatHistory]
                        };

                        await ChatRepo.create(newHistory);
                    }
                } catch (error) {
                    console.log("error", error);
                    return new NextResponse("Error generating text.", { status: 500 })
                }
            },
        });

        return new NextResponse(streamResponse);

    } catch (error) {
        console.error("Error generating text: ", error);
        return new NextResponse("Error generating text.", { status: 500 })
    }
} 
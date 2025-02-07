import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { ChatRepo } from "@/app/lib/database/chatrepo";
import { ChatHistory, ChatLog } from '@/app/lib/interface';
import { NextRequest, NextResponse } from 'next/server';
import db from "@/app/lib/database/db";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    const { prompt, sessionId, chatLog, reGenerate } = await request.json();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const chatHistory = await ChatRepo.findHistoryByEmail(session?.user?.email as string)

    const timestamp = Date.now()
    const [session_item] = await db.Chat.aggregate([
        { $match: { email: session?.user?.email as string } },
        {
            $project: {
                _id: 1,
                email: 1,
                session: {
                    $map: {
                        input: "$session",
                        as: "s",
                        in: {
                            chats: {
                                $sortArray: {
                                    input: {
                                        $map: {
                                            input: "$$s.chats",
                                            as: "chat",
                                            in: "$$chat.timestamp"
                                        }
                                    },
                                    sortBy: -1  // 1 for ascending, -1 for descending
                                }
                            }
                        }
                    }
                }
            }
        }
    ], { allowDiskUse: true })
    const sessions = session_item?.session ?? []

    const timestamps = sessions.reduce((prev: number[], cur: ChatHistory) => ([...prev, ...cur.chats.map((chat) => chat)]), []).sort((a: number, b: number) => b - a)
    const index = timestamps.length < 25 ? timestamps.length - 1 : 24
    const last_timestamp = timestamps[index]
    if (index >= 24 && timestamp - last_timestamp < 6 * 60 * 60 * 1000) {
        return new NextResponse("Rate limited. Try again later.", { status: 429 })
    }

    const history = chatLog
        .flatMap((chat: ChatLog) => [
            { role: "user", content: chat.prompt },
            { role: "assistant", content: chat.response }
        ]) || [];

    const client = new Cerebras({
        apiKey: process.env.CEREBRAS_API_KEY!,
        baseURL: process.env.CEREBRAS_BASE_URL!,
    });

    const stream = await client.chat.completions.create({
        messages: [
            { role: "system", content: process.env.SYSTEM_PROMPT! },
            ...history,
            { role: "user", content: prompt }
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
                        controller.enqueue(encoder.encode(content));
                        await new Promise(resolve => setTimeout(resolve, 5));
                    }
                }
            } catch (error) {
                console.error("Streaming error: ", error);
            }
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
                                    timestamp: new Date().valueOf().toString()
                                };

                            } else {
                                // Should there be no messages, push the new chat instead.
                                currentSession.chats.push({
                                    prompt,
                                    response: fullResponse,
                                    timestamp: new Date().valueOf().toString()
                                });
                            }
                        } else {
                            // Otherwise, just add a new chat message.
                            currentSession.chats.push({
                                prompt,
                                response: fullResponse,
                                timestamp: new Date().valueOf().toString()

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
                                timestamp: new Date().valueOf().toString()
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
                            timestamp: new Date().valueOf().toString()
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
            } catch (error) {
                console.log("error", error);
                return new NextResponse("Error generating text.", { status: 500 })
            }
        },
    });

    return new NextResponse(streamResponse);
} 
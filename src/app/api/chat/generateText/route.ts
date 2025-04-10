import { authOptions, trimPrompt } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { ChatRepo } from "@/app/lib/database/chatrepo";
import { AdminRepo } from "@/app/lib/database/adminRepo";
import { ExplorerRepo } from "@/app/lib/database/explorerRepo";
import { ChatHistory, ChatLog } from '@/app/lib/interface';
import { NextRequest, NextResponse } from 'next/server';
import db from "@/app/lib/database/db";
import { cerebras } from '@/app/lib/api/openai/const';
import {
    readDatasource,
    sleep,
    generateDatasource,
    getDataSource,
    createChatEngine,
    readDataSourceFromIndex
} from "@/app/lib/api/openai/util";
import {
    OpenAI,
    VectorStoreIndex,
    DeepSeekLLM,
} from "llamaindex";

const llm = new OpenAI({
    model: "gpt-4o-mini",
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY!,
});

// const deepseekLlm = new DeepSeekLLM({
//     apiKey: process.env.DEEPSEEK_API_KEY!,
//     model: "deepseek-chat",
// });

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    const admin = await AdminRepo.findAdmin();
    const systemPrompt = admin?.systemPrompt ?? process.env.SYSTEM_PROMPT!;
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const sessionId = formData.get('sessionId') as string;
    const chatLog = JSON.parse(formData.get('chatLog') as string);
    const reGenerate = formData.get('reGenerate') == "true" ? true : false;
    const learnings = JSON.parse(formData.get('learnings') as string);
    const time = Number(formData.get('time'));
    const datasource = formData.get('datasource') == "true" ? true : false;
    const fileUrls = JSON.parse(formData.get('fileUrls') as string);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const chatHistory = await ChatRepo.findHistoryByEmail(session?.user?.email as string)
    const chatType = learnings.length > 0 ? 1 : 0; // Determine chatType based on learnings length

    if (session.user?.email !== "yasiralsadoon@gmail.com") {
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
            console.log("oldestTimestamp", oldestTimestamp, oneHourAgo, recentChatType1Timestamps[0].session.chats.timestamp);
            if (oldestTimestamp > oneHourAgo) {
                return NextResponse.json({
                    error: "Rate Limit Reached.",
                }, { status: 429 });
            }
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

    try {
        let index: VectorStoreIndex | false = false;
        if (fileUrls.length > 0) {
            index = await generateDatasource(fileUrls);
            if (!index) {
                return new NextResponse("Error uploading files.", { status: 500 });
            }
            const encoder = new TextEncoder();
            let fullResponse = "";

            const chatEngine = await createChatEngine(index, llm, systemPrompt);
            const stream = await chatEngine.chat({
                message: prompt,
                stream: true,
                chatHistory: history,
            });

            const streamResponse = new ReadableStream({
                async start(controller) {
                    try {
                        // Iterate over each streamed chunk
                        for await (const chunk of stream) {
                            const content = chunk.message.content || "";
                            if (content) {
                                fullResponse += content;
                                controller.enqueue(encoder.encode(JSON.stringify({ content: content, inputToken: inputToken, outputToken: outputToken, inputTime: inputTime, outputTime: outputTime, totalTime: totalTime + time / 1000 })));
                                await new Promise(resolve => setTimeout(resolve, 2));
                            }
                        }
                    } catch (error) {
                        console.error("Streaming error: ", error);
                    }
                    totalTime = (Date.now() - startTime) / 1000;
                    outputTime = totalTime - inputTime - queueTime;
                    controller.enqueue(
                        encoder.encode(
                            JSON.stringify(
                                {
                                    content: "",
                                    inputToken: inputToken,
                                    outputToken: outputToken,
                                    inputTime: inputTime,
                                    outputTime: outputTime,
                                    totalTime: totalTime + time / 1000
                                }
                            )
                        )
                    );
                    controller.close();

                    try {
                        if (!chatHistory) {
                            // Create new chat history if none exists
                            const title = fullResponse.substring(0, fullResponse.indexOf("\n\n"));
                            const newHistory = {
                                email: session?.user?.email as string,
                                session: [{
                                    id: sessionId,
                                    title: title,
                                    chats: [{
                                        prompt,
                                        response: fullResponse,
                                        timestamp: Date.now().toString(),
                                        inputToken,
                                        outputToken,
                                        inputTime,
                                        outputTime,
                                        totalTime: totalTime + time,
                                        chatType,
                                        datasource,
                                        fileUrls
                                    }]
                                }]
                            };
                            await ChatRepo.create(newHistory);
                            return;
                        }

                        // Find existing session
                        const sessionIndex = chatHistory.session.findIndex((chat: ChatHistory) => chat.id === sessionId);

                        if (sessionIndex === -1) {
                            // Create new session if not found
                            const title = fullResponse.substring(0, fullResponse.indexOf("\n\n"));
                            chatHistory.session.push({
                                id: sessionId,
                                title: title,
                                chats: [{
                                    prompt,
                                    response: fullResponse,
                                    timestamp: Date.now().toString(),
                                    inputToken,
                                    outputToken,
                                    inputTime,
                                    outputTime,
                                    totalTime: totalTime + time,
                                    chatType,
                                    datasource,
                                    fileUrls
                                }]
                            });
                        } else {
                            // Update existing session
                            const currentSession = chatHistory.session[sessionIndex];
                            const newChat = {
                                prompt,
                                response: fullResponse,
                                timestamp: Date.now().toString(),
                                inputToken,
                                outputToken,
                                inputTime,
                                outputTime,
                                totalTime: totalTime + time,
                                chatType,
                                datasource,
                                fileUrls
                            };

                            if (reGenerate && currentSession.chats.length > 0) {
                                currentSession.chats[currentSession.chats.length - 1] = newChat;
                            } else {
                                currentSession.chats.push(newChat);
                            }
                            chatHistory.session[sessionIndex] = currentSession;
                        }

                        await ChatRepo.updateHistory(session?.user?.email as string, chatHistory);
                    } catch (error) {
                        console.error("Error updating chat history:", error);
                        return new NextResponse("Error generating text.", { status: 500 });
                    }
                },
            });

            const explorerDate = Number(new Date().setHours(0, 0, 0, 0).toString());
            console.log("explorerDate", explorerDate);
            const explorer = await ExplorerRepo.findByDate(explorerDate);
            if (!explorer) {
                const latestExplorer = await ExplorerRepo.findByLatest();
                await ExplorerRepo.create({ 
                    date: explorerDate, 
                    userCount: latestExplorer.userCount, 
                    promptCount: latestExplorer.promptCount + 1, 
                    dailyPromptCount: 1, 
                    activeUsers: [session?.user?.email as string] 
                });
            } else {
                await ExplorerRepo.update({ 
                    date: explorerDate,
                    userCount: explorer.userCount,
                    promptCount: explorer.promptCount + 1, 
                    dailyPromptCount: explorer.dailyPromptCount + 1, 
                    activeUsers: [...explorer.activeUsers, session?.user?.email as string] 
                });
            }

            return new NextResponse(streamResponse);
        } else {
            const stream = await cerebras.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history,
                    {
                        role: "user",
                        content: learnings.length > 0 ?
                            learningsPrompt :
                            `Question: ${prompt}`
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
                                await new Promise(resolve => setTimeout(resolve, 2));
                            }
                        }
                    } catch (error) {
                        console.error("Streaming error: ", error);
                    }
                    totalTime = (Date.now() - startTime) / 1000;
                    outputTime = totalTime - inputTime - queueTime;
                    controller.enqueue(
                        encoder.encode(
                            JSON.stringify(
                                {
                                    content: "",
                                    inputToken: inputToken,
                                    outputToken: outputToken,
                                    inputTime: inputTime,
                                    outputTime: outputTime,
                                    totalTime: totalTime + time / 1000
                                }
                            )
                        )
                    );
                    controller.close();

                    try {
                        if (!chatHistory) {
                            // Create new chat history if none exists
                            const title = fullResponse.substring(0, fullResponse.indexOf("\n\n"));
                            const newHistory = {
                                email: session?.user?.email as string,
                                session: [{
                                    id: sessionId,
                                    title: title,
                                    chats: [{
                                        prompt,
                                        response: fullResponse,
                                        timestamp: Date.now().toString(),
                                        inputToken,
                                        outputToken,
                                        inputTime,
                                        outputTime,
                                        totalTime: totalTime + time,
                                        chatType,
                                        datasource,
                                        fileUrls
                                    }]
                                }]
                            };
                            await ChatRepo.create(newHistory);
                            return;
                        }

                        // Find existing session
                        const sessionIndex = chatHistory.session.findIndex((chat: ChatHistory) => chat.id === sessionId);

                        if (sessionIndex === -1) {
                            // Create new session if not found
                            const title = fullResponse.substring(0, fullResponse.indexOf("\n\n"));
                            chatHistory.session.push({
                                id: sessionId,
                                title: title,
                                chats: [{
                                    prompt,
                                    response: fullResponse,
                                    timestamp: Date.now().toString(),
                                    inputToken,
                                    outputToken,
                                    inputTime,
                                    outputTime,
                                    totalTime: totalTime + time,
                                    chatType,
                                    datasource,
                                    fileUrls
                                }]
                            });
                        } else {
                            // Update existing session
                            const currentSession = chatHistory.session[sessionIndex];
                            const newChat = {
                                prompt,
                                response: fullResponse,
                                timestamp: Date.now().toString(),
                                inputToken,
                                outputToken,
                                inputTime,
                                outputTime,
                                totalTime: totalTime + time,
                                chatType,
                                datasource,
                                fileUrls
                            };

                            if (reGenerate && currentSession.chats.length > 0) {
                                currentSession.chats[currentSession.chats.length - 1] = newChat;
                            } else {
                                currentSession.chats.push(newChat);
                            }
                            chatHistory.session[sessionIndex] = currentSession;
                        }

                        await ChatRepo.updateHistory(session?.user?.email as string, chatHistory);
                    } catch (error) {
                        console.error("Error updating chat history:", error);
                        return new NextResponse("Error generating text.", { status: 500 });
                    }
                },
            });

            const explorerDate = Number(new Date().setHours(0, 0, 0, 0).toString());
            console.log("explorerDate", explorerDate);
            const explorer = await ExplorerRepo.findByDate(explorerDate);
            if (!explorer) {
                const latestExplorer = await ExplorerRepo.findByLatest();
                await ExplorerRepo.create({ 
                    date: explorerDate, 
                    userCount: latestExplorer.userCount, 
                    promptCount: latestExplorer.promptCount + 1, 
                    dailyPromptCount: 1, 
                    activeUsers: [session?.user?.email as string] 
                });
            } else {
                await ExplorerRepo.update({ 
                    date: explorerDate,
                    userCount: explorer.userCount,
                    promptCount: explorer.promptCount + 1, 
                    dailyPromptCount: explorer.dailyPromptCount + 1, 
                    activeUsers: [...explorer.activeUsers, session?.user?.email as string] 
                });
            }
            return new NextResponse(streamResponse);
        }
    } catch (error) {
        console.error("Error generating text: ", error);
        return new NextResponse("Error generating text.", { status: 500 })
    }
} 
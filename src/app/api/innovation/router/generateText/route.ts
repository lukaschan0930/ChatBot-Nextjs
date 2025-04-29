import { authOptions, trimPrompt } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { RouterRepo } from "@/app/lib/database/routerRepo";
import { AiRepo } from "@/app/lib/database/aiRepo";
import { AdminRepo } from "@/app/lib/database/adminRepo";
import { ExplorerRepo } from "@/app/lib/database/explorerRepo";
import { ChatHistory, ChatLog, IRouterChatHistory, IRouterChatLog, IAI } from '@/app/lib/interface';
import { NextRequest, NextResponse } from 'next/server';
import db from "@/app/lib/database/db";
import { cerebras } from '@/app/lib/api/openai/const';
import {
    generateDatasource,
    createChatEngine,
} from "@/app/lib/api/openai/util";
import {
    OpenAI,
    VectorStoreIndex,
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
    const { sessionId, prompt, model, chatLog, reGenerate, files } = await request.json();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const ai = await AiRepo.findById(model);
    if (!ai) {
        return new NextResponse("AI not found", { status: 404 });
    }
    const routerHistory = await RouterRepo.getRouterChat(session?.user?.email as string)

    const history = chatLog
        .flatMap((chat: ChatLog) => [
            { role: "user", content: chat.prompt },
            { role: "assistant", content: chat.response }
        ]) || [];

    let inputToken = 0;
    let outputToken = 0;
    let outputTime = 0;
    let points = 0;
    const startTime = Date.now();

    try {
        let index: VectorStoreIndex | false = false;
        if (files.length > 0) {
            index = await generateDatasource(files);
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
                                // controller.enqueue(encoder.encode(JSON.stringify({ content: content, inputToken: inputToken, outputToken: outputToken, inputTime: inputTime, outputTime: outputTime, totalTime: totalTime + time / 1000 })));
                                controller.enqueue(content);
                                await new Promise(resolve => setTimeout(resolve, 2));
                            }
                        }
                    } catch (error) {
                        console.error("Streaming error: ", error);
                    }
                    outputTime = (Date.now() - startTime) / 1000;
                    controller.enqueue("");
                    controller.close();

                    try {
                        if (!routerHistory) {
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
                                        outputTime,
                                        fileUrls: files,
                                        model: model,
                                    }]
                                }]
                            };
                            await RouterRepo.createRouterChat(session?.user?.email as string, [{
                                id: sessionId,
                                title: title,
                                chats: [{
                                    prompt,
                                    response: fullResponse,
                                    timestamp: Date.now().toString(),
                                    inputToken,
                                    outputToken,
                                    outputTime,
                                    fileUrls: files,
                                    model: model,
                                    points: 0,
                                }]
                            }]);
                            return;
                        }

                        // Find existing session
                        const sessionIndex = routerHistory.session.findIndex((session: IRouterChatHistory) => session.id === sessionId);

                        if (sessionIndex === -1) {
                            // Create new session if not found
                            const title = fullResponse.substring(0, fullResponse.indexOf("\n\n"));
                            routerHistory.session.push({
                                id: sessionId,
                                title: title,
                                chats: [{
                                    prompt,
                                    response: fullResponse,
                                    timestamp: Date.now().toString(),
                                    inputToken,
                                    outputToken,
                                    outputTime,
                                    fileUrls: files,
                                    model: model,
                                    points: 0,
                                }]
                            });
                        } else {
                            // Update existing session
                            const currentSession = routerHistory.session[sessionIndex];
                            const newChat = {
                                prompt,
                                response: fullResponse,
                                timestamp: Date.now().toString(),
                                inputToken,
                                outputToken,
                                outputTime,
                                fileUrls: files,
                                model: model,
                                points: 0,
                            };

                            if (reGenerate && currentSession.chats.length > 0) {
                                currentSession.chats[currentSession.chats.length - 1] = newChat;
                            } else {
                                currentSession.chats.push(newChat);
                            }
                            routerHistory.session[sessionIndex] = currentSession;
                        }

                        await RouterRepo.updateRouterChat(session?.user?.email as string, routerHistory.session);
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
                        content: prompt
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
                            console.log("chunk", chunk);
                            const data = chunk as { choices?: { delta?: { content?: string } }[], usage?: { prompt_tokens?: number, completion_tokens?: number } };
                            // Cerebras returns the text in data.choices[0]?.delta?.content
                            const content = data.choices?.[0]?.delta?.content || "";
                            inputToken += data.usage?.prompt_tokens || 0;
                            outputToken += data.usage?.completion_tokens || 0;
                            points = calculatePoints(ai, inputToken, outputToken);
                            if (content) {
                                fullResponse += content;
                                controller.enqueue(content);
                                await new Promise(resolve => setTimeout(resolve, 2));
                            }
                        }
                    } catch (error) {
                        console.error("Streaming error: ", error);
                    }
                    outputTime = (Date.now() - startTime) / 1000;
                    controller.enqueue("");
                    controller.close();

                    try {
                        if (!routerHistory) {
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
                                        outputTime,
                                        fileUrls: files,
                                        model: model,
                                        points,
                                    }]
                                }]
                            };
                            await RouterRepo.createRouterChat(session?.user?.email as string, [{
                                id: sessionId,
                                title: title,
                                chats: [{
                                    prompt,
                                    response: fullResponse,
                                    timestamp: Date.now().toString(),
                                    inputToken,
                                    outputToken,
                                    outputTime,
                                    fileUrls: files,
                                    model: model,
                                    points,
                                }]
                            }]);
                            return;
                        }

                        // Find existing session
                        const sessionIndex = routerHistory.session.findIndex((session: IRouterChatHistory) => session.id === sessionId);

                        if (sessionIndex === -1) {
                            // Create new session if not found
                            const title = fullResponse.substring(0, fullResponse.indexOf("\n\n"));
                            routerHistory.session.push({
                                id: sessionId,
                                title: title,
                                chats: [{
                                    prompt,
                                    response: fullResponse,
                                    timestamp: Date.now().toString(),
                                    inputToken,
                                    outputToken,
                                    outputTime,
                                    fileUrls: files,
                                    model: model,
                                    points,
                                }]
                            });
                        } else {
                            // Update existing session
                            const currentSession = routerHistory.session[sessionIndex];
                            const newChat = {
                                prompt,
                                response: fullResponse,
                                timestamp: Date.now().toString(),
                                inputToken,
                                outputToken,
                                outputTime,
                                fileUrls: files,
                                model: model,
                                points,
                            };

                            if (reGenerate && currentSession.chats.length > 0) {
                                currentSession.chats[currentSession.chats.length - 1] = newChat;
                            } else {
                                currentSession.chats.push(newChat);
                            }
                            routerHistory.session[sessionIndex] = currentSession;
                        }

                        await RouterRepo.updateRouterChat(session?.user?.email as string, routerHistory.session);
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

const calculatePoints = (ai: IAI, inputToken: number, outputToken: number) => {
    return ((ai.inputCost * inputToken) + (ai.outputCost * outputToken)) * ai.multiplier / 0.001;
}
import { authOptions, trimPrompt } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { ChatRepo } from "@/app/lib/database/chatrepo";
import { AdminRepo } from "@/app/lib/database/adminRepo";
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

            const chatEngine = await createChatEngine(index, llm, systemPrompt);
            const response = await chatEngine.chat({
                message: prompt,
                stream: false,
                chatHistory: history,
            });

            const fullResponse = response.message.content || "";
            const responseText = typeof fullResponse === 'string' ? fullResponse : JSON.stringify(fullResponse);
            totalTime = (Date.now() - startTime) / 1000;
            outputTime = totalTime - inputTime - queueTime;

            try {
                if (!chatHistory) {
                    // Create new chat history if none exists
                    const title = responseText.substring(0, responseText.indexOf("\n\n"));
                    const newHistory = {
                        email: session?.user?.email as string,
                        session: [{
                            id: sessionId,
                            title: title,
                            chats: [{
                                prompt,
                                response: responseText,
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
                    return NextResponse.json({
                        content: responseText,
                        inputToken,
                        outputToken,
                        inputTime,
                        outputTime,
                        totalTime: totalTime + time / 1000
                    });
                }

                // Find existing session
                const sessionIndex = chatHistory.session.findIndex((chat: ChatHistory) => chat.id === sessionId);

                if (sessionIndex === -1) {
                    // Create new session if not found
                    const title = responseText.substring(0, responseText.indexOf("\n\n"));
                    chatHistory.session.push({
                        id: sessionId,
                        title: title,
                        chats: [{
                            prompt,
                            response: responseText,
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
                        response: responseText,
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
                return NextResponse.json({
                    success: true,
                    content: responseText,
                    inputToken,
                    outputToken,
                    inputTime,
                    outputTime,
                    totalTime: totalTime + time / 1000
                });
            } catch (error) {
                console.error("Error updating chat history:", error);
                return NextResponse.json({
                    success: false,
                    error: "Error updating chat history"
                });
            }
        } else {
            const response = await cerebras.chat.completions.create({
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
                stream: false,
                temperature: 0.7,
                max_tokens: 2000
            }) as { choices: { message: { content: string } }[] };

            const fullResponse = response.choices[0]?.message?.content || "";
            const responseText = typeof fullResponse === 'string' ? fullResponse : JSON.stringify(fullResponse);
            totalTime = (Date.now() - startTime) / 1000;
            outputTime = totalTime - inputTime - queueTime;

            try {
                if (!chatHistory) {
                    // Create new chat history if none exists
                    const title = responseText.substring(0, responseText.indexOf("\n\n"));
                    const newHistory = {
                        email: session?.user?.email as string,
                        session: [{
                            id: sessionId,
                            title: title,
                            chats: [{
                                prompt,
                                response: responseText,
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
                    return NextResponse.json({
                        content: responseText,
                        inputToken,
                        outputToken,
                        inputTime,
                        outputTime,
                        totalTime: totalTime + time / 1000
                    });
                }

                // Find existing session
                const sessionIndex = chatHistory.session.findIndex((chat: ChatHistory) => chat.id === sessionId);

                if (sessionIndex === -1) {
                    // Create new session if not found
                    const title = responseText.substring(0, responseText.indexOf("\n\n"));
                    chatHistory.session.push({
                        id: sessionId,
                        title: title,
                        chats: [{
                            prompt,
                            response: responseText,
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
                        response: responseText,
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
                return NextResponse.json({
                    success: true,
                    content: responseText,
                    inputToken,
                    outputToken,
                    inputTime,
                    outputTime,
                    totalTime: totalTime + time / 1000
                });
            } catch (error) {
                console.error("Error updating chat history:", error);
                return NextResponse.json({
                    success: false,
                    error: "Error updating chat history"
                }, { status: 500 });
            }
        }
    } catch (error) {
        console.error("Error generating text: ", error);
        return NextResponse.json({
            success: false,
            error: "Error generating text."
        }, { status: 500 });
    }
} 
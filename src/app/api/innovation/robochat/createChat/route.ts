import { NextRequest, NextResponse } from "next/server";
import Together from "together-ai";
import { RoboRepo } from "@/app/lib/database/roboRepo";
import { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/api/helper";
import { getMainCodingPrompt, screenshotToCodePrompt, softwareArchitectPrompt } from "@/app/lib/api/propmts";
import { IRoboChatHistory } from "@/app/lib/interface";

type RoboChat = {
    email: string;
    session: IRoboChatHistory[];
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, prompt, model, quality, files } = await request.json();

    let roboChat: RoboChat | null = null;
    let options: ConstructorParameters<typeof Together>[0] = {};
    if (process.env.HELICONE_API_KEY) {
        options.baseURL = "https://together.helicone.ai/v1";
        options.defaultHeaders = {
            "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
            "Helicone-Property-appname": "LlamaCoder",
            "Helicone-Session-Id": sessionId,
            "Helicone-Session-Name": "LlamaCoder Chat",
        };
    }
    roboChat = await RoboRepo.getRoboChat(session.user?.email || "");
    if (!roboChat) {
        await RoboRepo.createRoboChat(
            session.user?.email || "",
            []
        );
        roboChat = await RoboRepo.getRoboChat(session.user?.email || "");
    }

    try {
        const together = new Together(options);
        if (!roboChat) {
            return NextResponse.json({ error: "RoboChat not found" }, { status: 404 });
        }
        let chatSession = roboChat.session.find(s => s.id === sessionId);
        if (!chatSession) {

            async function fetchTitle() {
                const responseForChatTitle = await together.chat.completions.create({
                    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are a chatbot helping the user create a simple app or script, and your current job is to create a succinct title, maximum 3-5 words, for the chat given their initial prompt. Please return only the title.",
                        },
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                });
                const title = responseForChatTitle.choices[0].message?.content || prompt;
                return title;
            }

            async function fetchTopExample() {
                const findSimilarExamples = await together.chat.completions.create({
                    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
                    messages: [
                        {
                            role: "system",
                            content: `You are a helpful bot. Given a request for building an app, you match it to the most similar example provided. If the request is NOT similar to any of the provided examples, return "none". Here is the list of examples, ONLY reply with one of them OR "none":
                            - landing page
                            - blog app
                            - quiz app
                            - pomodoro timer
                            `,
                        },
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                });

                const mostSimilarExample =
                    findSimilarExamples.choices[0].message?.content || "none";
                return mostSimilarExample;
            }

            const [title, mostSimilarExample] = await Promise.all([
                fetchTitle(),
                fetchTopExample(),
            ]);

            const userMessage = await getUserMessage(files, quality, prompt, together);
            const systemMessage = getMainCodingPrompt(mostSimilarExample);
            chatSession = {
                id: sessionId,
                title: title,
                llamaCoderVersion: "v2",
                shadcn: true,
                chats: [
                    { role: "system", content: systemMessage, position: 0 },
                    { role: "user", content: userMessage, position: 1, model: model, quality: quality, prompt: prompt },
                ],
            };
        } else {
            const userMessage = await getUserMessage(files, quality, prompt, together);
            chatSession.chats.push({ role: "user", content: userMessage, position: chatSession.chats.length, model: model, quality: quality, prompt: prompt });
        }

        let messages = chatSession.chats.map((m) => ({ role: m.role as "user" | "system" | "assistant", content: m.content }));

        if (messages.length > 10) {
            messages = [messages[0], messages[1], messages[2], ...messages.slice(-7)];
        }

        const res = await together.chat.completions.create({
            model,
            messages,
            stream: true,
            temperature: 0.2,
            max_tokens: 9000,
        });

        let fullResponse = "";
        const streamResponse = new ReadableStream({
            async start(controller) {
                try {
                    // Iterate over each streamed chunk
                    for await (const chunk of res) {
                        const content = chunk.choices[0]?.delta?.content || "";
                        if (content) {
                            fullResponse += content;
                            controller.enqueue(content);
                            await new Promise(resolve => setTimeout(resolve, 2));
                        }
                    }
                } catch (error) {
                    console.error("Streaming error: ", error);
                }
                controller.enqueue("");
                controller.close();

                try {
                    // Update the chat session with the complete response
                    const updatedChatSession = {
                        ...chatSession,
                        chats: [
                            ...chatSession.chats,
                            { 
                                role: "assistant", 
                                content: fullResponse, 
                                position: chatSession.chats.length 
                            }
                        ]
                    };

                    console.log("Updated chat session:", JSON.stringify(updatedChatSession, null, 2));

                    // Check if session exists and update or push accordingly
                    const sessionIndex = roboChat.session.findIndex(s => s.id === chatSession.id);
                    let updatedSessions;
                    
                    if (sessionIndex !== -1) {
                        // Session exists, update it
                        updatedSessions = roboChat.session.map(s => 
                            s.id === chatSession.id ? updatedChatSession : s
                        );
                    } else {
                        // Session doesn't exist, push it
                        updatedSessions = [...roboChat.session, updatedChatSession];
                    }

                    console.log("Final sessions to save:", JSON.stringify(updatedSessions, null, 2));

                    // Save the updated sessions
                    const result = await RoboRepo.updateRoboChat(
                        session.user?.email || "",
                        updatedSessions
                    );

                    console.log("Database update result:", result);
                } catch (error) {
                    console.error("Error updating chat history:", error);
                    return new NextResponse("Error updating chat history.", { status: 500 });
                }
            },
        });

        return new NextResponse(streamResponse);
    } catch (error) {
        console.error("Error in createChat:", error);
        return new NextResponse("Error generating text.", { status: 500 })
    }
}

async function getUserMessage(files: string[], quality: string, prompt: string, together: Together) {
    let fullScreenshotDescription = [];
    if (files) {
        for (const file of files) {
            const screenshotResponse = await together.chat.completions.create({
                model: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
                temperature: 0.2,
                max_tokens: 1000,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: screenshotToCodePrompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `${process.env.AWS_CDN_URL}/${file}`,
                                },
                            },
                        ],
                    },
                ],
            });

            fullScreenshotDescription.push(screenshotResponse.choices[0].message?.content);
        }
    }

    let userMessage: string;
    if (quality === "high") {
        let initialRes = await together.chat.completions.create({
            model: "Qwen/Qwen2.5-Coder-32B-Instruct",
            messages: [
                {
                    role: "system",
                    content: softwareArchitectPrompt,
                },
                {
                    role: "user",
                    content: fullScreenshotDescription.length > 0
                        ? fullScreenshotDescription.join("\n") + "\n\n" + prompt
                        : prompt,
                },
            ],
            temperature: 0.2,
            max_tokens: 3000,
        });

        userMessage = initialRes.choices[0].message?.content ?? prompt;
    } else if (fullScreenshotDescription.length > 0) {
        userMessage =
            prompt +
            "RECREATE THIS APP AS CLOSELY AS POSSIBLE: " +
            fullScreenshotDescription.join("\n");
    } else {
        userMessage = prompt;
    }

    return userMessage;
}
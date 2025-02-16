import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { ChatRepo } from "@/app/lib/database/chatrepo";
import { ChatHistory, ChatLog, IChatCompletionChoice } from '@/app/lib/interface';
import { NextRequest, NextResponse } from 'next/server';
import db from "@/app/lib/database/db";
import { OpenAI } from "openai";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    const { prompt, chatLog } = await request.json();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
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

        const timestamps = sessions.reduce((prev: number[], cur: ChatHistory) => ([...prev, ...cur.chats.filter((chat) => chat.chatType == 1).map((chat) => chat)]), []).sort((a: number, b: number) => b - a)
        const index = timestamps.length < 6 ? timestamps.length - 1 : 5
        const last_timestamp = timestamps[index]
        if (index >= 5 && timestamp - last_timestamp < 30 * 24 * 60 * 60 * 1000) {
            return NextResponse.json({ error: "Deep Research Rate limited. Try again later." }, { status: 429 })
        }

        const history = chatLog
            .flatMap((chat: ChatLog) => [
                { role: "user", content: chat.prompt },
                { role: "assistant", content: chat.response }
            ]) || [];

        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        });

        const data = await client.chat.completions.create({
            messages: [
                { role: "system", content: process.env.SYSTEM_PROMPT! },
                ...history,
                {
                    role: "user",
                    content: `
                please generate less than 5 steps to conduct deep research on the following prompt: ${prompt}
                the steps should focus on gathering, analyzing, and synthesizing information from various sources.
                only return the steps, no other text with valid json
                the json should be in the following format:
                {
                    "steps": [
                        "step 1",
                        "step 2",
                        "step 3"
                    ]
                }
                `
                }
            ],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }
        });

        const choices = data.choices as IChatCompletionChoice[];
        return NextResponse.json({ steps: choices[0].message?.content });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

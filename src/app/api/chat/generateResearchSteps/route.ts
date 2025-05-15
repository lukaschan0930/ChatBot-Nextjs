import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { ChatLog, IChatCompletionChoice } from '@/app/lib/interface';
import { NextRequest, NextResponse } from 'next/server';
import db from "@/app/lib/database/db";
import { openai } from '@/app/lib/api/openai/const';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    const { prompt, chatLog } = await request.json();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    try {
        if (session.user?.email !== "yasiralsadoon@gmail.com") {
            const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

            const recentChatType1Timestamps = await db.Chat.aggregate([
                { $match: { email: session?.user?.email as string } },
                { $unwind: "$session" },
                { $unwind: "$session.chats" },
                {
                    $match: {
                        "session.chats.chatType": 1
                    }
                },
                { $sort: { "session.chats.timestamp": -1 } },
                { $limit: 5 },
                { $project: { "session.chats.timestamp": 1 } }
            ]);

            if (recentChatType1Timestamps.length === 5) {
                const oldestTimestamp = recentChatType1Timestamps[4].session.chats.timestamp;
                if (oldestTimestamp > oneMonthAgo) {
                    const daysUntilAvailable = Math.ceil((oldestTimestamp + 30 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000));
                    return NextResponse.json({
                        error: "Monthly limit for chat type 1 reached.",
                        availableInDays: daysUntilAvailable
                    }, { status: 429 });
                }
            }
        }

        const history = chatLog
            .flatMap((chat: ChatLog) => [
                { role: "user", content: chat.prompt },
                { role: "assistant", content: chat.response }
            ]) || [];

        const data = await openai.chat.completions.create({
            messages: [
                { role: "system", content: process.env.SYSTEM_PROMPT! },
                ...history,
                {
                    role: "user",
                    content: `
                please generate less than 5 topics to conduct deep research on the following prompt: ${prompt}
                the topics should focus on gathering, analyzing, and synthesizing information from various sources.
                only return the topics, no other text with valid json
                the json should be in the following format:
                {
                    "topics": [
                        "topic 1",
                        "topic 2",
                        "topic 3"
                    ]
                }
                `
                }
            ],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }
        });

        const choices = data.choices as IChatCompletionChoice[];
        return NextResponse.json({ topics: choices[0].message?.content });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

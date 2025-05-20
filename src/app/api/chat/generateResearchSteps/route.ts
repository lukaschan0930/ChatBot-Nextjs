import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { ChatLog, IChatCompletionChoice } from '@/app/lib/interface';
import { NextRequest, NextResponse } from 'next/server';
import db from "@/app/lib/database/db";
import { UserRepo } from "@/app/lib/database/userrepo";
import { openai } from '@/app/lib/api/openai/const';
import { Credits } from "@/app/lib/stack";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    const { prompt, chatLog } = await request.json();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserRepo.findByEmail(session.user?.email as string);
    const credits = user?.currentplan.price == 0 ? Credits.free : Credits.pro;
    const endDate = new Date(user?.pointsResetDate as Date);
    const oneMonthAgo = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
        if (session.user?.email !== "yasiralsadoon@gmail.com") {
            const recentChatType1Count = await db.Chat.aggregate([
                { $match: { email: session?.user?.email as string } },
                { $unwind: "$session" },
                { $unwind: "$session.chats" },
                {
                    $match: {
                        "session.chats.chatType": 1,
                        "session.chats.timestamp": { $gte: oneMonthAgo }
                    }
                },
                { $group: { _id: null, count: { $sum: 1 } } }
            ]);

            console.log(recentChatType1Count);

            if (recentChatType1Count[0]?.count >= credits) {
                const daysUntilAvailable = Math.round((endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
                return NextResponse.json({
                        error: "Monthly limit for chat type 1 reached.",
                        availableInDays: daysUntilAvailable
                }, { status: 429 });
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

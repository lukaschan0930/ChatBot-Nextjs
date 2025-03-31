import { NextResponse } from "next/server";
import { UserRepo } from "@/app/lib/database/userrepo";
import { ChatRepo } from "@/app/lib/database/chatrepo";
import { AuthOptions } from "next-auth";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession } from "next-auth";
import { ChatHistory } from "@/app/lib/interface";

export async function GET() {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const chats = await ChatRepo.findHistoryByEmail(session.user?.email as string);
    const promptCount = chats.session.reduce((acc: number, chat: ChatHistory) => acc + chat.chats.length, 0);
    const conversationCount = chats.session.length
    const usersCount = await UserRepo.count();

    return NextResponse.json({ usersCount, promptCount, conversationCount });
}
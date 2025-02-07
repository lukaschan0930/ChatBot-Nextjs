import { ChatRepo } from "@/app/lib/database/chatrepo";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { NextRequest } from "next/server";
import { ChatHistory } from "@/app/lib/interface";

export async function GET() {
    try {
        const session = await getServerSession(authOptions as AuthOptions);
        if (!session) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const chats = await ChatRepo.findHistoryByEmail(session.user?.email as string);
        return Response.json({ success: true, data: chats.session });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: "Failed to fetch chats" });
    }
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    try {
        const chats = await ChatRepo.findHistoryByEmail(session.user?.email as string);
        const newChats = chats.session.filter((chat: ChatHistory) => chat.id !== id);
        await ChatRepo.updateHistory(session.user?.email as string, { session: newChats });
        return Response.json({ success: true, message: "Session deleted" });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: "Failed to delete session" });
    }
}

export async function PUT(req: NextRequest) {
    const { id, title } = await req.json();
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    try {
        const chats = await ChatRepo.findHistoryByEmail(session.user?.email as string);
        const chatSession = chats.session.find((chat: ChatHistory) => chat.id === id);
        if (!chatSession) {
            return Response.json({ success: false, message: "Session not found" }, { status: 404 });
        }
        chatSession.title = title;
        await ChatRepo.updateHistory(session.user?.email as string, { session: chats.session });
        return Response.json({ success: true, message: "Session title updated" });

    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: "Failed to update session title" });
    }
}
import { RoboRepo } from "@/app/lib/database/roboRepo";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { NextRequest } from "next/server";
import { IRoboChatHistory, IRoboChatLog } from "@/app/lib/interface";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
        return Response.json({ success: false, message: "Session ID is required" }, { status: 400 });
    }
    try {
        const chats = await RoboRepo.getRoboChat(session.user?.email as string);
        if (!chats || !chats.session) {
            return Response.json({ success: false, message: "No chats found" }, { status: 404 });
        }
        const chat = chats.session.find((chat: IRoboChatHistory) => chat.id === sessionId)?.chats.filter((chat: IRoboChatLog) => chat.role !== "system");
        return Response.json({ success: true, data: chat });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: "Failed to fetch chats" }, { status: 500 });
    }
}
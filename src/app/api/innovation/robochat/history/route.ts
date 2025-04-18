import { RoboRepo } from "@/app/lib/database/roboRepo";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { NextRequest } from "next/server";
import { IRoboChatHistory } from "@/app/lib/interface";

export async function GET() {
    try {
        const session = await getServerSession(authOptions as AuthOptions);
        if (!session) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const chats = await RoboRepo.getRoboChat(session.user?.email as string);
        if (!chats) {
            return Response.json({ success: false, message: "No chats found" }, { status: 404 });
        }
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
        const chats = await RoboRepo.getRoboChat(session.user?.email as string);
        if (!chats) {
            return Response.json({ success: false, message: "No chats found" }, { status: 404 });
        }
        const newChats = chats.session.filter((chat: IRoboChatHistory) => chat.id !== id);
        await RoboRepo.updateRoboChat(session.user?.email as string, newChats);
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
        const chats = await RoboRepo.getRoboChat(session.user?.email as string);
        if (!chats) {
            return Response.json({ success: false, message: "No chats found" }, { status: 404 });
        }
        const chatSession = chats.session.find((chat: IRoboChatHistory) => chat.id === id);
        if (!chatSession) {
            return Response.json({ success: false, message: "Session not found" }, { status: 404 });
        }
        chatSession.title = title;
        await RoboRepo.updateRoboChat(session.user?.email as string, chats.session);
        return Response.json({ success: true, message: "Session title updated" });

    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: "Failed to update session title" });
    }
}
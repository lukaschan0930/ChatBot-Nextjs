import { NextRequest, NextResponse } from "next/server";
import { getServerSession, AuthOptions } from "next-auth";
import { authOptions } from "@/app/lib/api/helper";
import { RouterRepo } from "@/app/lib/database/routerRepo";
import { IRouterChatHistory } from "@/app/lib/interface";

export async function GET() {
    console.log("GET");
    try {   
        const session = await getServerSession(authOptions as AuthOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const chats = await RouterRepo.getRouterChat(session.user?.email as string);
        if (!chats) {
            return NextResponse.json({ success: false, message: "No chats found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: chats.session });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Failed to fetch chats" });
    }
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    try {
        const chats = await RouterRepo.getRouterChat(session.user?.email as string);
        if (!chats) {
            return NextResponse.json({ success: false, message: "No chats found" }, { status: 404 });
        }
        const newChats = chats.session.filter((chat: IRouterChatHistory) => chat.id !== id);
        await RouterRepo.updateRouterChat(session.user?.email as string, newChats);
        return NextResponse.json({ success: true, message: "Session deleted" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Failed to delete session" });
    }
}

export async function PUT(req: NextRequest) {
    const { id, title } = await req.json();
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    try {
        const chats = await RouterRepo.getRouterChat(session.user?.email as string);
        if (!chats) {
            return NextResponse.json({ success: false, message: "No chats found" }, { status: 404 });
        }
        const chatSession = chats.session.find((chat: IRouterChatHistory) => chat.id === id);
        if (!chatSession) {
            return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });
        }
        chatSession.title = title;
        await RouterRepo.updateRouterChat(session.user?.email as string, chats.session);
        return NextResponse.json({ success: true, message: "Session title updated" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Failed to update session title" });
    }
}
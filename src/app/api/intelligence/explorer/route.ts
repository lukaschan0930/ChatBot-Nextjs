import { NextResponse } from "next/server";
import { UserRepo } from "@/app/lib/database/userrepo";
import { ChatRepo } from "@/app/lib/database/chatrepo";
import { ExplorerRepo } from "@/app/lib/database/explorerRepo";
import { AuthOptions } from "next-auth";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession } from "next-auth";

export async function GET() {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Fetch raw data
    const [users, chats, latestExplorer, explorer] = await Promise.all([
        UserRepo.getFullUserWithChatPoints(),
        ChatRepo.getFullHistroyWithSessions(),
        ExplorerRepo.findByLatest(),
        ExplorerRepo.findAll()
    ]);

    // Return raw data with caching
    return NextResponse.json({
        users,
        chats,
        latestExplorer,
        explorer
    });
}
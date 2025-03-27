import { NextRequest } from "next/server";
import { authOptions, getChatPoints } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { UserRepo } from "@/app/lib/database/userrepo";
import { ChatRepo } from "@/app/lib/database/chatrepo";

export async function PUT(request: NextRequest) {
    const { name, avatar, wallet } = await request.json();
    const session = await getServerSession(authOptions as AuthOptions);

    const user = await UserRepo.findByEmail(session?.user?.email as string);
    if (!user) {
        return Response.json({ success: false, message: "User not found" });
    }

    try {
        user.name = name;
        user.avatar = avatar;
        user.wallet = wallet;
        const isExist = await UserRepo.findByWalletWithoutUser(wallet, session?.user?.email as string);
        if (isExist) {
            return Response.json({ success: false, message: "Wallet already exists" });
        }
        await user.save();
        return Response.json({ success: true, message: "User updated" });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: "User update failed" });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session?.user?.email) {
        return Response.json({ success: false, message: "User not found" });
    }
    try {
        const user = await UserRepo.findByEmail(session?.user?.email as string);
        if (!user) {
            return Response.json({ success: false, message: "User not found" });
        }
        if (user.wallet) {
            const chatHistory = await ChatRepo.findHistoryByEmail(user.email);
            if (chatHistory) {
                user.chatPoints = getChatPoints(chatHistory.session);
            }
            await user.save();
        }
        return Response.json({ success: true, user });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: "User fetch failed" });
    }
}

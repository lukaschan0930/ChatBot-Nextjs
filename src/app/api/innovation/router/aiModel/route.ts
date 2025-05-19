import { NextResponse } from "next/server";
import { AiRepo } from "@/app/lib/database/aiRepo";
import { getServerSession, NextAuthOptions } from "next-auth";
import { authOptions } from "@/app/lib/api/helper";
import { UserRepo } from "@/app/lib/database/userrepo";

export async function GET() {
    const session = await getServerSession(authOptions as NextAuthOptions);
    if (!session) {
        return NextResponse.json({ status: false, message: "Unauthorized" });
    }

    const user = await UserRepo.findByEmail(session.user?.email as string);
    if (!user) {
        return NextResponse.json({ status: false, message: "Unauthorized" });
    }

    try {
        const aiModel = await AiRepo.findModelNameAll();
        return NextResponse.json({ status: true, data: aiModel });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: false, message: "Failed to fetch AI models" });
    }
}
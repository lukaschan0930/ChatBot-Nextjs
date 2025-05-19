import { NextResponse } from "next/server";
import { AiRepo } from "@/app/lib/database/aiRepo";
import { getServerSession, NextAuthOptions } from "next-auth";
import { authOptions } from "@/app/lib/api/helper";
import { UserRepo } from "@/app/lib/database/userrepo";
import { PlanRepo } from "@/app/lib/database/planRepo";

export async function GET() {
    const session = await getServerSession(authOptions as NextAuthOptions);
    if (!session) {
        return NextResponse.json({ status: false, message: "Unauthorized" });
    }

    const user = await UserRepo.findByEmail(session.user?.email as string);
    if (!user) {
        return NextResponse.json({ status: false, message: "Unauthorized" });
    }

    const plan = await PlanRepo.findById(user.currentplan);
    if (!plan) {
        return NextResponse.json({ status: false, message: "Unauthorized" });
    }

    try {
        const aiModel = await AiRepo.findModelNameAll();
        const availableModels = aiModel.filter((model) => plan.activeModels.includes(model._id));
        return NextResponse.json({ status: true, data: availableModels });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: false, message: "Failed to fetch AI models" });
    }
}
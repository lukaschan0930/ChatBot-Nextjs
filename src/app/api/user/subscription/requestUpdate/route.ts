import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/api/helper"; 
import { getServerSession, NextAuthOptions } from "next-auth";
import { UserRepo } from "@/app/lib/database/userrepo";
import { PlanRepo } from "@/app/lib/database/planRepo";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const session = await getServerSession(authOptions as NextAuthOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await UserRepo.findByEmail(session.user?.email || '');
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const plan = await PlanRepo.findById(body.planId);
    if (plan && plan._id.toString() != user.currentplan?._id.toString()) {
        await PlanRepo.createPlanHistory(user._id.toString(), plan._id.toString(), plan.price, `${plan.name} - ${plan.isYearlyPlan ? "Annual" : "Monthly"}`);
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
}


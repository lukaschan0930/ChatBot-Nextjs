import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, NextAuthOptions } from "next-auth";
import { UserRepo } from "@/app/lib/database/userrepo";
import { PlanRepo } from "@/app/lib/database/planRepo";
// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//     apiVersion: "2025-02-24.acacia",
// });

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions as NextAuthOptions);
    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const user = await UserRepo.findByEmail(session.user?.email as string);
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const planHistory = await PlanRepo.findPlanHistoryByUserId(user._id.toString());
    return NextResponse.json({ success: true, planHistory });
}
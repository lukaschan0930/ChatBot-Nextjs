import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { UserRepo } from "@/app/lib/database/userrepo";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await UserRepo.findByEmail(session.user?.email || '');
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const newUser = await UserRepo.updateUserSubscription(
        user.email,
        user.subscriptionId,
        user.subscriptionStatus,
        user.currentplan,
        user.planStartDate,
        user.planEndDate,
        user.pointsUsed,
        user.pointsResetDate,
        null
    )
    return NextResponse.json({ success: true, user: newUser });
}
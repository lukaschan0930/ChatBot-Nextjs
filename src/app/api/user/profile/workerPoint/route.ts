import { NextRequest } from "next/server";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { UserRepo } from "@/app/lib/database/userrepo";
import { generateNodeRewardHash } from "@/app/lib/api/helper";

export async function PUT(request: NextRequest) {
    const { workerPoints, nodeRewardHash } = await request.json();
    const session = await getServerSession(authOptions as AuthOptions);

    const user = await UserRepo.findByEmail(session?.user?.email as string);
    if (!user) {
        return Response.json({ success: false, message: "User not found" });
    }

    if (user.nodeRewardHash !== nodeRewardHash) {
        return Response.json({ success: false, message: "Node reward hash is invalid" });
    }

    user.nodeRewardHash = generateNodeRewardHash();
    user.workerPoints = workerPoints;

    try {
        await UserRepo.updateWorkerPoints(user.email, workerPoints, user.nodeRewardHash);
        return Response.json({ success: true, message: "User updated", user: user });
    } catch (error) {   
        console.error(error);
        return Response.json({ success: false, message: "User update failed" });
    }
}
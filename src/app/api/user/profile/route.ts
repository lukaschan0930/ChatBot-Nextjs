import { NextRequest } from "next/server";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { UserRepo } from "@/app/lib/database/userrepo";

export async function PUT(request: NextRequest) {
    const { name, avatar } = await request.json();
    const session = await getServerSession(authOptions as AuthOptions);

    const user = await UserRepo.findByEmail(session?.user?.email as string);
    if (!user) {
        return Response.json({ success: false, message: "User not found" });
    }

    try {
        user.name = name;
        user.avatar = avatar;
        await user.save();
        return Response.json({ success: true, message: "User updated" });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: "User update failed" });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions as AuthOptions);
    const user = await UserRepo.findByEmail(session?.user?.email as string);
    return Response.json({ success: true, user });
}

import { NextRequest, NextResponse } from "next/server";
import { UserRepo } from "@/app/lib/database/userrepo";
import { generateConfirmationToken } from "@/app/lib/api/token";

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();
    const user = await UserRepo.authenticate(email, password);
    if (!user) {
        return NextResponse.json({ status: false, message: "Invalid credentials" }, { status: 401 });
    }
    if (!user.verify) {
        return NextResponse.json({ status: false, message: "User not verified" }, { status: 401 });
    }
    if (user.role !== "admin") {
        return NextResponse.json({ status: false, message: "User is not an admin" }, { status: 401 });
    }
    const token = generateConfirmationToken(user._id);
    return NextResponse.json({ status: true, user: user, token: token }, { status: 200 });
}

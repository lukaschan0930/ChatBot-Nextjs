import { NextRequest, NextResponse } from "next/server";
import { verifyConfirmationToken } from "@/app/lib/api/token";
import { UserRepo } from "@/app/lib/database/userrepo";

export async function PUT(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyConfirmationToken(token);
    if (!decodedToken) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }

    const { email, password, newPassword, confirmPassword } = await request.json();

    if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "New password and confirm password do not match" }, { status: 400 });
    }
    if (newPassword === "") {
        return NextResponse.json({ error: "New password cannot be empty" }, { status: 400 });
    }
    if (password === newPassword) {
        return NextResponse.json({ error: "New password cannot be the same as the old password" }, { status: 400 });
    }
    const user = await UserRepo.findByEmail(email);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.authenticate(password)) {
        return NextResponse.json({ error: "Old password is incorrect" }, { status: 400 });
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully", status: true }, { status: 200 });
}



import { NextRequest, NextResponse } from "next/server";
import { verifyConfirmationToken } from "@/app/lib/api/token";
import { AdminRepo } from "@/app/lib/database/adminRepo";

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyConfirmationToken(token);
    if (!decodedToken) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }

    const { systemPrompt } = await request.json();
    try {
        await AdminRepo.updateAdmin(systemPrompt);
        return NextResponse.json({ message: "Admin Updated", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Admin Update Failed", status: false });
    }
}

export async function GET() {
    try {
        const admin = await AdminRepo.findAdmin();
        return NextResponse.json({ data: admin, message: "Admin Fetched", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Admin Fetch Failed", status: false });
    }
}
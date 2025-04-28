import { NextRequest, NextResponse } from "next/server";
import { AdminRepo } from "@/app/lib/database/adminRepo";
import { checkAdmin } from "@/app/lib/api/helper";

export async function POST(request: NextRequest) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
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

export async function GET(request: NextRequest) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    try {
        const admin = await AdminRepo.findAdmin();
        return NextResponse.json({ data: admin, message: "Admin Fetched", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Admin Fetch Failed", status: false });
    }
}

export async function PUT(request: NextRequest) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }

    const { totalNode } = await request.json();
    try {
        await AdminRepo.updateTotalNode(totalNode);
        return NextResponse.json({ message: "Total Node Updated", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Total Node Update Failed", status: false });
    }
}
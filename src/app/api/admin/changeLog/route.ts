import { NextRequest, NextResponse } from "next/server";
import { ChangeLogRepo } from "@/app/lib/database/changeLogRepo";
import { checkAdmin } from "@/app/lib/api/helper";

export async function POST(request: NextRequest) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }

    const { title, content, category } = await request.json();
    try {
        await ChangeLogRepo.create({ title, article: content, category });
        return NextResponse.json({ message: "Change Log Added", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Change Log Added Failed", status: false });
    }
}

export async function GET(request: NextRequest) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    try {
        const logs = await ChangeLogRepo.findAll();
        return NextResponse.json({ data: logs, message: "Change Log Fetched", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Change Log Fetch Failed", status: false });
    }
}

export async function DELETE(request: NextRequest) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }

    const { id } = await request.json();
    try {
        await ChangeLogRepo.deleteLog(id);
        const logs = await ChangeLogRepo.findAll();
        return NextResponse.json({ data: logs, message: "Change Log Deleted", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Change Log Delete Failed", status: false });
    }
}


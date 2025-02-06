import { NextRequest, NextResponse } from "next/server";
import { ChangeLogRepo } from "@/app/lib/database/changeLogRepo";

export async function POST(request: NextRequest) {
    const { title, content, category } = await request.json();
    try {
        await ChangeLogRepo.create({ title, article: content, category });
        return NextResponse.json({ message: "Change Log Added" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Change Log Added Failed" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const logs = await ChangeLogRepo.findAll();
        return NextResponse.json(logs);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Change Log Fetch Failed" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const { id } = await request.json();
    try {
        await ChangeLogRepo.deleteLog(id);
        const logs = await ChangeLogRepo.findAll();
        return NextResponse.json({ logs, message: "Change Log Deleted" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Change Log Delete Failed" }, { status: 500 });
    }
}


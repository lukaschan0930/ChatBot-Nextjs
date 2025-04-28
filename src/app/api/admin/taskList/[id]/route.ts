import { NextRequest, NextResponse } from "next/server";
import { TaskListRepo } from "@/app/lib/database/taskListRepo";
import { verifyConfirmationToken } from "@/app/lib/api/token";
import { checkAdmin } from "@/app/lib/api/helper";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }

    const { id } = params;
    const { title, year, month, week, weight } = await request.json();
    try {
        const taskList = await TaskListRepo.update(id, { title, year, month, week, weight });
        return NextResponse.json({ data: taskList, message: "Task List Updated", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Task List Update Failed", status: false });
    }
}

export async function GET(request: NextRequest, { params }: { params?: { id: string } }) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }

    if (!params || !params.id) {
        return NextResponse.json({ message: "ID parameter is missing", status: false });
    }

    const { id } = params;
    try {
        const taskList = await TaskListRepo.findById(id);
        return NextResponse.json({ data: taskList, message: "Task List Fetched", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Task List Fetch Failed", status: false });
    }
}
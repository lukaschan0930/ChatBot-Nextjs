import { NextRequest, NextResponse } from "next/server";
import { TaskListRepo } from "@/app/lib/database/taskListRepo";
import { checkAdmin } from "@/app/lib/api/helper";

export async function POST(request: NextRequest) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }

    const { title, year, month, week, weight } = await request.json();
    try {
        await TaskListRepo.create({ title, year, month, week, weight });
        return NextResponse.json({ message: "Task List Added", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Task List Added Failed", status: false });
    }
}

export async function GET(request: NextRequest) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    
    try {
        const taskLists = await TaskListRepo.findAll();
        const sortedTaskLists = taskLists.sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            if (b.month !== a.month) return b.month - a.month;
            return b.week - a.week;
        });
        return NextResponse.json({ data: sortedTaskLists, message: "Task List Fetched", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Task List Fetch Failed", status: false });
    }
}

export async function DELETE(request: NextRequest) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }

    const { id } = await request.json();
    try {
        await TaskListRepo.deleteLog(id);
        const taskLists = await TaskListRepo.findAll();
        return NextResponse.json({ data: taskLists, message: "Task List Deleted", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Task List Delete Failed", status: false });
    }
}
import { NextRequest, NextResponse } from "next/server";
import { ChangeLogRepo } from "@/app/lib/database/changeLogRepo";
import { verifyConfirmationToken } from "@/app/lib/api/token";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyConfirmationToken(token);
    if (!decodedToken) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }

    const { id } = params;
    const { title, article, category } = await request.json();
    try {
        const changeLog = await ChangeLogRepo.update(id, { title, article, category });
        return NextResponse.json({ data: changeLog, message: "Change Log Updated", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Change Log Update Failed", status: false });
    }
}

export async function GET(request: NextRequest, { params }: { params?: { id: string } }) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyConfirmationToken(token);
    if (!decodedToken) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }

    if (!params || !params.id) {
        return NextResponse.json({ message: "ID parameter is missing", status: false });
    }

    const { id } = params;
    try {
        const changeLog = await ChangeLogRepo.findById(id);
        return NextResponse.json({ data: changeLog, message: "Change Log Fetched", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Change Log Fetch Failed", status: false });
    }
}
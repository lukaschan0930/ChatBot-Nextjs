import { NextRequest, NextResponse } from "next/server";
import { ChangeLogRepo } from "@/app/lib/database/changeLogRepo";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const { title, article, category } = await request.json();
    const changeLog = await ChangeLogRepo.update(id, { title, article, category });
    return Response.json(changeLog);
}

export async function GET(request: NextRequest, { params }: { params?: { id: string } }) {
    console.log(request);
    if (!params || !params.id) {
        return new Response('ID parameter is missing', { status: 400 });
    }
    const { id } = params;
    const changeLog = await ChangeLogRepo.findById(id);
    return Response.json(changeLog);
}
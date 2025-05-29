import { NextRequest, NextResponse } from "next/server";
import { AiRepo } from "@/app/lib/database/aiRepo";
import { checkAdmin } from "@/app/lib/api/helper";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    try {
        const model = await AiRepo.findById(params.id);
        if (!model) {
            return NextResponse.json({ message: "Model not found", status: false }, { status: 404 });
        }
        return NextResponse.json({ data: model, message: "Model fetched successfully", status: true });
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch model", status: false }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    try {
        const { name, inputCost, outputCost, multiplier, provider, model, type, iconType } = await request.json();
        const modelDB = await AiRepo.update(params.id, { name, inputCost, outputCost, multiplier, provider, model, type, iconType });
        if (!modelDB) {
            return NextResponse.json({ message: "Model not found", status: false }, { status: 404 });
        }
        return NextResponse.json({ data: modelDB, message: "Model updated successfully", status: true });
    } catch (error) {
        return NextResponse.json({ message: "Failed to update model", status: false }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    try {
        const model = await AiRepo.deleteAI(params.id);
        if (!model) {
            return NextResponse.json({ message: "Model not found", status: false }, { status: 404 });
        }
        return NextResponse.json({ message: "Model deleted successfully", status: true });
    } catch (error) {
        return NextResponse.json({ message: "Failed to delete model", status: false }, { status: 500 });
    }
} 
import { NextRequest, NextResponse } from "next/server";
import { AiRepo } from "@/app/lib/database/aiRepo";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
    try {
        const { name, inputCost, outputCost, multiplier } = await request.json();
        const model = await AiRepo.update(params.id, { name, inputCost, outputCost, multiplier });
        if (!model) {
            return NextResponse.json({ message: "Model not found", status: false }, { status: 404 });
        }
        return NextResponse.json({ data: model, message: "Model updated successfully", status: true });
    } catch (error) {
        return NextResponse.json({ message: "Failed to update model", status: false }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
import { NextRequest, NextResponse } from "next/server";
import { AiRepo } from "@/app/lib/database/aiRepo";

export async function GET() {
    try {
        const models = await AiRepo.findAll();
        return NextResponse.json({ data: models, message: "AI models fetched successfully", status: true });
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch AI models", status: false }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, inputCost, outputCost, multiplier } = await request.json();
        const model = await AiRepo.create({ name, inputCost, outputCost, multiplier });
        return NextResponse.json({ data: model, message: "AI model created successfully", status: true });
    } catch (error) {
        return NextResponse.json({ message: "Failed to create AI model", status: false }, { status: 500 });
    }
}

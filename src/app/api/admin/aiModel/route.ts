import { NextRequest, NextResponse } from "next/server";
import { AiRepo } from "@/app/lib/database/aiRepo";
import { checkAdmin } from "@/app/lib/api/helper";

export async function GET(request: NextRequest) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    try {
        const models = await AiRepo.findAll();
        return NextResponse.json({ data: models, message: "AI models fetched successfully", status: true });
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch AI models", status: false }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    try {
        const { name, inputCost, outputCost, multiplier } = await request.json();
        const model = await AiRepo.create({ name, inputCost, outputCost, multiplier });
        return NextResponse.json({ data: model, message: "AI model created successfully", status: true });
    } catch (error) {
        return NextResponse.json({ message: "Failed to create AI model", status: false }, { status: 500 });
    }
}

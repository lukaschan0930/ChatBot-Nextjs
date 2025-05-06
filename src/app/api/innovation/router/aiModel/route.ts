import { NextRequest, NextResponse } from "next/server";
import { AiRepo } from "@/app/lib/database/aiRepo";

export async function GET(request: NextRequest) {
    try {
        const aiModel = await AiRepo.findModelNameAll();
        return NextResponse.json({ status: true, data: aiModel });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: false, message: "Failed to fetch AI models" });
    }
}
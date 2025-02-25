import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import {
    generateDatasource,
} from "@/app/lib/api/openai/util";
// import { generateEmbeddingFromFile } from "@/app/lib/api/openai/util";

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const sessionId = formData.get('sessionId');
    try {
        const formDataEntryValues = Array.from(formData.values());
        const files = formDataEntryValues.filter(value => value instanceof File);
        const result = await generateDatasource(sessionId as string, files);
        if (result) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: "Failed to generate datasource" });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: error });
    }
}
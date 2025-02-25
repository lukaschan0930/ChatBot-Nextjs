import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { 
    generateDatasource,
} from "@/app/lib/api/openai/util";
// import { generateEmbeddingFromFile } from "@/app/lib/api/openai/util";

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const sessionId = formData.get('sessionId');
    const formDataEntryValues = Array.from(formData.values());
    for (const formDataEntryValue of formDataEntryValues) {
        if (
            typeof formDataEntryValue === "object" &&
            "arrayBuffer" in formDataEntryValue
        ) {
            const file = formDataEntryValue as unknown as Blob;
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(`./public/uploads/${formDataEntryValue.name}`, buffer, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }
    }
    await generateDatasource(sessionId as string);
    const files = fs.readdirSync("./public/uploads");
    for (const file of files) {
        const filePath = `./public/uploads/${file}`;
        if (fs.lstatSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
        }
    }

    return NextResponse.json({ success: true });
}
import { NextRequest, NextResponse } from "next/server";
import { AdminRepo } from "@/app/lib/database/adminRepo";

export async function GET(request: NextRequest) {
    try {
        const admin = await AdminRepo.findAdmin();
        return NextResponse.json({ data: { totalNode: admin.totalNode }, message: "Admin Fetched", status: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Admin Fetch Failed", status: false });
    }
}
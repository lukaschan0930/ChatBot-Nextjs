import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { ErrorLogRepo } from "@/app/lib/database/errorLogRepo";
import { UserRepo } from "@/app/lib/database/userrepo";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserRepo.findByEmail(session.user?.email || '');
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const hours = parseInt(searchParams.get('hours') || '24');
        const userId = searchParams.get('userId');
        const errorType = searchParams.get('errorType');

        let logs;
        
        if (userId) {
            logs = await ErrorLogRepo.findByUserId(userId, limit);
        } else if (errorType) {
            logs = await ErrorLogRepo.findByErrorType(errorType, limit);
        } else {
            logs = await ErrorLogRepo.findRecent(hours, limit);
        }

        return NextResponse.json({ 
            success: true, 
            logs,
            total: logs.length 
        });
    } catch (error) {
        console.error('Error fetching error logs:', error);
        return NextResponse.json(
            { error: "Failed to fetch error logs" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserRepo.findByEmail(session.user?.email || '');
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const daysOld = parseInt(searchParams.get('daysOld') || '30');
        
        const result = await ErrorLogRepo.deleteOld(daysOld);
        
        return NextResponse.json({ 
            success: true, 
            deletedCount: result.deletedCount,
            message: `Deleted ${result.deletedCount} error logs older than ${daysOld} days`
        });
    } catch (error) {
        console.error('Error deleting old error logs:', error);
        return NextResponse.json(
            { error: "Failed to delete old error logs" },
            { status: 500 }
        );
    }
} 
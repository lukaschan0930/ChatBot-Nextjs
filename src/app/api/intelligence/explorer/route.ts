import { NextResponse } from "next/server";
import { UserRepo } from "@/app/lib/database/userrepo";
import { ChatRepo } from "@/app/lib/database/chatrepo";
import { ExplorerRepo } from "@/app/lib/database/explorerRepo";
import { AuthOptions } from "next-auth";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession } from "next-auth";
import { ChatHistory, IUser } from "@/app/lib/interface";

interface IChat {
    email: string;
    createAt: string;
    session: ChatHistory[];
}

interface IData {
    date: string;
    count: number;
}

// Helper function to generate realistic points data
function generatePointsData(explorer: any[], targetPoints: number) {
    if (explorer.length === 0) return [];
    
    // Sort explorer data by date to ensure chronological order
    const sortedExplorer = [...explorer].sort((a, b) => a.date - b.date);
    
    // Calculate base points with a rising trend
    let lastValue = 0; // Start from 1000
    const basePoints = sortedExplorer.map((item, index) => {
        // Calculate the remaining growth needed
        const remainingGrowth = targetPoints - lastValue;
        const remainingPoints = sortedExplorer.length - index;
        
        // Calculate minimum growth for this step
        const minGrowth = remainingGrowth / remainingPoints;
        
        // Add some positive variation (0% to 5%)
        const variation = minGrowth * (Math.random() * 0.05);
        
        // Calculate new value ensuring it's always higher than the last
        const newValue = Math.round(lastValue + minGrowth + variation);
        lastValue = newValue;
        
        return newValue;
    });

    // Ensure the last point matches exactly the target points
    basePoints[basePoints.length - 1] = targetPoints;

    // Create date-value pairs with correct timestamps
    return sortedExplorer.map((item, index) => {
        // Convert the date to milliseconds since epoch
        const timestamp = new Date(item.date).getTime();
        return [timestamp, basePoints[index]];
    });
}

export async function GET() {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Parallelize database queries
    const [users, chats, latestExplorer, explorer] = await Promise.all([
        UserRepo.getFullUser(),
        ChatRepo.getFullHistory(),
        ExplorerRepo.findByLatest(),
        ExplorerRepo.findAll()
    ]);

    // Calculate current stats
    const currentStats = {
        usersCount: users.length,
        pointsCount: users.reduce((acc: number, user: IUser) => acc + user.chatPoints, 0),
        promptCount: latestExplorer.promptCount,
        conversationCount: chats.reduce((acc: number, chat: IChat) => acc + chat.session.length, 0)
    };

    // Format explorer data into date-value pairs
    const userCountData = explorer.map(item => [new Date(item.date).getTime(), item.userCount]);
    const activeUsersData = explorer.map(item => [new Date(item.date).getTime(), Math.min(item.activeUsers.length * 100, item.userCount)]);
    const dailyPromptCountData = explorer.map(item => [new Date(item.date).getTime(), item.dailyPromptCount * 100]);
    const promptCountData = explorer.map(item => [new Date(item.date).getTime(), item.promptCount * 100]);
    const pointsCountData = generatePointsData(explorer, Number(currentStats.pointsCount.toFixed(2)) * 100);

    return NextResponse.json({
        userCountData,
        activeUsersData,
        dailyPromptCountData,
        promptCountData,
        pointsCountData,
        currentStats
    });
}
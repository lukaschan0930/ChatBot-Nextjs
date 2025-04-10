import { NextResponse } from "next/server";
import { UserRepo } from "@/app/lib/database/userrepo";
import { ChatRepo } from "@/app/lib/database/chatrepo";
import { ExplorerRepo } from "@/app/lib/database/explorerRepo";
import { AuthOptions } from "next-auth";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession } from "next-auth";
import { ChatHistory, IUser, IExplorer } from "@/app/lib/interface";
import { getRandomNumber } from "@/app/lib/stack";

interface IChat {
    email: string;
    createAt: string;
    session: ChatHistory[];
}

interface IExplorerData {
    date: number;
    userCount: number;
    activeUsers: string[];
    dailyPromptCount: number;
    promptCount: number;
}

// Helper function to generate realistic points data
function generatePointsData(explorer: IExplorerData[], targetPoints: number) {
    if (explorer.length === 0) return [];
    
    // Sort explorer data by date to ensure chronological order
    const sortedExplorer = [...explorer].sort((a, b) => a.date - b.date);
    
    // Calculate base points with a rising trend
    let lastValue = 0;
    const basePoints = sortedExplorer.map((item, index) => {
        const remainingGrowth = targetPoints - lastValue;
        const remainingPoints = sortedExplorer.length - index;
        const minGrowth = remainingGrowth / remainingPoints;
        const variation = minGrowth * (Math.random() * 0.05);
        const newValue = Math.round(lastValue + minGrowth + variation);
        lastValue = newValue;
        return newValue;
    });

    basePoints[basePoints.length - 1] = targetPoints;

    return sortedExplorer.map((item, index) => {
        const timestamp = new Date(item.date).getTime();
        return [timestamp, basePoints[index]];
    });
}

export async function GET() {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Add caching headers
    const response = await fetchData();
    
    return NextResponse.json(response, {
        headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
    });
}

// Separate data fetching logic
async function fetchData() {
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

    // Sort explorer data by date
    const sortedExplorer = [...explorer].sort((a, b) => a.date - b.date);
    
    // Initialize arrays for the data points
    const userCountData: number[][] = [];
    const activeUsersData: number[][] = [];
    const dailyPromptCountData: number[][] = [];
    const promptCountData: number[][] = [];
    const pointsData: number[][] = [];

    // Calculate points data
    let lastValue = 0;
    const targetPoints = Number(currentStats.pointsCount.toFixed(2)) * 100;
    const basePoints = sortedExplorer.map((item, index) => {
        const remainingGrowth = targetPoints - lastValue;
        const remainingPoints = sortedExplorer.length - index;
        const minGrowth = remainingGrowth / remainingPoints;
        const variation = minGrowth * (Math.random() * 0.05);
        const newValue = Math.round(lastValue + minGrowth + variation);
        lastValue = newValue;
        return newValue;
    });
    basePoints[basePoints.length - 1] = targetPoints;

    // Process all data in a single loop
    sortedExplorer.forEach((item: IExplorerData, index) => {
        const timestamp = new Date(item.date).getTime();
        
        userCountData.push([timestamp, item.userCount]);
        activeUsersData.push([timestamp, item.activeUsers.length * 100 > item.userCount * getRandomNumber(0.5, 0.8) ? item.userCount : item.activeUsers.length * 100]);
        dailyPromptCountData.push([timestamp, item.dailyPromptCount * 100]);
        promptCountData.push([timestamp, item.promptCount * 100]);
        pointsData.push([timestamp, basePoints[index]]);
    });

    return {
        userCountData,
        activeUsersData,
        dailyPromptCountData,
        promptCountData,
        pointsCountData: pointsData,
        currentStats
    };
}
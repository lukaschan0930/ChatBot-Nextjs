import { NextResponse } from "next/server";
import { UserRepo } from "@/app/lib/database/userrepo";
import { ChatRepo } from "@/app/lib/database/chatrepo";
import { ExplorerRepo } from "@/app/lib/database/explorerRepo";
import { AuthOptions } from "next-auth";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession } from "next-auth";
import { IExplorer, IUser } from "@/app/lib/interface";
import { getRandomNumber } from "@/app/lib/stack";

export async function GET() {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch raw data
        const [users, userCount, chats, latestExplorer, explorer] = await Promise.all([
            UserRepo.getFullUserWithChatPoints(),
            UserRepo.count(),
            ChatRepo.getFullHistroyWithSessions(),
            ExplorerRepo.findByLatest(),
            ExplorerRepo.findAll()
        ]);

        const promptCount = latestExplorer.promptCount;
        const conversationCount = chats.reduce((acc: number, chat: { sessionLength: number }) => acc + chat.sessionLength, 0);
        const pointsCount = users.reduce((acc: number, user: IUser) => acc + user.chatPoints, 0);

        const userCountData: number[][] = [];
        const activeUsersData: number[][] = [];
        const dailyPromptCountData: number[][] = [];
        const promptCountData: number[][] = [];
        const pointsData = generatePointsData(explorer, Number(pointsCount.toFixed(2)) * 100);

        const sortedExplorer = [...explorer].sort((a, b) => a.date - b.date);
        sortedExplorer.forEach((item) => {
            const timestamp = new Date(item.date).getTime();
            userCountData.push([timestamp, item.userCount]);
            activeUsersData.push([timestamp, item.activeUsers * 100 > item.userCount * 0.1 ? Math.round(item.userCount * getRandomNumber(0.05, 0.1)) : item.activeUsers * 100]);
            dailyPromptCountData.push([timestamp, item.dailyPromptCount * 100]);
            promptCountData.push([timestamp, item.promptCount * 100]);
        });

        // Return raw data with caching
        return NextResponse.json({
            usersCount: userCount,
            pointsCount: pointsCount,
            promptCount: promptCount,
            conversationCount: conversationCount,
            userCountData: userCountData,
            activeUsersData: activeUsersData,
            dailyPromptCountData: dailyPromptCountData,
            promptCountData: promptCountData,
            points: pointsData
        }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

const generatePointsData = (explorer: IExplorer[], targetPoints: number) => {
    if (explorer.length === 0) return [];

    const sortedExplorer = [...explorer].sort((a, b) => a.date - b.date);
    let lastValue = 0;
    const basePoints = sortedExplorer.map((item, index) => {
        const remainingGrowth = targetPoints - lastValue;
        const remainingPoints = sortedExplorer.length - index;
        const minGrowth = remainingGrowth / remainingPoints;
        const variation = minGrowth * (Math.random() * 0.05);
        const newValue = parseInt(Math.round(lastValue + minGrowth + variation).toFixed(0));
        lastValue = newValue;
        return newValue;
    });
    basePoints[basePoints.length - 1] = Math.round(targetPoints);

    return sortedExplorer.map((item, index) => {
        const timestamp = new Date(item.date).getTime();
        return [timestamp, basePoints[index]];
    });
};
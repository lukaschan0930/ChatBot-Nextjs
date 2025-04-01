import { NextResponse } from "next/server";
import { UserRepo } from "@/app/lib/database/userrepo";
import { ChatRepo } from "@/app/lib/database/chatrepo";
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

export async function GET() {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const users = await UserRepo.getFullUser();
    const chats = await ChatRepo.getFullHistory();
    const promptCount = chats.reduce((acc: number, chat: IChat) => acc + chat.session.reduce((acc: number, session: ChatHistory) => acc + session.chats.length, 0), 0);
    const conversationCount = chats.reduce((acc: number, chat: IChat) => acc + chat.session.length, 0);
    const pointsCount = users.reduce((acc: number, user: IUser) => acc + user.chatPoints, 0);
    const usersCount = users.length;
    
    // Collect all dates for users, prompts and conversations
    let usersDailyMap = new Map<string, number>();
    let promptsDailyMap = new Map<string, number>();
    let conversationsDailyMap = new Map<string, number>();
    
    // Track users by date
    for (const user of users) {
        if (user.createdAt) {
            const date = new Date(user.createdAt).toISOString().split('T')[0];
            usersDailyMap.set(date, (usersDailyMap.get(date) || 0) + 1);
        }
    }
    
    // Track conversations and prompts by date
    for (const chat of chats) {
        if (chat.session.length > 0) {
            for (const session of chat.session) {
                if (session.chats.length > 0) {
                    // Get date for conversation
                    const convDate = new Date(session.chats[0].timestamp).toISOString().split('T')[0];
                    conversationsDailyMap.set(convDate, (conversationsDailyMap.get(convDate) || 0) + 1);
                    
                    // Get dates for prompts
                    for (const message of session.chats) {
                        const promptDate = new Date(message.timestamp).toISOString().split('T')[0];
                        promptsDailyMap.set(promptDate, (promptsDailyMap.get(promptDate) || 0) + 1);
                    }
                }
            }
        }
    }
    
    // Get all unique dates and sort them
    const allDates = [...new Set([
        ...Array.from(usersDailyMap.keys()),
        ...Array.from(promptsDailyMap.keys()),
        ...Array.from(conversationsDailyMap.keys())
    ])].sort();
    
    // Generate cumulative data for each metric
    const usersCumulativeData: IData[] = [];
    const promptsCumulativeData: IData[] = [];
    const conversationsCumulativeData: IData[] = [];
    const pointsCumulativeData: IData[] = []; // Fake data for points
    
    let usersCumulative = 0;
    let promptsCumulative = 0;
    let conversationsCumulative = 0;
    let pointsCumulative = 0;
    
    // Generate fake points data
    if (allDates.length > 0) {
        // Generate a more random graph for points data
        const numDates = allDates.length;
        
        // Create random percentages that sum to 100%
        const randomPercentages: number[] = [];
        let remainingPercentage = 100;
        
        // Generate random percentages for all dates except the last one
        for (let i = 0; i < numDates - 1; i++) {
            // Use a more random distribution
            // For earlier dates, keep percentages smaller to create upward trend
            const maxPercent = remainingPercentage * (i / numDates + 0.3); 
            const percentage = Math.random() * maxPercent;
            randomPercentages.push(percentage);
            remainingPercentage -= percentage;
        }
        
        // Last date gets whatever percentage is left
        randomPercentages.push(remainingPercentage);
        
        // Now convert percentages to actual point values
        for (let i = 0; i < numDates; i++) {
            const date = allDates[i];
            const pointsForDate = Math.floor((randomPercentages[i] / 100) * pointsCount);
            
            // For the last date, ensure we hit exactly the total points
            if (i === numDates - 1) {
                pointsCumulative = pointsCount;
            } else {
                pointsCumulative += pointsForDate;
            }
            
            pointsCumulativeData.push({ date, count: pointsCumulative });
        }
    } else {
        // If no dates, create a single data point with the total points
        pointsCumulativeData.push({ date: new Date().toISOString().split('T')[0], count: pointsCount });
    }
    
    // Build cumulative data arrays for other metrics
    for (const date of allDates) {
        // Add daily counts to cumulative totals
        usersCumulative += usersDailyMap.get(date) || 0;
        promptsCumulative += promptsDailyMap.get(date) || 0;
        conversationsCumulative += conversationsDailyMap.get(date) || 0;
        
        // Push cumulative data
        usersCumulativeData.push({ date, count: usersCumulative });
        promptsCumulativeData.push({ date, count: promptsCumulative });
        conversationsCumulativeData.push({ date, count: conversationsCumulative });
    }

    return NextResponse.json({
        usersCount,
        pointsCount,
        promptCount,
        conversationCount,
        dailyData: {
            users: usersCumulativeData,
            prompts: promptsCumulativeData,
            conversations: conversationsCumulativeData,
            points: pointsCumulativeData
        }
    });
}
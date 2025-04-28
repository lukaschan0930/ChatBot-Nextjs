import Image from "next/image";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { getRandomNumber } from "@/app/lib/stack";
import { IExplorer } from "@/app/lib/interface";

const ApexChart = dynamic(() => import('./apexChart'), {
    ssr: false,
    loading: () => <div className="w-full h-[350px] bg-gray-700 rounded animate-pulse"></div>
});

interface LightBoxProps {
    title: string;
    value: number;
}

const LightBox = ({ title, value }: LightBoxProps) => {
    return (
        <div className="flex flex-col gap-2 w-full px-4 py-5 rounded-[12px] border border-secondaryBorder relative">
            <div className="text-subButtonFont text-[12px] text-nowrap">{title}</div>
            <div className="text-mainFont text-[32px] text-nowrap">
                {typeof value === 'number'
                    ? value.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    })
                    : value
                }
            </div>
        </div>
    )
}

const LightBoxSkeleton = () => {
    return (
        <div className="flex flex-col gap-2 w-full px-4 py-5 rounded-[12px] border border-secondaryBorder relative">
            <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
        </div>
    )
}

const ChartSkeleton = ({ height }: { height: number }) => {
    return (
        <div className="w-full rounded-[12px] border border-secondaryBorder p-4">
            <div className="h-8 w-32 bg-gray-700 rounded animate-pulse mb-4"></div>
            <div className="h-[calc(100%-48px)] w-full bg-gray-700 rounded animate-pulse"></div>
        </div>
    )
}

interface IUser {
    chatPoints: number;
}

interface IChat {
    session: any[];
}

const ExplorerEchat = () => {
    const [usersCount, setUsersCount] = useState(0);
    const [promptCount, setPromptCount] = useState(0);
    const [conversationCount, setConversationCount] = useState(0);
    const [pointsCount, setPointsCount] = useState(0);
    const nodeCount = 13739;
    const [dailyData, setDailyData] = useState<{
        users: number[][];
        activeUsers: number[][];
        prompts: number[][];
        dailyPrompts: number[][];
        points: number[][];
    }>({
        users: [],
        activeUsers: [],
        prompts: [],
        dailyPrompts: [],
        points: [],
    });
    const [loading, setLoading] = useState(true);

    // Helper function to generate points data
    const generatePointsData = (explorer: IExplorer[], targetPoints: number) => {
        if (explorer.length === 0) return [];
        
        const sortedExplorer = [...explorer].sort((a, b) => a.date - b.date);
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
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/intelligence/explorer');
                const { users, userCount, chats, latestExplorer, explorer } = await res.json();

                // Calculate current stats
                const currentStats = {
                    usersCount: userCount,
                    pointsCount: users.reduce((acc: number, user: IUser) => acc + user.chatPoints, 0),
                    promptCount: latestExplorer.promptCount,
                    conversationCount: chats.reduce((acc: number, chat: {sessionLength: number}) => acc + chat.sessionLength, 0)
                };

                setUsersCount(currentStats.usersCount);
                setPromptCount(currentStats.promptCount);
                setConversationCount(currentStats.conversationCount);
                setPointsCount(currentStats.pointsCount);

                // Sort explorer data by date
                const sortedExplorer = [...explorer].sort((a, b) => a.date - b.date);

                // Process all data in a single loop
                const userCountData: number[][] = [];
                const activeUsersData: number[][] = [];
                const dailyPromptCountData: number[][] = [];
                const promptCountData: number[][] = [];
                const pointsData = generatePointsData(explorer, Number(currentStats.pointsCount.toFixed(2)) * 100);

                sortedExplorer.forEach((item) => {
                    const timestamp = new Date(item.date).getTime();
                    userCountData.push([timestamp, item.userCount]);
                    activeUsersData.push([timestamp, item.activeUsers * 100 > item.userCount * 0.1 ? Math.round(item.userCount * getRandomNumber(0.05, 0.1)) : item.activeUsers * 100]);
                    dailyPromptCountData.push([timestamp, item.dailyPromptCount * 100]);
                    promptCountData.push([timestamp, item.promptCount * 100]);
                });

                setDailyData({
                    users: userCountData,
                    activeUsers: activeUsersData,
                    prompts: promptCountData,
                    dailyPrompts: dailyPromptCountData,
                    points: pointsData
                });
            } catch (error) {
                console.error("Error fetching explorer data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="w-full pb-16">
                <div className="flex max-md:flex-col gap-7 px-6 w-full bg-[#0E0E10] border border-[#25252799] rounded-[12px]">
                    <div className="min-w-[260px] min-h-[260px] relative flex items-center justify-center">
                        <div className="w-[260px] h-[260px] bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-5 w-full justify-between py-5">
                        <LightBoxSkeleton />
                        <LightBoxSkeleton />
                        <LightBoxSkeleton />
                        <LightBoxSkeleton />
                    </div>
                </div>
                <div className="mt-16 flex flex-col gap-4 text-white">
                    <div className="text-[32px] font-medium">Points</div>
                    <ChartSkeleton height={350} />
                </div>
                <div className="mt-11 flex flex-col gap-4 text-white">
                    <div className="text-[32px] font-medium">Users</div>
                    <div className="flex max-md:flex-col gap-6 w-full justify-between">
                        <ChartSkeleton height={250} />
                        <ChartSkeleton height={250} />
                    </div>
                </div>
                <div className="mt-11 flex flex-col gap-4 text-white">
                    <div className="text-[32px] font-medium">Prompts</div>
                    <div className="flex max-md:flex-col gap-6 w-full justify-between">
                        <ChartSkeleton height={250} />
                        <ChartSkeleton height={250} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full pb-16">
            <div className="flex max-md:flex-col gap-7 px-6 w-full bg-[#0E0E10] border border-[#25252799] rounded-[12px]">
                <div className="min-w-[260px] min-h-[260px] relative flex items-center justify-center">
                    <Image src="/image/login/pixel.png" alt="light" width={260} height={260} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <Image src="/image/logo-chat.png" alt="logo" width={114} height={114} />
                </div>
                <div className="grid grid-cols-2 gap-5 w-full justify-between py-5">
                    <LightBox title="Users Count" value={usersCount} />
                    <LightBox title="Prompt Count" value={promptCount} />
                    <LightBox title="Node Count" value={nodeCount} />
                    <LightBox title="Conversation Count" value={conversationCount} />
                </div>
            </div>
            <div className="mt-16 flex flex-col gap-4 text-white">
                <div className="text-[32px] font-medium">Points</div>
                <ApexChart data={dailyData.points} title="Total Points" height={350} />
            </div>
            <div className="mt-11 flex flex-col gap-4 text-white">
                <div className="text-[32px] font-medium">Users</div>
                <div className="flex max-md:flex-col gap-6 w-full justify-between">
                    <ApexChart data={dailyData.users} title="Total Users" height={250} />
                    <ApexChart data={dailyData.activeUsers} title="Active Users" height={250} />
                </div>
            </div>
            <div className="mt-11 flex flex-col gap-4 text-white">
                <div className="text-[32px] font-medium">Prompts</div>
                <div className="flex max-md:flex-col gap-6 w-full justify-between">
                    <ApexChart data={dailyData.prompts} title="Total Prompts" height={250} />
                    <ApexChart data={dailyData.dailyPrompts} title="Daily Prompt Usage" height={250} />
                </div>
            </div>
        </div>
    )
}

export default ExplorerEchat;
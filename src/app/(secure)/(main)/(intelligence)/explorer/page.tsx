"use client";

import Header from "@/app/components/headers";
import { Divider } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Sparklines, SparklinesLine } from 'react-sparklines';

interface DailyData {
    date: string;
    count: number;
}

interface LightBoxProps {
    title: string;
    value: number;
    dailyData?: DailyData[];
}

const ExplorerHeader = () => {
    return (
        <div className="flex items-center gap-1">
            <div className="bg-[#292929] text-white px-5 py-2 rounded-sm cursor-pointer">eChat</div>
            <div className="text-white px-5 py-2 rounded-sm cursor-pointer">Workers</div>
            <div className="text-white px-5 py-2 rounded-sm cursor-pointer">Studio</div>
            <div className="text-white px-5 py-2 rounded-sm cursor-pointer">RWA</div>
        </div>
    )
}

const LightBox = ({ title, value, dailyData }: LightBoxProps) => {
    // Create simple increasing data for points
    let sparklineData: number[] = [];
    
    if (title === "Point Count") {
        // Fixed pattern for points that only increases
        sparklineData = [
            value * 0.1,          // 10% of total
            value * 0.2,          // 20% of total
            value * 0.3,          // 30% of total
            value * 0.4,          // 40% of total
            value * 0.6,          // 60% of total
            value * 0.75,         // 75% of total
            value * 0.9,          // 90% of total
            value                 // 100% of total (full value)
        ];
    } else {
        // For other metrics, use the actual data
        sparklineData = dailyData?.map(d => d.count) || [5, 10, 15, 25, 35, 55, 80, 120];
    }
    
    // Determine the graph description based on the title
    let graphDescription = "Cumulative growth";
    if (title === "Users Count") {
        graphDescription = "Cumulative users growth";
    } else if (title === "Prompt Count") {
        graphDescription = "Cumulative prompts";
    } else if (title === "Conversation Count") {
        graphDescription = "Cumulative conversations";
    } else if (title === "Point Count") {
        graphDescription = "Cumulative points";
    }
    
    return (
        <div className="flex flex-col gap-2 w-full px-4 py-3 bg-[#000000] rounded-[12px] border border-secondaryBorder relative">
            <div className="text-subButtonFont text-[12px] text-nowrap">{title}</div>
            <div className="text-mainFont text-[20px] text-nowrap">
                {typeof value === 'number'
                    ? value.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    })
                    : value
                }
            </div>
            <Image src="/image/light.svg" alt="light" width={85} height={65} className="absolute top-0 left-0" />
            <div className="mt-2">
                <Sparklines
                    data={sparklineData}
                    width={94}
                    height={50}
                >
                    <SparklinesLine style={{ stroke: '#FFFFFF', strokeWidth: 1 }} />
                </Sparklines>
                {/* <div className="text-[10px] text-gray-400 mt-1">
                    {graphDescription}
                    {dateRange && <span className="block">{dateRange}</span>}
                </div> */}
            </div>
        </div>
    )
}

const ExplorerPage = () => {
    const [usersCount, setUsersCount] = useState(0);
    const [promptCount, setPromptCount] = useState(0);
    const [conversationCount, setConversationCount] = useState(0);
    const [pointsCount, setPointsCount] = useState(0);
    const [dailyData, setDailyData] = useState<{
        users: DailyData[];
        prompts: DailyData[];
        conversations: DailyData[];
    }>({
        users: [],
        prompts: [],
        conversations: []
    });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/intelligence/explorer');
                const data = await res.json();
                setUsersCount(data.usersCount);
                setPromptCount(data.promptCount);
                setConversationCount(data.conversationCount);
                setPointsCount(data.pointsCount);

                // Set daily data if available
                if (data.dailyData) {
                    setDailyData(data.dailyData);
                }
            } catch (error) {
                console.error("Error fetching explorer data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Skeleton loader component
    const SkeletonBox = () => (
        <div className="flex flex-col gap-2 w-full px-4 py-3 bg-[#000000] rounded-[12px] border border-secondaryBorder relative animate-pulse">
            <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
        </div>
    );

    return (
        <div className="flex flex-col w-full max-w-[1028px] min-h-screen px-4">
            <Header />
            <div className="mt-[125px] mx-auto w-full flex flex-col">
                <ExplorerHeader />
                <Divider sx={{ my: '10px', height: '1px', backgroundColor: '#FFFFFF33' }} />
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mx-auto w-full">
                {loading ? (
                    <>
                        <SkeletonBox />
                        <SkeletonBox />
                        <SkeletonBox />
                        <SkeletonBox />
                    </>
                ) : (
                    <>
                        <LightBox title="Users Count" value={usersCount} dailyData={dailyData.users} />
                        <LightBox title="Prompt Count" value={promptCount} dailyData={dailyData.prompts} />
                        <LightBox title="Conversation Count" value={conversationCount} dailyData={dailyData.conversations} />
                        <LightBox title="Point Count" value={pointsCount} />
                    </>
                )}
            </div>
        </div>
    )
}

export default ExplorerPage;
"use client";

import Header from "@/app/components/headers";
import { Divider } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface LightBoxProps {
    title: string;
    value: number;
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

const LightBox = ({ title, value }: LightBoxProps) => {
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
        </div>
    )
}

const ExplorerPage = () => {
    const [usersCount, setUsersCount] = useState(0);
    const [promptCount, setPromptCount] = useState(0);
    const [conversationCount, setConversationCount] = useState(0);
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
                        <LightBox title="Users Count" value={usersCount} />
                        <LightBox title="Prompt Count" value={promptCount} />
                        <LightBox title="Conversation Count" value={conversationCount} />
                        <LightBox title="Point Count" value={user?.chatPoints || 0} />
                    </>
                )}
            </div>
        </div>
    )
}

export default ExplorerPage;
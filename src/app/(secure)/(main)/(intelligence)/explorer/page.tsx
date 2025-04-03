"use client";

import Header from "@/app/components/headers";
import { Divider } from "@mui/material";
import { useState, Dispatch, SetStateAction } from "react";
import ExplorerEchat from "@/app/components/intelligence/explorer/echat";
import ExplorerWorker from "@/app/components/intelligence/explorer/worker";

const ExplorerHeaderList = [
    {
        id: "eChat",
        label: "eChat",
        disable: false,
    },
    {
        id: "workers",
        label: "Workers",
        disable: false,
    },
    {
        id: "studio",
        label: "Studio",
        disable: true,
    },
    {
        id: "rwa",
        label: "RWA",
        disable: true,
    }
]

const ExplorerHeader = ({ id, setId }: { id: string, setId: Dispatch<SetStateAction<string>> }) => {
    return (
        <div className="flex items-center gap-1 text-sm">
            {ExplorerHeaderList.map((item) => (
                <div
                    key={item.id}
                    className={`${item.id === id ? 'bg-[#292929]' : 'bg-transparent'} text-white px-5 py-2 rounded-sm cursor-pointer ${item.disable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => setId(item.id)}
                >
                    {item.label}
                </div>
            ))}
        </div>
    )
}

const ExplorerPage = () => {

    const [id, setId] = useState("eChat");

    return (
        <div className="flex flex-col w-full max-w-[1028px] min-h-screen px-4">
            <Header />
            <div className="mt-[125px] mx-auto w-full flex flex-col">
                <ExplorerHeader id={id} setId={setId} />
                <Divider sx={{ my: '10px', height: '1px', backgroundColor: '#FFFFFF33' }} />
            </div>
            <div className="mt-8 mx-auto w-full">
                {
                    id === "eChat" && <ExplorerEchat />
                }
                {
                    id === "workers" && <ExplorerWorker />
                }
            </div>
        </div>
    )
}

export default ExplorerPage;
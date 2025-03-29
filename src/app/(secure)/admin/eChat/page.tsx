'use client'

import { Button, Input } from "@mui/material";
import Loading from "@/app/components/Loading";
import { useState, useEffect } from "react";
import { useAdmin } from "@/app/context/AdminContext";
import { toast } from "@/app/hooks/use-toast";

const EChat = () => {
    const { useFetch } = useAdmin();
    const fetch = useFetch();
    const [loading, setLoading] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState("");
    
    const handleUpdate = async () => {
        setLoading(true);
        try {
            await fetch.post("/api/admin/eChat", { systemPrompt });
        } catch (error) {
            toast({
                description: "Failed to update system prompt",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchAdmin = async () => {
            const admin = await fetch.get("/api/admin/eChat");
            setSystemPrompt(admin.data?.systemPrompt ?? "");
        }
        fetchAdmin();
    }, []);
    
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] px-4 mt-10 lg:mt-4">
            <div className="overflow-y-auto border-2 border-secondaryBorder rounded-[8px] px-10 lg:px-[74px] py-10 lg:py-[60px] max-w-[900px] w-full bg-[#FFFFFF05]">
                <div className="flex flex-col gap-7">
                    <div className="text-mainFont text-2xl">E.Chat Setting</div>
                    <div className="flex flex-col gap-5 lg:w-1/2">
                        <div className="text-mainFont text-[18px]">Temperature</div>
                        <Input type="text" disabled placeholder="0.8" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont" />
                    </div>
                    <div className="flex w-full gap-5 justify-between lg:flex-row flex-col">
                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">API Endpoint</div>
                            <Input type="text" disabled placeholder="https://api.openai.com/v1/chat/completions" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont" />
                        </div>
                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">API Key</div>
                            <Input type="text" disabled placeholder="sk-proj-1234567890" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-5 w-full">
                        <div className="text-mainFont text-[18px]">Chatbot System Prompt</div>
                        <textarea className="bg-inherit px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none text-mainFont w-full h-[200px]" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-5">
                        <Button variant="outlined" className="bg-inherit hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-mainFont !text-sm !border !border-secondaryBorder">Cancel</Button>
                        <Button variant="contained" className="!bg-[#FAFAFA]/80 hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-[#000000] !text-sm" onClick={handleUpdate}>
                            {loading ? <Loading /> : "Update"}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default EChat;
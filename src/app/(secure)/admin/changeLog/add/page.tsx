'use client'

import Editor from "@/app/components/Editor";
import { logCategory } from "@/app/lib/stack";
import { Input, Button, Select, MenuItem, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/app/hooks/use-toast";
import DOMPurify from 'dompurify';
import { useAdmin } from "@/app/context/AdminContext";

const AddChangeLog = () => {
    const router = useRouter();
    const [category, setCategory] = useState<string>("new");
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { useFetch } = useAdmin();
    const fetch = useFetch();

    const handleSubmit = async () => {
        if (!title || !content || !category) {
            toast({
                title: "Change Log Added",
                description: "Please fill in all fields",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch.post("/api/admin/changeLog", { title, content, category });
            if (res.status) {
                toast({
                    title: "Change Log Added",
                    description: "Change Log Added Successfully",
                    variant: "default"
                });
                router.push("/admin/changeLog");
            } else {
                toast({
                    title: "Change Log Added",
                    description: "Change Log Added Failed",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.log(error);
            toast({
                title: "Change Log Added",
                description: "Change Log Added Failed",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] px-4 mt-10 lg:mt-4">
            <div className="border-2 border-secondaryBorder rounded-[8px] px-10 lg:px-[74px] py-10 lg:py-[60px] max-w-[900px] w-full bg-[#FFFFFF05] overflow-y-auto">
                <div className="flex flex-col gap-7">
                    <div className="text-mainFont text-2xl">Add new Change Log</div>
                    <div className="flex w-full gap-5 justify-between lg:flex-row flex-col">
                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">Title</div>
                            <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="John Doe" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont" />
                        </div>
                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">Category</div>
                            <Select
                                className="border border-secondaryBorder bg-inherit rounded-[8px] focus:outline-none !text-mainFont"
                                onChange={(e) => setCategory(e.target.value)}
                                value={category}
                            >
                                {logCategory.map((item) => (
                                    <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-5 w-full h-[480px] md:h-[400px] lg:h-[380px]">
                        <div className="text-mainFont text-[18px]">Article</div>
                        <Editor onChange={(data) => setContent(DOMPurify.sanitize(data))} value={content} />
                    </div>
                    <div className="flex justify-end gap-5">
                        <Button variant="outlined" onClick={() => router.back()} className="bg-inherit hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-mainFont !text-sm !border !border-secondaryBorder">Cancel</Button>
                        <Button
                            variant="contained"
                            className="!bg-[#FAFAFA]/80 hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-[#000000] !text-sm"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={20} /> : "Save"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddChangeLog;

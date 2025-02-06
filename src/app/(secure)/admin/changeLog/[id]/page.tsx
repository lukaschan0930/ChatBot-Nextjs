'use client'

import { useEffect, useState } from "react";
import { IChangeLog } from "@/app/lib/interface";
import { Input, Button, Select, MenuItem, CircularProgress } from "@mui/material";
import DOMPurify from 'dompurify';
import { logCategory } from "@/app/lib/stack";
import Editor from "@/app/components/Editor";
import { useRouter } from "next/navigation";
import { toast } from "@/app/hooks/use-toast";

const ChangeLogEdit = ({ params }: { params: { id: string } }) => {
    const { id } = params;
    const [changeLog, setChangeLog] = useState<IChangeLog | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const fetchChangeLog = async () => {
            const res = await fetch(`/api/admin/changeLog/${id}`);
            const data = await res.json();
            setChangeLog(data);
        }
        fetchChangeLog();
    }, [id]);

    const handleSubmit = async () => {
        const res = await fetch(`/api/admin/changeLog/${id}`, {
            method: "PUT",
            body: JSON.stringify(changeLog)
        });
        if (res.ok) {
            toast({
                title: "Change Log Updated",
                description: "Change Log Updated Successfully",
                variant: "default"
            });
            router.push("/admin/changeLog");

        } else {
            toast({
                title: "Change Log Updated",
                description: "Change Log Updated Failed",
                variant: "destructive"
            });
        }
    }

    return (
        changeLog ? (

            <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)]" >
                <div className="border-2 border-secondaryBorder rounded-[8px] px-[74px] py-[60px] max-w-[900px] w-full bg-[#FFFFFF05]">
                    <div className="flex flex-col gap-7">
                        <div className="text-mainFont text-2xl">Add new Change Log</div>
                        <div className="flex w-full gap-5 justify-between">
                            <div className="flex flex-col gap-5 w-full">
                                <div className="text-mainFont text-[18px]">Title</div>
                                <Input type="text" value={changeLog?.title} onChange={(e) => setChangeLog({ ...changeLog, title: e.target.value })} placeholder="John Doe" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont" />
                            </div>
                            <div className="flex flex-col gap-5 w-full">

                                <div className="text-mainFont text-[18px]">Category</div>
                                <Select
                                    className="border border-secondaryBorder bg-inherit rounded-[8px] focus:outline-none !text-mainFont"
                                    onChange={(e) => setChangeLog({ ...changeLog, category: e.target.value })}
                                    value={changeLog?.category}
                                >
                                    {logCategory.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">Article</div>
                            <Editor onChange={(data) => setChangeLog({ ...changeLog, article: DOMPurify.sanitize(data) })} value={changeLog?.article} />
                        </div>
                        <div className="flex justify-end gap-5 mt-8">
                            <Button variant="outlined" onClick={() => router.back()} className="bg-inherit hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-mainFont !text-sm !border !border-secondaryBorder">Cancel</Button>
                            <Button
                                variant="contained"
                                className="!bg-[#FAFAFA]/80 hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-[#000000] !text-sm"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? <CircularProgress size={20} /> : "Update"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div >
        ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)]">
                <CircularProgress />
            </div>
        )
    )
}



export default ChangeLogEdit;
'use client'

import { useEffect, useState } from "react";
import { IChangeLog } from "@/app/lib/interface";
import { Input, Button, Select, MenuItem, CircularProgress } from "@mui/material";
import DOMPurify from 'dompurify';
import { logCategory } from "@/app/lib/stack";
import Editor from "@/app/components/Editor";
import { useRouter } from "next/navigation";
import { toast } from "@/app/hooks/use-toast";
import { useAdmin } from "@/app/context/AdminContext";

const ChangeLogEdit = ({ params }: { params: { id: string } }) => {
    const { id } = params;
    const [changeLog, setChangeLog] = useState<IChangeLog | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const { useFetch } = useAdmin();
    const fetch = useFetch();

    useEffect(() => {
        const fetchChangeLog = async () => {
            const res = await fetch.get(`/api/admin/changeLog/${id}`);
            if (res.status) {
                setChangeLog(res.data);
            } else {
                toast({
                    description: "Failed to fetch change log",
                    variant: "destructive"
                });
            }
        }
        fetchChangeLog();
    }, [id]);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const res = await fetch.put(`/api/admin/changeLog/${id}`, { title: changeLog?.title, article: changeLog?.article, category: changeLog?.category } );
            if (res.status) {
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
        } catch (error) {
            console.log(error);
            toast({
                title: "Change Log Updated",
                description: "Change Log Updated Failed",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        changeLog ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] px-4 mt-10 lg:mt-4" >
                <div className="border-2 border-secondaryBorder rounded-[8px] px-10 lg:px-[74px] py-10 lg:py-[60px] max-w-[900px] w-full bg-[#FFFFFF05] overflow-y-auto">
                    <div className="flex flex-col gap-7">
                        <div className="text-mainFont text-2xl">Edit Change Log</div>
                        <div className="flex w-full gap-5 justify-between lg:flex-row flex-col">
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

                        <div className="flex flex-col gap-5 w-full h-[480px] md:h-[400px] lg:h-[380px]">
                            <div className="text-mainFont text-[18px]">Article</div>
                            <Editor onChange={(data) => setChangeLog({ ...changeLog, article: DOMPurify.sanitize(data) })} value={changeLog?.article} />
                        </div>
                        <div className="flex justify-end gap-5">
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
'use client'

import { Button, Input } from "@mui/material";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "@/app/hooks/use-toast";
import { IChangeLog } from "@/app/lib/interface";

const ChangeLog = () => {
    const router = useRouter();
    const [changeLogs, setChangeLogs] = useState<IChangeLog[]>([]);

    useEffect(() => {
        const fetchChangeLogs = async () => {
            const logs = await fetch("/api/admin/changeLog");
            const data = await logs.json();
            setChangeLogs(data);
        }
        fetchChangeLogs();
    }, []);

    const deleteChangeLog = async (id: string) => {
        if (!id) {
            toast({
                description: "Please select a change log to delete",
                variant: "destructive"
            });
            return;
        }
        const res = await fetch(`/api/admin/changeLog`, {
            method: "DELETE",
            body: JSON.stringify({ id })
        });

        if (res.ok) {
            toast({
                description: "Change log deleted successfully",
                variant: "default"
            });
            const data = await res.json();
            setChangeLogs(data.logs);
        } else {
            toast({
                description: "Failed to delete change log",
                variant: "destructive"
            });
        }
    }

    return (
        <div className="flex flex-col items-center h-[calc(100vh-150px)]">
            <div className="flex flex-col w-full justify-between max-w-[1000px] mt-12">
                <div className="flex justify-between">
                    <div className="relative">
                        <Input type="text" placeholder="Search" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none text-mainFont w-[280px]" />
                        <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-subButtonFont" />
                    </div>
                    <Button
                        variant="contained"
                        className="!bg-[#FAFAFA]/80 hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-[#000000] !text-sm"
                        onClick={() => router.push("/admin/changeLog/add")}
                    >
                        Add New
                    </Button>
                </div>
                <div className="mt-[60px] w-full">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-secondaryBorder">
                                <td className="text-mainFont text-[18px] font-bold w-1/3 py-2">Title</td>
                                <td className="text-mainFont text-[18px] font-bold w-1/4 py-2">Created Date</td>
                                <td className="text-mainFont text-[18px] font-bold w-1/4 py-2">Category</td>
                                <td className="text-mainFont text-[18px] font-bold w-1/6 py-2">Action</td>
                            </tr>
                        </thead>
                        <tbody>
                            {changeLogs.map((log, index) => (
                                <tr key={log._id} className={`hover:bg-[#FFFFFF05] ${index % 2 === 0 ? "bg-[#FFFFFF05]" : "bg-inherit"}`}>
                                    <td className="text-mainFont text-[18px] py-3 px-2">{log.title}</td>
                                    <td className="text-mainFont text-[18px] py-3 px-2">{moment(log.createdAt).format("DD/MM/YYYY")}</td>
                                    <td className="text-mainFont text-[18px] py-3 px-2">{log.category}</td>
                                    <td className="flex gap-2 py-3 px-2">
                                        <div 
                                            className="flex items-center cursor-pointer justify-center w-10 h-10 bg-inherit hover:!bg-[#FFFFFF] disabled:!bg-[#FAFAFA]/80 !text-mainFont !text-sm"
                                            onClick={() => router.push(`/admin/changeLog/${log._id}`)}
                                        >
                                            <FaEdit className="mx-0" />
                                        </div>
                                        <div 
                                            className="flex items-center cursor-pointer justify-center w-10 h-10 bg-inherit hover:!bg-[#FFFFFF] disabled:!bg-[#FAFAFA]/80 !text-mainFont !text-sm"
                                            onClick={() => deleteChangeLog(log._id)}
                                        >
                                            <FaTrash className="mx-0" />
                                        </div>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ChangeLog;

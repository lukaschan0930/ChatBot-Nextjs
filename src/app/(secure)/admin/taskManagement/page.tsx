'use client'

import { Button, Input } from "@mui/material";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import { toast } from "@/app/hooks/use-toast";
import { ITaskList } from "@/app/lib/interface";
import { useAdmin } from "@/app/context/AdminContext";
import { format, startOfWeek, addDays, getWeek } from 'date-fns';

const ChangeLog = () => {
    const router = useRouter();
    const [taskLists, setTaskLists] = useState<ITaskList[]>([]);
    const { useFetch } = useAdmin();
    const fetch = useFetch();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchTaskLists = async () => {
            const res = await fetch.get("/api/admin/taskList");
            if (res.status) {
                setTaskLists(res.data);
            } else {
                toast({
                    description: "Failed to fetch task lists",
                    variant: "destructive"
                });
            }
        }
        fetchTaskLists();
    }, []);

    const deleteTaskList = async (id: string) => {
        if (!id) {
            toast({
                description: "Please select a task list to delete",
                variant: "destructive"
            });
            return;
        }
        const res = await fetch.delete(`/api/admin/taskList`, { id });
        if (res.status) {
            toast({
                description: "Task list deleted successfully",
                variant: "default"
            });
            setTaskLists(res.data);
        } else {
            toast({
                description: "Failed to delete task list",
                variant: "destructive"
            });
        }
    }

    const filteredTaskLists = taskLists.filter(taskList => 
        taskList.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Helper function to get the date range for a specific week
    const getWeekDateRange = (year: number, month: number, week: number) => {
        const targetDate = new Date(year, 0);
        const daysToAdd = (week - 1) * 7;
        targetDate.setDate(targetDate.getDate() + daysToAdd);
        
        const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        
        return {
            weekNum: week,
            display: `Week ${week} (${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')})`
        };
    };

    return (
        <div className="flex flex-col items-center h-[calc(100vh-150px)] px-4 mt-10 lg:mt-4">
            <div className="flex flex-col w-full justify-between max-w-[1000px] mt-12">
                <div className="flex justify-between lg:flex-row flex-col gap-5">
                    <div className="relative lg:w-[280px] w-full">
                        <Input 
                            type="text" 
                            placeholder="Search" 
                            className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont w-full" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-subButtonFont" />
                    </div>
                    <Button
                        variant="contained"
                        className="!bg-[#FAFAFA]/80 hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-[#000000] !text-sm"
                        onClick={() => router.push("/admin/taskManagement/add")}
                    >
                        Add New
                    </Button>
                </div>
                <div className="mt-[60px] w-full overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-secondaryBorder">
                                <td className="text-mainFont text-[18px] font-bold w-1/3 py-2">Title</td>
                                <td className="text-mainFont text-[18px] font-bold w-1/4 py-2">Task Date</td>
                                <td className="text-mainFont text-[18px] font-bold w-1/4 py-2">Weight</td>
                                <td className="text-mainFont text-[18px] font-bold w-1/6 py-2">Action</td>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTaskLists.map((taskList, index) => (
                                <tr key={taskList._id} className={`hover:bg-[#FFFFFF05] ${index % 2 === 0 ? "bg-[#FFFFFF05]" : "bg-inherit"}`}>
                                    <td className="text-mainFont text-[18px] py-3 px-2">{taskList.title}</td>
                                    <td className="text-mainFont text-[18px] py-3 px-2">
                                        <div className="flex flex-col gap-2">
                                            <span className="font-medium">
                                                {format(new Date(taskList.year, taskList.month), 'MMMM yyyy')}
                                            </span>
                                            <span className="text-gray-600">
                                                {getWeekDateRange(taskList.year, taskList.month, taskList.week).display}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-mainFont text-[18px] py-3 px-2">
                                        {taskList.weight}
                                    </td>
                                    <td className="flex gap-2 py-3 px-2">
                                        <div 
                                            className="flex items-center cursor-pointer justify-center w-10 h-10 bg-inherit hover:!bg-[#FFFFFF] disabled:!bg-[#FAFAFA]/80 !text-mainFont !text-sm"
                                            onClick={() => router.push(`/admin/taskManagement/${taskList._id}`)}
                                        >
                                            <FaEdit className="mx-0" />
                                        </div>
                                        <div 
                                            className="flex items-center cursor-pointer justify-center w-10 h-10 bg-inherit hover:!bg-[#FFFFFF] disabled:!bg-[#FAFAFA]/80 !text-mainFont !text-sm"
                                            onClick={() => deleteTaskList(taskList._id)}
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

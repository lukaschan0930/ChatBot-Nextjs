'use client'

import { useEffect, useState } from "react";
import { ITaskList } from "@/app/lib/interface";
import { Input, Button, Select, MenuItem, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { toast } from "@/app/hooks/use-toast";
import { useAdmin } from "@/app/context/AdminContext";
import { getWeek, startOfMonth, endOfMonth, eachWeekOfInterval, format, setWeek } from "date-fns";

const TaskListEdit = ({ params }: { params: { id: string } }) => {
    const { id } = params;
    const [taskList, setTaskList] = useState<ITaskList | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const { useFetch } = useAdmin();
    const fetch = useFetch();

    const getWeeksInMonth = (year: number, month: number) => {
        const startDate = startOfMonth(new Date(year, month));
        const endDate = endOfMonth(new Date(year, month));

        const weeks = eachWeekOfInterval(
            { start: startDate, end: endDate },
            { weekStartsOn: 1 }
        ).map(date => ({
            weekNum: getWeek(date),
            display: `Week ${getWeek(date)} (${format(date, 'MMM d')} - ${format(date.setDate(date.getDate() + 6), 'MMM d')})`
        }));

        return weeks;
    };

    useEffect(() => {
        if (taskList) {
            const weeksInMonth = getWeeksInMonth(taskList?.year || 0, taskList?.month || 0);
            if (!weeksInMonth.some(w => w.weekNum === taskList?.week)) {
                setTaskList({ ...taskList, week: weeksInMonth[0]?.weekNum || 1 });
            }
        }
    }, [taskList?.year, taskList?.month]);

    useEffect(() => {
        const fetchTaskList = async () => {
            const res = await fetch.get(`/api/admin/taskList/${id}`);
            if (res.status) {
                setTaskList(res.data);
            } else {
                toast({
                    description: "Failed to fetch task list",
                    variant: "destructive"
                });
            }
        }
        fetchTaskList();
    }, [id]);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const res = await fetch.put(`/api/admin/taskList/${id}`, { title: taskList?.title, year: taskList?.year, month: taskList?.month, week: taskList?.week, weight: taskList?.weight || 0 });
            if (res.status) {
                toast({
                    title: "Task List Updated",
                    description: "Task List Updated Successfully",
                    variant: "default"
                });
                router.push("/admin/taskManagement");
            } else {
                toast({
                    title: "Task List Updated",
                    description: "Task List Updated Failed",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.log(error);
            toast({
                title: "Task List Updated",
                description: "Task List Updated Failed",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        taskList ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] px-4 mt-10 lg:mt-4" >
                <div className="border-2 border-secondaryBorder rounded-[8px] px-10 lg:px-[74px] py-10 lg:py-[60px] max-w-[900px] w-full bg-[#FFFFFF05] overflow-y-auto">
                    <div className="flex flex-col gap-7">
                        <div className="text-mainFont text-2xl">Edit Task List</div>
                        <div className="flex w-full gap-5 justify-between flex-col">
                            <div className="flex w-full gap-5 justify-between lg:flex-row flex-col">
                                <div className="flex flex-col gap-5 w-full">
                                    <div className="text-mainFont text-[18px]">Title</div>
                                    <Input type="text" value={taskList?.title} onChange={(e) => setTaskList({ ...taskList, title: e.target.value })} placeholder="John Doe" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont" />
                                </div>
                                <div className="flex flex-col gap-5 w-full">
                                    <div className="text-mainFont text-[18px]">Weight</div>
                                    <Input type="number" value={taskList?.weight} onChange={(e) => setTaskList({ ...taskList, weight: Number(e.target.value) })} placeholder="0" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont" />
                                </div>
                            </div>
                            <div className="flex w-full gap-5 justify-between lg:flex-row flex-col">
                                <div className="flex flex-col gap-5 w-full">
                                    <div className="text-mainFont text-[18px]">Year</div>
                                    <Select
                                        className="border border-secondaryBorder bg-inherit rounded-[8px] focus:outline-none !text-mainFont"
                                        onChange={(e) => setTaskList({ ...taskList, year: Number(e.target.value) })}
                                        value={taskList?.year}
                                    >
                                        {Array.from({ length: 11 }, (_, i) => {
                                            const currentYear = new Date().getFullYear();
                                            const yearValue = currentYear + (i - 5); // Starts from -5 to +5
                                            return (
                                                <MenuItem key={i} value={yearValue}>
                                                    {yearValue}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-5 w-full">
                                    <div className="text-mainFont text-[18px]">Month</div>
                                    <Select
                                        className="border border-secondaryBorder bg-inherit rounded-[8px] focus:outline-none !text-mainFont"
                                        onChange={(e) => setTaskList({ ...taskList, month: Number(e.target.value) })}
                                        value={taskList?.month}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <MenuItem key={i} value={i}>
                                                {format(new Date(taskList?.year || 0, i), 'MMMM')}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-5 w-full">
                                    <div className="text-mainFont text-[18px]">Week</div>
                                    <Select
                                        className="border border-secondaryBorder bg-inherit rounded-[8px] focus:outline-none !text-mainFont"
                                        onChange={(e) => setTaskList({ ...taskList, week: Number(e.target.value) })}
                                        value={taskList?.week}
                                    >
                                        {getWeeksInMonth(taskList?.year || 0, taskList?.month || 0).map((week) => (
                                            <MenuItem key={week.weekNum} value={week.weekNum}>{week.display}</MenuItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>
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



export default TaskListEdit;
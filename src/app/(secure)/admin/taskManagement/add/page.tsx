'use client'

import { Input, Button, Select, MenuItem, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/app/hooks/use-toast";
import { useAdmin } from "@/app/context/AdminContext";
import { getWeek, startOfMonth, endOfMonth, eachWeekOfInterval, format } from "date-fns";

const AddTaskList = () => {
    const router = useRouter();
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth());
    const [week, setWeek] = useState<number>(getWeek(new Date()));
    const [title, setTitle] = useState<string>("");
    const [weight, setWeight] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const { useFetch } = useAdmin();
    const fetch = useFetch();

    const handleSubmit = async () => {
        if (!title || !year || !month || !week) {
            toast({
                title: "Task List Added",
                description: "Please fill in all fields",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch.post("/api/admin/taskList", { title, year, month, week, weight });
            if (res.status) {
                toast({
                    title: "Task List Added",
                    description: "Task List Added Successfully",
                    variant: "default"
                });
                router.push("/admin/taskManagement");
            } else {
                toast({
                    title: "Task List Added",
                    description: "Task List Added Failed",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.log(error);
            toast({
                title: "Task List Added",
                description: "Task List Added Failed",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

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
        const weeksInMonth = getWeeksInMonth(year, month);
        if (!weeksInMonth.some(w => w.weekNum === week)) {
            setWeek(weeksInMonth[0]?.weekNum || 1);
        }
    }, [year, month]);

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] px-4 mt-10 lg:mt-4">
            <div className="border-2 border-secondaryBorder rounded-[8px] px-10 lg:px-[74px] py-10 lg:py-[60px] max-w-[900px] w-full bg-[#FFFFFF05] overflow-y-auto">
                <div className="flex flex-col gap-7">
                    <div className="text-mainFont text-2xl">Add new Task List</div>
                    <div className="flex w-full gap-5 justify-between flex-col">
                        <div className="flex w-full gap-5 justify-between lg:flex-row flex-col">
                            <div className="flex flex-col gap-5 w-full">
                                <div className="text-mainFont text-[18px]">Title</div>
                                <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="John Doe" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont" />
                            </div>
                            <div className="flex flex-col gap-5 w-full">
                                <div className="text-mainFont text-[18px]">Weight</div>
                                <Input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} placeholder="0" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont" />
                            </div>
                        </div>
                        <div className="flex w-full gap-5 justify-between lg:flex-row flex-col">
                            <div className="flex flex-col gap-5 w-full">
                                <div className="text-mainFont text-[18px]">Year</div>
                                <Select
                                    className="border border-secondaryBorder bg-inherit rounded-[8px] focus:outline-none !text-mainFont"
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    value={year}
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
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                    value={month}
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <MenuItem key={i} value={i}>
                                            {format(new Date(year, i), 'MMMM')}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </div>
                            <div className="flex flex-col gap-5 w-full">
                                <div className="text-mainFont text-[18px]">Week</div>
                                <Select
                                    className="border border-secondaryBorder bg-inherit rounded-[8px] focus:outline-none !text-mainFont"
                                    onChange={(e) => setWeek(Number(e.target.value))}
                                    value={week}
                                >
                                    {getWeeksInMonth(year, month).map((weekData, i) => (
                                        <MenuItem key={i} value={weekData.weekNum}>
                                            {weekData.display}
                                        </MenuItem>
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

export default AddTaskList;
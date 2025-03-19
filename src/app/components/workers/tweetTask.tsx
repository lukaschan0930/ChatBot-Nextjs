import { ITaskList } from "@/app/lib/interface";
import { startOfWeek, addDays, format } from "date-fns";

const TweetTask = ({ taskList }: { taskList: ITaskList }) => {
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
        <div className="w-full border border-[#25252799] rounded-xl flex flex-col">
            <div className="px-6 py-4 bg-[#0E0E10] flex justify-between items-start rounded-xl">
                <div className="flex flex-col gap-2">
                    <div className="text-white text-sm font-normal">{taskList.title}</div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-[#FFFFFF99] text-xs font-normal">Weight: {taskList.weight}</div>
                </div>
            </div>
            <div className="border-t border-[#FFFFFF1F] px-7 py-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <div className="text-[#3E3E40] text-[12px] font-normal">
                        {getWeekDateRange(taskList.year, taskList.month, taskList.week).display}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TweetTask;
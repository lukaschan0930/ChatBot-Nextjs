import { useState, useEffect } from "react";

const RemainTime = () => {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const endOfWeek = new Date();
            const utcDay = now.getUTCDay();
            endOfWeek.setUTCDate(now.getUTCDate() + (6 - utcDay));
            endOfWeek.setUTCHours(23, 59, 59, 999);
            
            return endOfWeek.getTime() - now.getTime();
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return (
        <div className="flex items-center gap-5">
            <div className="flex flex-col">
                <div className="text-[#FFFFFF99] text-[12px]">Days</div>
                <div className="text-mainFont text-[20px]">{days.toString().padStart(2, '0')}</div>
            </div>
            <div className="text-[#FFFFFF99] text-[20px]">|</div>
            <div className="flex flex-col">
                <div className="text-[#FFFFFF99] text-[12px]">Hours</div>
                <div className="text-mainFont text-[20px]">{hours.toString().padStart(2, '0')}</div>
            </div>
            <div className="text-[#FFFFFF99] text-[20px]">|</div>
            <div className="flex flex-col">
                <div className="text-[#FFFFFF99] text-[12px]">Mins</div>
                <div className="text-mainFont text-[20px]">{minutes.toString().padStart(2, '0')}</div>
            </div>
            <div className="text-[#FFFFFF99] text-[20px]">|</div>
            <div className="flex flex-col">
                <div className="text-[#FFFFFF99] text-[12px]">Secs</div>
                <div className="text-mainFont text-[20px]">{seconds.toString().padStart(2, '0')}</div>
            </div>
        </div>
    );
}

export default RemainTime;
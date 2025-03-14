const TopWorker = ({ username, rank, score }: { username: string, rank: number, score: number }) => {

    return (
        <div className="w-full border border-[#25252799] rounded-xl flex flex-col bg-[#0E0E10]">
            <div className="px-6 py-4 bg-[#0E0E10] flex justify-between items-center">
                <div className="text-white text-sm font-normal">{username}</div>
                <div className="px-3 py-1 bg-[#FFFFFF05] border-[#FFFFFF0A] text-white border rounded-md flex items-center gap-1">
                    RANK: {rank}
                </div>
            </div>
            <div className="border-t border-[#FFFFFF1F] px-7 py-4 flex flex-col gap-3 bg-[#FFFFFF03]">
                <div className="flex justify-between items-center">
                    <div className="text-white text-[12px] font-normal flex items-center gap-8">
                        Score: {score}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TopWorker;
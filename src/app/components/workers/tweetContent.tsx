import { useState } from "react";
import { ITweetContentItem } from "@/app/lib/interface";
import PendingIcon from "@/app/assets/pendingIcon";
import ApproveIcon from "@/app/assets/approveIcon";
import RejectIcon from "@/app/assets/rejectIcon";
import ArchiveIcon from "@/app/assets/archiveIcon";
import { FaChevronDown } from "react-icons/fa";
import { Divider } from "@mui/material";

const TweetContent = ({ content }: { content: ITweetContentItem }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full border border-[#25252799] rounded-xl flex flex-col">
            <div className="px-6 py-4 bg-[#0E0E10] flex justify-between items-start gap-2 rounded-xl">
                <div className="flex flex-col gap-2">
                    <div className="text-white text-sm font-normal">{content.title}</div>
                    <div className="text-[#808080] text-[12px] font-normal">{content.url}</div>
                </div>
                <div className="px-3 py-1 bg-[#FFFFFF05] border-[#FFFFFF0A] text-white border rounded-md flex items-center gap-1">
                    {
                        content.status === 1 ?
                            <><PendingIcon />Pending</> :
                            content.status === 2 ?
                                <><ApproveIcon />Approved</> :
                                content.status === 3 ?
                                    <><RejectIcon />Rejected</> :
                                    <><ArchiveIcon />Archived</>
                    }
                </div>
            </div>
            <div className="border-t border-[#FFFFFF1F] px-7 py-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <div className="text-white text-[12px] font-normal flex items-center gap-8">
                        Score: {content.score}
                        {
                            content.score > 0 &&
                            <button
                                className="text-[#FFFFFF99] text-[12px] font-normal flex items-center gap-1"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                Know More
                                <FaChevronDown className={`text-[#FFFFFF99] ${isOpen ? 'rotate-180' : ''} transition-all duration-150`} />
                            </button>
                        }
                    </div>
                    <div className="text-[#3E3E40] text-[12px] font-normal">
                        {new Date(content.createdAt).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: '2-digit'
                        }).replace(',', '').replace(/(\d+)/, '$1th')}
                    </div>
                </div>
                {
                    content.score > 0 &&
                    <div 
                        className={`
                            text-[#FFFFFF99]
                            text-[12px]
                            font-normal
                            flex
                            items-center 
                            gap-3
                            overflow-hidden
                            transition-all
                            duration-300
                            ease-in-out
                            ${isOpen ? 'max-h-fit opacity-100' : 'max-h-0 opacity-0'}
                        `}
                    >
                        <div>
                            <span> Base </span>
                            <span> : </span>
                            <span className="text-white"> {content.base} </span>
                        </div>
                        <Divider orientation="vertical" className="h-full" />
                        <div>
                            <span> Performance </span>
                            <span> : </span>
                            <span className="text-white"> {content.performance} </span>
                        </div>
                        <Divider orientation="vertical" className="h-full" />
                        <div>
                            <span> Quality </span>
                            <span> : </span>
                            <span className="text-white"> {content.quality} </span>
                        </div>
                        <Divider orientation="vertical" className="h-full" />
                        <div>
                            <span> Bonus </span>
                            <span> : </span>
                            <span className="text-white"> {content.bonus} </span>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default TweetContent;
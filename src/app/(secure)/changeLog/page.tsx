'use client'

import { useEffect, useState } from "react";
import { IChangeLog } from "@/app/lib/interface";
import { logCategory } from "@/app/lib/stack";
import { FaSearch } from "react-icons/fa";
import moment from "moment";
import MarkdownIt from 'markdown-it'
import CircularProgress from "@mui/material/CircularProgress";

const ChangeLog = () => {

    const [changeLogs, setChangeLogs] = useState<IChangeLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [category, setCategory] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
    });

    useEffect(() => {
        const fetchChangeLogs = async () => {
            setIsLoading(true);
            const res = await fetch("/api/admin/changeLog");
            if (res.ok) {
                const data = await res.json();
                setChangeLogs(data.data);
            }
            setIsLoading(false);
        }
        fetchChangeLogs();
    }, []);


    return (
        <div className="min-h-screen w-screen flex flex-col items-center">
            <div className="mt-[120px] lg:mt-[172px] lg:max-w-[1000px] w-full flex flex-col px-6 mb-10">
                <div className="flex max-md:flex-col lg:items-center justify-between mb-5 gap-4">
                    <div className="flex items-center gap-6">
                        <div className={`cursor-pointer ${category === "" ? "text-mainFont border-b-2 border-mainFont" : "text-subButtonFont"}`} onClick={() => setCategory("")}>All</div>
                        {logCategory.map((item: { id: string, label: string }, index: number) => (
                            <div key={index} className={`cursor-pointer ${category === item.id ? "text-mainFont border-b-2 border-mainFont" : "text-subButtonFont"}`} onClick={() => setCategory(item.id)}>{item.label}</div>
                        ))}
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full p-2 rounded-md border border-secondaryBorder bg-inherit text-mainFont"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FaSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-mainFont" />
                    </div>
                </div>
                {
                    isLoading ? (
                        <div className="flex flex-col justify-center items-center h-full flex-auto">
                            <CircularProgress />
                        </div>
                    ) : (
                        changeLogs
                            .filter((item: IChangeLog) => 
                                (category === "" || category === item.category) &&
                                (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 item.article.toLowerCase().includes(searchQuery.toLowerCase()))
                            )
                            .map((item: IChangeLog, index: number) => (
                                <div key={index} className="flex flex-col gap-4 border-b-2 border-secondaryBorder pb-5 mt-[40px]">
                                    <div className="flex items-center gap-5">
                                        <div className="bg-[#FFFFFF05] rounded-md text-mainFont border border-gray-400 px-2 py-1">{item.category}</div>
                                        <div className="text-subButtonFont">{moment(item.createdAt).format("DD/MM/YYYY")}</div>
                                    </div>
                                    <div className="flex w-full justify-between">
                                        <div className="flex flex-col gap-2">
                                            <h1 className="text-mainFont font-bold text-2xl">{item.title}</h1>
                                        </div>
                                    </div>
                                    <div className="break-words answer-markdown text-mainFont px-2" dangerouslySetInnerHTML={{ __html: md.render(item.article) }}></div>
                                </div>
                            ))
                    )
                }
            </div>
        </div>

    )
}

export default ChangeLog;

'use client'

import { useEffect, useState } from "react";
import { IChangeLog } from "@/app/lib/interface";
import { logCategory } from "@/app/lib/stack";
import { FaSearch } from "react-icons/fa";
import moment from "moment";
import MarkdownIt from 'markdown-it'
import CircularProgress from "@mui/material/CircularProgress";
import ShadowBtn from "@/app/components/ShadowBtn";
import Point from "@/app/assets/point";
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
            <div className="mt-6 sm:mt-[120px] lg:mt-[152px] lg:max-w-[700px] w-full flex flex-col mb-10 items-center px-6 lg:px-0">
                <div className="text-[24px] font-semibold text-mainFont max-sm:hidden">Changelog</div>
                <div className="flex items-center justify-between mb-6 max-sm:gap-x-3 w-full gap-x-[36px] gap-y-4 mt-[60px]">
                    <div className="max-sm:hidden flex items-center gap-1 rounded-2xl p-2 border-2 border-[#25252799]">
                        <ShadowBtn
                            className={category !== "" ? "bg-transparent" : ""}
                            mainClassName={`py-1 px-2 text-mainFont max-md:text-[12px] ${category !== "" && "bg-transparent"}`}
                            onClick={() => setCategory("")}
                        >
                            All
                        </ShadowBtn>
                        {logCategory.map((item: { id: string, label: string }, index: number) => (
                            <ShadowBtn
                                className={category !== item.id ? "bg-transparent" : ""}
                                mainClassName={`py-1 px-2 text-mainFont max-md:text-[12px] ${category !== item.id && "bg-transparent"}`}
                                onClick={() => setCategory(item.id)}
                                key={index}
                            >
                                {item.label}
                            </ShadowBtn>
                        ))}
                    </div>
                    <div className="relative max-sm:w-full">
                        <input
                            type="text"
                            placeholder="Search"
                            className="pr-2 pl-10 py-3 rounded-2xl max-md:text-[12px] max-md:w-full border border-[#25252799] bg-[#0E0E10] text-mainFont w-[250px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mainFont" />
                    </div>
                    <select
                        className="text-[12px] p-3 rounded-2xl border border-[#25252799] bg-[#0E0E10] text-mainFont sm:hidden"
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="all">All</option>
                        {logCategory.map((item: { id: string, label: string }, index: number) => (
                            <option value={item.id} key={index}>{item.label}</option>
                        ))}
                    </select>
                </div>
                {
                    isLoading ? (
                        <div className="flex flex-col justify-center items-center h-full flex-auto">
                            <CircularProgress />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-12 w-full">
                            {
                                changeLogs
                                    .filter((item: IChangeLog) =>
                                        (category === "" || category === item.category) &&
                                        (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            item.article.toLowerCase().includes(searchQuery.toLowerCase()))
                                    )
                                    .sort((a: IChangeLog, b: IChangeLog) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map((item: IChangeLog, index: number) => (
                                        <div
                                            key={index}
                                            className="flex flex-col bg-[#0E0E10] border-2 border-[#25252799] rounded-2xl w-full"
                                        >
                                            <div className="flex flex-col p-6 gap-3">
                                                <h1 className="text-mainFont text-lg">{item.title}</h1>
                                                <div className="break-words answer-markdown text-[#808080] text-[12px]" dangerouslySetInnerHTML={{ __html: md.render(item.article) }}></div>
                                            </div>
                                            <div className="bg-[#FFFFFF03] px-6 py-2 flex justify-between items-center w-full border-t border-[#25252799]">
                                                <div className="text-[12px] px-3 py-[6px] rounded-md border border-[#25252799] text-mainFont">{item.category}</div>
                                                <div className="text-[#3E3E40] text-[12px] flex gap-2 items-center">
                                                    <span>CEO Founder</span>
                                                    <Point />
                                                    {moment(item.createdAt).format("Do MMM YY")}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default ChangeLog;

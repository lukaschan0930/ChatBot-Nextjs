import React from "react";
import { splitByFirstCodeFence, toTitleCase } from "@/app/lib/utils";
import MarkdownIt from 'markdown-it'
import { IRoboChatLog } from "@/app/lib/interface";
import { ArrowRight, ChevronRight } from "lucide-react";
import { roboActiveChatAtom } from "@/app/lib/store";
import { useAtom } from "jotai";

const RoboResponse = ({ message, content, version }: { message: IRoboChatLog, content: string, version: number }) => {
    const [roboActiveChat, setRoboActiveChat] = useAtom(roboActiveChatAtom);
    const parts = splitByFirstCodeFence(content);
    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
    });

    return (
        <React.Fragment>
            {parts.map((part, i) => (
                <div key={i}>
                    {part.type === "text" ? (
                        <div className="break-words answer-markdown" dangerouslySetInnerHTML={{ __html: md.render(part.content) }}></div>
                    ) : part.type === "first-code-fence-generating" ? (
                        <div className="my-4">
                            <button
                                disabled
                                className="inline-flex w-full items-center gap-2 rounded-lg border bg-[#181818] border-[#2C2B30] px-4 py-5 hover:outline-none hover:border-[#3C3B40]"
                            >
                                <div className="flex size-8 items-center justify-center rounded font-bold border border-[#2C2B30]">
                                    V{version}
                                </div>
                                <div className="flex flex-col gap-0.5 text-left leading-none">
                                    <div className="text-sm font-medium leading-none">
                                        Generating...
                                    </div>
                                </div>
                            </button>
                        </div>
                    ) : message ? (
                        <div className="my-4">
                            <button
                                onClick={() => {
                                    setRoboActiveChat(message);
                                }}
                                className={`inline-flex w-full items-center gap-2 rounded-lg border bg-[#181818] border-[#2C2B30] px-4 py-5 hover:outline-none hover:border-[#3C3B40]`}
                            >
                                {/* <div
                                    className={`flex size-8 items-center justify-center rounded font-bold`}
                                >
                                    V{version}
                                </div> */}
                                {/* <div className="flex flex-col gap-0.5 text-left leading-none">
                                    <div className="text-sm font-medium leading-none">
                                        {toTitleCase(part.filename.name)}{" "}
                                        {version !== 1 && `v${version}`}
                                    </div>
                                    <div className="text-xs leading-none text-gray-500">
                                        {part.filename.name}
                                        {version !== 1 && `-v${version}`}
                                        {"."}
                                        {part.filename.extension}
                                    </div>
                                </div> */}
                                <div className="text-sm font-medium leading-none">
                                    {toTitleCase(part.filename.name)}{" "}
                                    {version !== 1 && `v${version}`}
                                </div>
                                <div className="ml-auto">
                                    <ChevronRight />
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="my-4">
                            <button
                                className={`inline-flex w-full items-center gap-2 rounded-lg border border-[#2C2B30] px-4 py-5 hover:outline-none hover:border-[#3C3B40]`}
                                disabled
                            >
                                {/* <div className="flex size-8 items-center justify-center rounded bg-gray-300 font-bold">
                                    V{version}
                                </div> */}
                                {/* <div className="flex flex-col gap-0.5 text-left leading-none">
                                    <div className="text-sm font-medium leading-none">
                                        {toTitleCase(part.filename.name)}{" "}
                                        {version !== 1 && `v${version}`}
                                    </div>
                                    <div className="text-xs leading-none text-gray-500">
                                        {part.filename.name}
                                        {version !== 1 && `-v${version}`}
                                        {"."}
                                        {part.filename.extension}
                                    </div>
                                </div> */}
                                <div className="text-sm font-medium leading-none">
                                    {toTitleCase(part.filename.name)}{" "}
                                    {version !== 1 && `v${version}`}
                                </div>
                                <div className="ml-auto">
                                    <ChevronRight />
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </React.Fragment>
    );
};

export default RoboResponse;
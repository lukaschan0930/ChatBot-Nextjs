import { useState } from "react";
import ShadowBtn from "../../ShadowBtn";
import { Divider } from "@mui/material";
import { RefreshCcw, X } from "lucide-react";
import { roboActiveChatAtom, roboChatLogAtom } from "@/app/lib/store";
import { extractFirstCodeBlock, splitByFirstCodeFence } from "@/app/lib/utils";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";

const CodeRunner = dynamic(() => import("./code-runner"), {
    ssr: false,
});
const SyntaxHighlighter = dynamic(
    () => import("./syntax-highlighter"),
    {
        ssr: false,
    },
);

const RoboCodeViewer = ({ fullScreen, setFullScreen }: { fullScreen: boolean, setFullScreen: (fullScreen: boolean) => void }) => {
    const [isCode, setIsCode] = useState(true);
    const [roboActiveChat, setRoboActiveChat] = useAtom(roboActiveChatAtom);
    const [roboChatLog] = useAtom(roboChatLogAtom);

    const app = roboActiveChat ? extractFirstCodeBlock(roboActiveChat.content) : undefined;
    const streamAppParts = splitByFirstCodeFence(roboActiveChat?.content || "");
    const streamApp = streamAppParts.find(
        (p) =>
            p.type === "first-code-fence-generating" || p.type === "first-code-fence",
    );
    const streamAppIsGenerating = streamAppParts.some(
        (p) => p.type === "first-code-fence-generating",
    );

    const code = streamApp ? streamApp.content : app?.code || "";
    const language = streamApp ? streamApp.language : app?.language || "";
    const title = streamApp ? streamApp.filename.name : app?.filename?.name || "";
    const layout = ["python", "ts", "js", "javascript", "typescript"].includes(
        language,
    )
        ? "two-up"
        : "tabbed";

    const assistantMessages = roboChatLog.filter((m) => m.role === "assistant");
    const currentVersion = streamApp
        ? assistantMessages.length
        : roboActiveChat
            ? assistantMessages.map((m) => m._id).indexOf(roboActiveChat._id)
            : 1;
    const previousMessage =
        currentVersion !== 0 ? assistantMessages.at(currentVersion - 1) : undefined;
    const nextMessage =
        currentVersion < assistantMessages.length
            ? assistantMessages.at(currentVersion + 1)
            : undefined;

    const [refresh, setRefresh] = useState(0);

    return (
        <div className={`${roboActiveChat ? "w-full opacity-100  max-md:z-10" : "w-0 opacity-0 max-md:hidden"} transition-all duration-300 h-full bg-[#0C0C0E] border-[#25252799] border rounded-[16px] flex flex-col max-md:absolute max-md:bottom-[20px] max-md:left-1/2 max-md:transform max-md:-translate-x-1/2 max-md:w-[calc(100vw-10px)] max-md:h-[calc(100vh-100px)] max-sm:h-[calc(100vh-140px)]`}>
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center p-2 bg-[#0B0B0D] border border-[#25252799] rounded-full">
                    <ShadowBtn
                        className={`rounded-full ${!isCode && "bg-transparent"}`}
                        mainClassName={`text-sm rounded-full px-4 py-[6px] ${!isCode && "bg-transparent"}`}
                        onClick={() => setIsCode(true)}
                    >
                        Code
                    </ShadowBtn>
                    <ShadowBtn
                        className={`rounded-full ${isCode && "bg-transparent"}`}
                        mainClassName={`text-sm rounded-full px-4 py-[6px] ${isCode && "bg-transparent"}`}
                        onClick={() => setIsCode(false)}
                    >
                        Preview
                    </ShadowBtn>
                </div>
                <div className="max-md:hidden">{title} v{currentVersion}</div>
                <ShadowBtn className="md:hidden" onClick={() => setRoboActiveChat(undefined)}>
                    <X />
                </ShadowBtn>
            </div>
            <Divider className="w-full" sx={{ borderColor: "#25252799" }} />
            <div className={`flex-auto ${fullScreen ? "w-[calc(100vw-100px)]" : "xl:w-[calc(100vw-800px)] lg:w-[calc(100vw-600px)] md:w-[calc(50vw-60px)] w-[calc(100vw-10px)]"} h-full overflow-auto`}>
                {
                    isCode ?
                        <SyntaxHighlighter code={code} language={language} />
                        :
                        <div className="w-full h-full">
                            <CodeRunner
                                onRequestFix={() => {
                                    setRefresh(refresh + 1);
                                }}
                                code={code}
                                language={language}
                                key={refresh}
                            />
                        </div>
                }
            </div>
            <Divider className="w-full" sx={{ borderColor: "#25252799" }} />
            <div className="flex items-center justify-end px-4 py-3">
                {/* <div>Downloading [3/3]  ....</div> */}
                <div>
                    <ShadowBtn
                        className="rounded-full"
                        mainClassName="text-sm rounded-full px-3 py-2 flex items-center gap-2"
                        onClick={() => {
                            setRefresh(refresh + 1);
                        }}
                    >
                        <RefreshCcw />
                        Refresh
                    </ShadowBtn>
                </div>
            </div>
        </div >
    )
}

export default RoboCodeViewer;
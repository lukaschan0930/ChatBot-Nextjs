import { useEffect, useState } from "react";
import { FiCheck, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import { useAtom } from "jotai";
import { ChatHistory as ChatHistoryType } from "@/app/lib/interface";
import { chatHistoryAtom, chatLogAtom, sessionIdAtom, isStartChatAtom, isSidebarVisibleAtom } from "@/app/lib/store";
import CircularProgress from "@mui/material/CircularProgress";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { generateSessionId } from "@/app/lib/utils";
import { useSession } from "next-auth/react";
import ShadowBtn from "@/app/components/ShadowBtn";
import { Divider } from "@mui/material";

const ChatHistory = () => {
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
    const [, setIsLoading] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useAtom(chatHistoryAtom);
    const [, setChatLog] = useAtom(chatLogAtom);
    const [sessionId, setSessionId] = useAtom(sessionIdAtom);
    const [, setIsStartChat] = useAtom(isStartChatAtom);
    const [isSidebarVisible, setIsSidebarVisible] = useAtom(isSidebarVisibleAtom);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState<string>("");
    const router = useRouter();
    const { data: session } = useSession();

    const deleteSession = async (id: string) => {
        await setChatHistory(chatHistory.filter((session) => session.id !== id));
        if (sessionId === id) {
            setSessionId(chatHistory[0].id);
        }
        await fetch("/api/chat/history", {
            method: "DELETE",
            body: JSON.stringify({ id }),
        });
    }

    const extractTitleFromMd = (markdown: string) => {
        const cleanText = markdown
            .replace(/^#+\s+/, '')  // Remove heading symbols
            .replace(/\*\*/g, '');  // Remove asterisks
        return cleanText.trim() || 'Untitled Chat';
    }

    // Function to handle title update
    const updateSessionTitle = async (id: string, newTitle: string) => {
        if (newTitle != "" && newTitle != extractTitleFromMd(chatHistory.find(session => session.id === id)?.title || "")) {
            try {
                await fetch("/api/chat/history", {
                    method: "PUT",
                    body: JSON.stringify({ id, title: newTitle }),
                });
                setChatHistory(chatHistory.map(session =>
                    session.id === id ? { ...session, title: newTitle } : session
                ));
            } catch (error) {
                console.error(error);
            }
        }
        setEditingSessionId(null);
    };

    useEffect(() => {
        setChatHistory([]);
        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            setIsLoading(true);
            try {
                const res = await fetch("/api/chat/history");
                const data = await res.json();
                if (data.success) {
                    setChatHistory(data.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        const fetchChats = async () => {
            if (sessionId) {
                setIsLoading(true);
                try {
                    const chats = await fetch(`/api/chat/log?sessionId=${sessionId}`);
                    const data = await chats.json();
                    if (data.success && data.data && data.data.length > 0) {
                        setChatLog(data.data);
                        setIsStartChat(true);
                    } else {
                        setIsStartChat(false);
                    }
                } catch (error) {
                    console.error(error);
                    setIsStartChat(false);
                } finally {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setIsLoading(false);
                }
            }
        };

        if (sessionId) {
            fetchChats();
        }
    }, [sessionId]);

    const categorizeSessions = (sessions: ChatHistoryType[]) => {
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'days').startOf('day');
        const last7Days = moment().subtract(7, 'days').startOf('day');
        const last30Days = moment().subtract(30, 'days').startOf('day');

        const categories = {
            today: [] as ChatHistoryType[],
            yesterday: [] as ChatHistoryType[],
            last7Days: [] as ChatHistoryType[],
            last30Days: [] as ChatHistoryType[],
        };

        sessions.forEach(session => {
            const sessionTime = moment(Number(session.chats[session.chats.length - 1].timestamp));
            if (sessionTime.isSameOrAfter(today)) {
                categories.today.push(session);
            } else if (sessionTime.isSameOrAfter(yesterday)) {
                categories.yesterday.push(session);
            } else if (sessionTime.isSameOrAfter(last7Days)) {
                categories.last7Days.push(session);
            } else if (sessionTime.isSameOrAfter(last30Days)) {
                categories.last30Days.push(session);
            }
        });

        return categories;
    };

    const categorizedSessions = categorizeSessions(chatHistory.sort((a, b) => Number(b.chats[b.chats.length - 1].timestamp) - Number(a.chats[a.chats.length - 1].timestamp)));

    return (
        <div className={`border-primaryBorder flex flex-col items-start mt-[72px] max-h-[calc(100vh-72px)] transition-all duration-500 ease-in-out ${isSidebarVisible ? "w-[260px] px-2 border-r-2 opacity-100" : "w-0 px-0 border-0 opacity-0"} max-md:fixed max-md:inset-0 max-md:bg-black max-md:z-50`}>
            {
                isSidebarVisible && (
                    <>
                        <div className="w-full px-2">
                            <ShadowBtn
                                className="bg-btn-new-chat w-full mt-6"
                                mainClassName="bg-gradient-to-b from-[#DFDFDF] to-[#BFBFBF] flex py-2 px-[10px] justify-between items-center"
                                onClick={() => {
                                    setIsStartChat(false);
                                    setSessionId(generateSessionId(
                                        session?.user?.email as string,
                                        Date.now().toString()
                                    ));
                                    setIsSidebarVisible(false);
                                    setChatLog([]);
                                }}
                            >
                                <span className="text-black font-semibold text-sm">New Thread</span>
                                <ShadowBtn
                                    mainClassName="px-1 py-[2px] text-[12px]"
                                >
                                    <span className="text-[10px]">⌘</span> N
                                </ShadowBtn>
                            </ShadowBtn>
                        </div>
                        <div className="text-subButtonFont mt-7 mb-3 px-2">History</div>
                        <div className="w-full px-2">
                            <Divider sx={{ color: "#29292B", width: "100%", "&.MuiDivider-root": { borderColor: "#29292B" } }} />
                        </div>
                        <div className="text-left flex flex-col flex-auto overflow-y-auto gap-1 overflow-x-hidden w-full">
                            {isLoadingHistory ? (
                                <CircularProgress className="my-4" />
                            ) : (
                                Object.entries(categorizedSessions).map(([category, sessions]) => (
                                    sessions.length > 0 &&
                                    <div key={category}>
                                        <div className="w-full px-2">
                                            <div className="text-subButtonFont my-4 border-b border-[#29292B] w-fit">{category.charAt(0).toUpperCase() + category.slice(1)}</div>
                                        </div>
                                        {sessions.map((session: ChatHistoryType) => (
                                            <div
                                                key={session.id}
                                                className={`${session.id === sessionId ?
                                                        "text-mainFont p-[1px] bg-btn-shadow" :
                                                        "cursor-pointer"} 
                                                rounded-lg hover:text-mainFont focus:text-mainFont p-[1px] hover:bg-btn-shadow focus:bg-btn-shadow cursor-pointer mb-[2px]`
                                                }
                                            >
                                                <div
                                                    key={session.id}
                                                    onClick={() => { setSessionId(session.id); setIsSidebarVisible(false) }}
                                                    className={
                                                        `${session.id === sessionId ?
                                                            "bg-[#29292980] text-mainFont" :
                                                            "text-subButtonFont"} 
                                                        flex items-center justify-start group transition-colors duration-200 px-2 py-2 relative rounded-lg`
                                                    }
                                                >
                                                    <div className="w-[200px] flex flex-col gap-1">
                                                        {editingSessionId === session.id ? (
                                                            <input
                                                                type="text"
                                                                value={newTitle}
                                                                onChange={(e) => setNewTitle(e.target.value)}
                                                                onBlur={() => updateSessionTitle(session.id, newTitle)}
                                                                className="text-white truncate text-sm bg-transparent border-2 border-gray-500 rounded-lg p-1"
                                                            />
                                                        ) : (
                                                            <>
                                                                <div className="text-white truncate text-sm">{extractTitleFromMd(session.title) || "Untitled Chat"}</div>
                                                                <div className="text-[12px] text-[#3E3E40]">{moment(Number(session.chats[session.chats.length - 1].timestamp)).format("Do MMM YY HH:mm:ss")}</div>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pl-2 hidden group-hover:flex items-center rounded-r-lg gap-1">
                                                        {
                                                            editingSessionId !== session.id ? (
                                                                <>
                                                                    <button className="bg-transparent p-1 border-none" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setNewTitle(extractTitleFromMd(session.title));
                                                                        setEditingSessionId(session.id);
                                                                    }}>
                                                                        <FiEdit size={20} />
                                                                    </button>
                                                                    <button className="bg-transparent p-1 border-none text-[#FF5050]" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteSession(session.id);
                                                                    }}>
                                                                        <FiTrash2 size={20} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button className="bg-inputBg p-1 border-none" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateSessionTitle(session.id, newTitle);
                                                                    }}>
                                                                        <FiCheck size={20} />
                                                                    </button>
                                                                    <button className="bg-inputBg p-1 border-none" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingSessionId(null);
                                                                    }}>
                                                                        <FiX size={20} />
                                                                    </button>
                                                                </>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="w-full px-2">
                            <ShadowBtn
                                className="w-full mb-7"
                                mainClassName="py-2 px-[10px] text-white text-sm text-center"
                                onClick={() => { router.push("/chatText/setting") }}
                            >
                                Settings
                            </ShadowBtn>
                        </div>
                    </>
                )
            }
        </div>
    )
}


export default ChatHistory;
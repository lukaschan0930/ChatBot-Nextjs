import { useEffect, useState } from "react";
import { FiCheck, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import { useAtom } from "jotai";
import { ChatHistory as ChatHistoryType } from "@/app/lib/interface";
import { chatHistoryAtom, chatLogAtom, sessionIdAtom, isStartChatAtom } from "@/app/lib/store";
import CircularProgress from "@mui/material/CircularProgress";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ChatHistory = () => {
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
    const [, setIsLoading] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useAtom(chatHistoryAtom);
    const [, setChatLog] = useAtom(chatLogAtom);
    const [sessionId, setSessionId] = useAtom(sessionIdAtom);
    const [, setIsStartChat] = useAtom(isStartChatAtom);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState<string>("");
    const router = useRouter();

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
                setIsStartChat(true);
                setIsLoading(true);
                try {
                    const chats = await fetch(`/api/chat/log?sessionId=${sessionId}`);
                    const data = await chats.json();
                    if (data.success) {
                        setChatLog(data.data);
                    }
                } catch (error) {
                    console.error(error);
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


    return (
        <>
            <button
                className="w-full mt-4 text-nowrap bg-inherit focus:outline-none flex justify-center items-center gap-4 border-1 border-gray-500 rounded-lg py-3 hover:border-tertiaryBorder"
                onClick={(e) => {
                    e.preventDefault();
                    setChatLog([]);
                    setSessionId(null);
                    setIsStartChat(false);
                }}
            >
                <Image src="/image/circle_plus.svg" alt="new chat" width={21} height={21} />
                New Chat
            </button>
            <div className="text-subButtonFont mt-7 mb-2">Chat History</div>
            <div className="text-left flex flex-col flex-auto overflow-y-auto gap-1 overflow-x-hidden">
                {isLoadingHistory ? (
                    <CircularProgress />
                ) : (
                    chatHistory.sort((a, b) => Number(b.chats[b.chats.length - 1].timestamp) - Number(a.chats[a.chats.length - 1].timestamp)).map((session: ChatHistoryType) => (
                        <div
                            key={session.id}
                            onClick={() => setSessionId(session.id)}
                            className={`${session.id === sessionId ? "bg-inputBg text-mainFont" : "text-subButtonFont hover:bg-inputBg hover:border-tertiaryBorder hover:text-mainFont"} flex items-center justify-start group transition-colors duration-200 relative py-4 px-4 rounded-lg`}
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
                                        <div className="text-[10px]">{moment(Number(session.chats[session.chats.length - 1].timestamp)).format("YYYY/MM/DD HH:mm:ss")}</div>
                                    </>
                                )}
                            </div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-inputBg pl-2 hidden group-hover:flex items-center rounded-r-lg gap-1">
                                {
                                    editingSessionId !== session.id ? (
                                        <>
                                            <button className="bg-inputBg p-1 border-none" onClick={(e) => {
                                                e.stopPropagation();
                                                setNewTitle(extractTitleFromMd(session.title));
                                                setEditingSessionId(session.id);
                                            }}>
                                                <FiEdit size={20} />
                                            </button>
                                            <button className="bg-inputBg p-1 border-none" onClick={(e) => {
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
                    ))
                )}
            </div>
            <div className="border-t border-gray-500 py-5 w-full pl-4">
                <button
                    className="flex items-center justify-center gap-2 text-mainFont bg-transparent border-none focus:outline-none"
                    onClick={() => { router.push("/chatText/setting") }}
                >
                    <Image src="/image/settings.svg" alt="settings" width={20} height={20} />
                    Settings
                </button>

            </div >
        </>
    )
}

export default ChatHistory;
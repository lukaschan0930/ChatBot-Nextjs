import { atom } from "jotai";
import { ChatHistory, ChatLog } from "./interface";

const chatHistoryAtom = atom<ChatHistory[]>([]);
const chatLogAtom = atom<ChatLog[]>([]);
const sessionIdAtom = atom<string | null>(null);
const isStartChatAtom = atom<boolean>(false);
const isStreamingAtom = atom<boolean>(false);
const isSidebarVisibleAtom = atom<boolean>(true);

export { chatHistoryAtom, chatLogAtom, sessionIdAtom, isStartChatAtom, isStreamingAtom, isSidebarVisibleAtom };

import { atom } from "jotai";
import { ChatHistory, ChatLog } from "./interface";

const chatHistoryAtom = atom<ChatHistory[]>([]);
const chatLogAtom = atom<ChatLog[]>([]);
const sessionIdAtom = atom<string | null>(null);
const isStartChatAtom = atom<boolean>(false);

export { chatHistoryAtom, chatLogAtom, sessionIdAtom, isStartChatAtom };

import { atom } from "jotai";
import { ChatHistory, ChatLog, IResearchLog, ISource } from "./interface";

const chatHistoryAtom = atom<ChatHistory[]>([]);
const chatLogAtom = atom<ChatLog[]>([]);
const sessionIdAtom = atom<string | null>(null);
const isStartChatAtom = atom<boolean>(false);
const isStreamingAtom = atom<boolean>(false);
const isSidebarVisibleAtom = atom<boolean>(true);
const researchLogAtom = atom<IResearchLog[]>([]);
const researchStepAtom = atom<number>(0);
const chatTypeAtom = atom<number>(0);
const progressAtom = atom<number>(0);

export {
    chatHistoryAtom,
    chatLogAtom, 
    sessionIdAtom, 
    isStartChatAtom, 
    isStreamingAtom, 
    isSidebarVisibleAtom, 
    researchLogAtom, 
    researchStepAtom, 
    chatTypeAtom,
    progressAtom
};

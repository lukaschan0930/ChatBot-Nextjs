import { atom } from "jotai";
import { 
    ChatHistory, 
    ChatLog, 
    IResearchLog, 
    IFileWithUrl,
    IRoboChatHistory,
    IRoboChatLog,
    IRouterChatHistory,
    IRouterChatLog,
    IAI
} from "./interface";

const chatHistoryAtom = atom<ChatHistory[]>([]);
const chatLogAtom = atom<ChatLog[]>([]);
const roboChatHistoryAtom = atom<IRoboChatHistory[]>([]);
const roboChatLogAtom = atom<IRoboChatLog[]>([]);
const routerChatHistoryAtom = atom<IRouterChatHistory[]>([]);
const routerChatLogAtom = atom<IRouterChatLog[]>([]);
const sessionIdAtom = atom<string | null>(null);
const isStartChatAtom = atom<boolean>(false);
const isStreamingAtom = atom<boolean>(false);
const isSidebarVisibleAtom = atom<boolean>(true);
const researchLogAtom = atom<IResearchLog[]>([]);
const researchStepAtom = atom<number>(0);
const chatTypeAtom = atom<number>(0);
const chatModeAtom = atom<number>(0);
const roboModelAtom = atom<number>(0);
const roboQualityAtom = atom<number>(0);
const roboActiveChatAtom = atom<IRoboChatLog | undefined>(undefined);
const progressAtom = atom<number>(0);
const isResearchAreaVisibleAtom = atom<boolean>(false);
const activeChatIdAtom = atom<string>("");
const fileAtom = atom<IFileWithUrl[]>([]);
const routerModelAtom = atom<string>("");
const modelTypeAtom = atom<string>("text");
const routerModelsAtom = atom<IAI[]>([]);

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
    chatModeAtom,
    roboModelAtom,
    roboQualityAtom,
    roboActiveChatAtom,
    progressAtom,
    isResearchAreaVisibleAtom,
    activeChatIdAtom,
    fileAtom,
    roboChatHistoryAtom,
    roboChatLogAtom,
    routerModelAtom,
    routerChatHistoryAtom,
    routerChatLogAtom,
    routerModelsAtom,
    modelTypeAtom
};

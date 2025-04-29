import { Dispatch, SetStateAction } from "react";

export interface User {
    name: string;
    avatar: string;
    email?: string;
    inviteCode?: string;
    twitterId?: string;
    wallet?: string;
    chatPoints?: number;
    workerPoints?: number;
    // reward: IReward[];
    // isNodeConnected?: boolean;
    nodeConnectedTime?: Date;
    nodeRewardHash?: string;
    isNodeAdded?: boolean;
    currentplan?: ISubscriptionPlan;
    planStartDate?: Date;
    planEndDate?: Date;
    // board: {
    //     score: number;
    //     rank: number;
    // }[];
}

export interface LoginProps {
    email: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

// export interface IReward {
//     platform: string;
//     totalReward: number;
// }

export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthError";
    }
}

export interface RegisterProps {
    name: string;
    email: string;
}

export interface InviteProps {
    code: string;
}

export interface AuthContextType {
    verifyCode: string | null;
    setVerifyCode: (code: string | null) => void;
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    isNodeConnected: boolean;
    setIsNodeConnected: (isNodeConnected: boolean) => void;
    workerPoints: number;
}

interface RequestFunction {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (url: string, body?: any): Promise<any>;
}

interface UseFetchReturn {
    get: RequestFunction;
    post: RequestFunction;
    put: RequestFunction;
    delete: RequestFunction;
}

export interface AdminContextType {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    token: string | null;
    setToken: (token: string | null) => void;
    logined: boolean;
    setLogined: (logined: boolean) => void;
    useFetch: () => UseFetchReturn;
}

export interface Chat {
    prompt: string;
    response: string | null;
    sessionId: string | null;
    timestamp: string | null;
    inputToken?: number;
    outputToken?: number;
    inputTime?: number;
    outputTime?: number;
    chatType: number;
}

export interface Session {
    id: string;
    title: string;
}

export interface LoginProps {
    email: string;
    password: string;
}

export interface RegisterProps {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface IUser {
    email: string;
    password?: string;
    inviteCode: string;
    referralCode?: string;
    numsOfUsedInviteCode: number;
    loginType: string;
    twitterId?: string;
    thumbnail?: string;
    name?: string;
    avatar?: string;
    api?: string;
    verify: boolean;
    lastLogin?: Date;
    lastActiveSession?: Date;
    logins: number;
    wallet: string;
    chatPoints: number;
    workerPoints: number;
    role: string;
    isNodeAdded?: boolean;
    nodeConnectedTime?: Date;
    nodeRewardHash?: string;
    pointsUsed: number;
    pointResetDate: Date;
    currentplan?: string;
    disableModel?: string[];
    jumpReward?: {
        jumpUserId?: string;
        jumpTransactionId?: string;
        isReward: boolean
    }
}

export interface ChatHistory {
    id: string;
    title: string;
    chats: ChatLog[];
    loading?: boolean;
}

export interface ChatLog {
    prompt: string;
    response: string | null;
    timestamp: string | null;
    inputToken?: number;
    outputToken?: number;
    inputTime?: number;
    outputTime?: number;
    totalTime?: number;
    chatType: number;
    datasource: boolean;
    fileUrls: string[];
}

export interface IRoboChatHistory {
    id: string;
    title: string;
    llamaCoderVersion: string;
    shadcn: boolean;
    chats: IRoboChatLog[];
    loading?: boolean;
    createdAt?: Date;
}

export interface IRoboChatLog {
    _id?: string;
    role: string;
    content: string;
    position: number;
    model?: string;
    quality?: string;
    prompt?: string;
    createdAt?: Date;
    timestamp: number;
}

export interface IRouterChatHistory {
    id: string;
    title: string;
    chats: IRouterChatLog[];
    loading?: boolean;
    createdAt?: Date;
}

export interface IRouterChatLog {
    prompt: string;
    model: string;
    inputToken: number;
    outputToken: number;
    points: number;
    response: string | null;
    timestamp: string | null;
    outputTime: number;
    fileUrls: string[];
}

export interface IChangeLog {
    _id: string;
    title: string;
    article: string;
    category: string;
    createdAt: Date;
}

export interface ITaskList {
    _id: string;
    title: string;
    year: number;
    month: number;
    week: number;
    weight: number;
}

export interface IChatCompletionChoice {
    message?: { content?: string | null };
}

export interface IResearchLog {
    title: string;
    researchSteps: IResearchStep[];
    sources: ISource[];
    learnings: string[];
}

export interface IResearchStep {
    type: number;
    researchStep: string;
}

export interface ISource {
    url: string;
    content?: string;
    image: string;
    title: string;
}

export interface IFileWithUrl {
    file: File;
    url: string;
}

export interface ITwitterProfile {
    id: string;
    name: string;
    username: string;
    avatar: string;
    description: string;
    followersCount: number;
    followingCount: number;
    tweetsCount: number;
    createdAt: Date;
}

export interface ITweetContent {
    email: string;
    content: ITweetContentItem[];
}

export interface ITweetContentItem {
    title: string;
    url: string;
    status: number;
    score: number;
    base: number;
    performance: number;
    quality: number;
    bonus: number;
    createdAt: Date;
    postedAt: Date;
}

export interface ITopBoardUser {
    name: string;
    email: string;
    rank: number;
    score: number;
}

export interface IExplorer {
    date: number;
    userCount: number;
    promptCount: number;
    dailyPromptCount: number;
    activeUsers: string[];
}

export interface IAI {
    _id: string;
    name: string;
    inputCost: number;
    outputCost: number;
    multiplier: number;
    provider: string;
    model: string;
}

export interface ISubscriptionPlan {
    _id: string;
    name: string;
    type: string;
    price: number;
    description: string;
    features: string[];
    isYearlyPlan: boolean;
    priceId: string;
    productId: string;
    points: number;
    bonusPoints: number;
    disableModel: string[];
}
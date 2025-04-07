export interface User {
    name: string;
    avatar: string;
    email?: string;
    inviteCode?: string;
    twitterId?: string;
    wallet?: string;
    chatPoints?: number;
    workerPoints?: number;
    reward: Reward[];
    board: {
        score: number;
        rank: number;
    }[];
}

export interface LoginProps {
    email: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface Reward {
    platform: string;
    totalReward: number;
}

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
    setUser: (user: User | null) => void;
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
    setUser: (user: User | null) => void;
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
    logins: number;
    wallet: string;
    chatPoints: number;
    workerPoints: number;
    role: string;
    reward: {
        platform: string;
        totalReward: number;
    }[];
    board: {
        score: number;
        rank: number;
    }[];
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
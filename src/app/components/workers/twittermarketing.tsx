'use client';
import { useState, useEffect } from "react";
import { signIn, signOut } from "next-auth/react";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "@/app/hooks/use-toast";
import CircularProgress from "@mui/material/CircularProgress";
import { Skeleton, Divider } from "@mui/material";
import Cookies from "js-cookie";
import { FaSearch } from "react-icons/fa";
import InfoModal from "@/app/components/ui/modal";
import TwitterProfile from "./twitterProfile";
import { ITweetContentItem, ITwitterProfile, ITopBoardUser, ITaskList } from "@/app/lib/interface";
import { FaChevronLeft } from "react-icons/fa6";
import Loading from "@/app/components/Loading";
import TweetContent from "@/app/components/workers/tweetContent";
import ShadowBtn from "@/app/components/ShadowBtn";
import { TweetStatus } from "@/app/lib/stack";
// import { Sparklines, SparklinesLine } from 'react-sparklines';
import LightBox from "../LightBox";
import DotDivider from "../DotDivider";
import TopWorker from "./TopWorker";
import RemainTime from "./RemainTime";
import Pagination from "../Pagination";
import TweetTask from "./tweetTask";

const TwitterMarketingSkeleton = () => (
    <div className="mx-auto mt-[100px] flex flex-col">
        <div className="text-white text-3xl font-semibold text-center">Tweet Contents</div>
        <div className="flex justify-between gap-5">
            <div className="flex flex-col mt-10">
                <div className="flex items-center gap-16">
                    <div className="max-sm:hidden flex items-center gap-1 rounded-2xl p-2 border-2 border-[#25252799]">
                        {[0, 1, 2, 3, 4].map((index) => (
                            <Skeleton key={index} variant="text" width={60} height={32} sx={{ bgcolor: 'grey.800' }} />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton variant="text" width={160} height={40} sx={{ bgcolor: 'grey.800' }} />
                    </div>
                </div>
                <div className="mt-5 flex flex-col gap-4">
                    {[1, 2, 3].map((index) => (
                        <div key={index} className="p-4 border border-[#25252799] rounded-xl">
                            <Skeleton variant="text" width="80%" height={24} sx={{ bgcolor: 'grey.800' }} />
                            <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: 'grey.800' }} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-5 w-[325px] mt-10 max-xl:hidden">
                <div className="flex flex-col items-center px-3 py-3 border border-[#25252799] rounded-xl relative bg-[url('/image/login/texture.png')] bg-cover bg-center">
                    <div className="flex items-end gap-11 mx-auto">
                        <div className="flex flex-col gap-3">
                            <Skeleton variant="text" width={100} height={16} sx={{ bgcolor: 'grey.800' }} />
                            <div className="flex gap-[6px] items-end">
                                <Skeleton variant="text" width={80} height={40} sx={{ bgcolor: 'grey.800' }} />
                                <Skeleton variant="text" width={60} height={20} sx={{ bgcolor: 'grey.800' }} />
                            </div>
                        </div>
                        <Skeleton variant="rectangular" width={94} height={50} sx={{ bgcolor: 'grey.800' }} />
                    </div>
                    <div className="w-full h-[1px] bg-[#25252799] my-4" />
                    <div className="flex gap-1 w-full">
                        <Skeleton variant="text" width="48%" height={40} sx={{ bgcolor: 'grey.800' }} />
                        <Skeleton variant="text" width="48%" height={40} sx={{ bgcolor: 'grey.800' }} />
                    </div>
                    <div className="flex gap-1 mt-[6px] w-full">
                        <Skeleton variant="text" width="48%" height={40} sx={{ bgcolor: 'grey.800' }} />
                        <Skeleton variant="text" width="48%" height={40} sx={{ bgcolor: 'grey.800' }} />
                    </div>
                    <div className="w-full h-[1px] bg-[#25252799] my-4" />
                    <div className="mt-4 flex flex-col items-start gap-5 w-full">
                        <Skeleton variant="text" width={120} height={16} sx={{ bgcolor: 'grey.800' }} />
                        <Skeleton variant="text" width="100%" height={24} sx={{ bgcolor: 'grey.800' }} />
                    </div>
                </div>
                <div className="flex flex-col items-center px-3 py-3 border border-[#25252799] rounded-xl relative bg-[url('/image/login/texture.png')] bg-cover bg-center">
                    <Skeleton variant="text" width={120} height={24} sx={{ bgcolor: 'grey.800' }} />
                    <div className="w-full h-[1px] bg-[#25252799] my-4" />
                    <div className="flex flex-col gap-1 w-full">
                        {[1, 2, 3, 4, 5].map((index) => (
                            <Skeleton key={index} variant="text" width="100%" height={40} sx={{ bgcolor: 'grey.800' }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const TwitterMarketing = () => {
    const { user, setUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [newContent, setNewContent] = useState<string>("");
    const [twitterProfile, setTwitterProfile] = useState<ITwitterProfile | null>(null);
    const [tweetContent, setTweetContent] = useState<ITweetContentItem[] | null>(null);
    const [filteredContent, setFilteredContent] = useState<ITweetContentItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isTweetContentLoading, setIsTweetContentLoading] = useState<boolean>(false);
    const [category, setCategory] = useState<number>(0);
    const [tab, setTab] = useState<number>(0);
    const [twitterUserCount, setTwitterUserCount] = useState<number>(0);
    const [topBoardUsers, setTopBoardUsers] = useState<ITopBoardUser[]>([]);
    const [taskLists, setTaskLists] = useState<ITaskList[]>([]);
    const [limit, setLimit] = useState<number>(0);
    const [isRightSidebarVisible, setIsRightSidebarVisible] = useState<boolean>(false);

    const isValidTwitterUrl = (url: string): boolean => {
        try {
            const urlObj = new URL(url);
            // Check if domain is valid (twitter.com or x.com)
            if (!['twitter.com', 'x.com'].includes(urlObj.hostname)) {
                return false;
            }

            // Check if URL path matches pattern /username/status/tweetId
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            if (pathParts.length !== 3 || pathParts[1] !== 'status') {
                return false;
            }

            // Validate tweet ID is numeric
            const tweetId = pathParts[2];
            if (!/^\d+$/.test(tweetId)) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    };

    const connectTwitter = async () => {
        Cookies.set("currentEmail", user?.email as string);
        const result = await signIn("twitter",
            {
                redirect: false,
                callbackUrl: "/workers/marketing/twitter",
            }
        );
        if (result?.error) {
            console.error(result.error);
            toast({
                title: "Error",
                description: result.error,
            });
            signOut();
        }
    }

    const addNewContent = async () => {
        // Validate URL before making the request
        if (!newContent.trim()) {
            toast({
                title: "Error",
                description: "Please enter a Twitter URL",
            });
            return;
        }

        if (!isValidTwitterUrl(newContent)) {
            toast({
                title: "Error",
                description: "Please enter a valid Twitter post URL (twitter.com or x.com)",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/marketing/twitter`, {
                method: "POST",
                body: JSON.stringify({ url: newContent }),
            });
            const data = await response.json();

            if (data.success) {
                setNewContent("");
                setIsModalOpen(false);
                await fetchTweetContent();
                toast({
                    title: "Success",
                    description: data.message,
                });
            } else {
                toast({
                    title: "Error",
                    description: data.message,
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to add new content",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const fetchTweetContent = async () => {
        setIsTweetContentLoading(true);
        try {
            const response = await fetch(`/api/marketing/twitter`);
            const data = await response.json();
            if (data.success) {
                setTweetContent(data.tweetContent ? data.tweetContent.content : []);
                setTwitterUserCount(data.twitterUserCount);
                setTopBoardUsers(data.topBoardUsers);
                setTaskLists(data.taskLists);
            } else {
                toast({
                    title: "Error",
                    description: data.message,
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to fetch tweet content",
            });
        } finally {
            setIsTweetContentLoading(false);
        }
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredContent(tweetContent ? tweetContent : []);
            return;
        }
        const filtered = tweetContent ? tweetContent.filter(content =>
            content.title.toLowerCase().includes(query.toLowerCase()) ||
            content.url.toLowerCase().includes(query.toLowerCase())
        ) : [];
        setFilteredContent(filtered);
    };

    useEffect(() => {
        const fetchTwitterProfile = async () => {
            const response = await fetch(`/api/user/profile/twitter`);
            const data = await response.json();
            setTwitterProfile({
                id: user?.twitterId ?? "",
                name: data.data.name,
                username: data.data.screen_name,
                avatar: data.data.profile_image_url_https,
                description: data.data.description,
                followersCount: data.data.followers_count,
                followingCount: data.data.favourites_count,
                tweetsCount: data.data.statuses_count,
                createdAt: data.data.created_at,
            });
            fetchTweetContent();
        }

        if (user) {
            !tweetContent && fetchTweetContent();
            if (!user.twitterId) {
                connectTwitter();
            } else {
                setUser(user);
                !twitterProfile && fetchTwitterProfile();
            }
        }
    }, [user]);

    useEffect(() => {
        setFilteredContent(tweetContent ? tweetContent : []);
    }, [tweetContent]);

    return (
        <>
            {
                user?.twitterId ?
                    <>
                        {isTweetContentLoading || isLoading ? (
                            <TwitterMarketingSkeleton />
                        ) : (
                            <div className="mx-auto mt-[100px] flex flex-col relative max-w-[1130px] w-full">
                                <div className="text-white text-3xl font-semibold text-center">Tweet Contents</div>
                                <div className="flex items-center gap-1 mt-10">
                                    <ShadowBtn
                                        className={tab !== 0 ? "bg-transparent" : ""}
                                        mainClassName={`py-1 px-2 text-mainFont text-[12px] w-[80px] ${tab !== 0 && "bg-transparent"}`}
                                        onClick={() => setTab(0)}
                                    >
                                        Twitt
                                    </ShadowBtn>
                                    <ShadowBtn
                                        className={tab !== 1 ? "bg-transparent" : ""}
                                        mainClassName={`py-1 px-2 text-mainFont text-[12px] w-[80px] ${tab !== 1 && "bg-transparent"}`}
                                        onClick={() => setTab(1)}
                                    >
                                        Task List
                                    </ShadowBtn>
                                </div>
                                <Divider sx={{ bgcolor: "#25252799", margin: "10px 0 15px 0 " }} />
                                {
                                    tab === 0 && (
                                        <div className="flex justify-between gap-5">
                                            <div className="flex flex-col">
                                                <div className="flex max-sm:flex-col items-center gap-16 max-sm:gap-5">
                                                    <div className="flex items-center gap-1 rounded-2xl p-2 border-2 border-[#25252799]">
                                                        <ShadowBtn
                                                            className={category !== 0 ? "bg-transparent" : ""}
                                                            mainClassName={`py-1 px-2 text-mainFont max-md:text-[12px] ${category !== 0 && "bg-transparent"}`}
                                                            onClick={() => setCategory(0)}
                                                        >
                                                            All
                                                        </ShadowBtn>
                                                        {TweetStatus.map((item: { id: number, label: string }, index: number) => (
                                                            <ShadowBtn
                                                                className={category !== item.id ? "bg-transparent" : ""}
                                                                mainClassName={`py-1 px-2 text-mainFont max-md:text-[12px] ${category !== item.id && "bg-transparent"}`}
                                                                onClick={() => setCategory(item.id)}
                                                                key={index}
                                                            >
                                                                {item.label}
                                                            </ShadowBtn>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative max-w-[220px]">
                                                            <input
                                                                type="text"
                                                                placeholder="Search"
                                                                className="pr-2 pl-10 py-3 rounded-2xl max-md:text-[12px] max-md:w-full border border-[#25252799] bg-[#0E0E10] text-mainFont w-full"
                                                                value={searchQuery}
                                                                onChange={(e) => handleSearch(e.target.value)}
                                                            />
                                                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mainFont" />
                                                        </div>
                                                        <button
                                                            className={`max-w-full focus:outline-none text-sm 
                                                            py-3 px-4 rounded-xl border border-transparent bg-gradient-to-b 
                                                            from-[#FFFFFF] to-[#999999] text-[#000000] hover:border-transparent 
                                                            backdrop-blur-[9.6px] shadow-[0px_19px_21.5px_0px_#0000006B] whitespace-nowrap max-md:text-[12px]`
                                                            }
                                                            onClick={() => setIsModalOpen(true)}
                                                        >
                                                            + Add
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-5 flex flex-col gap-4">
                                                    {
                                                        (searchQuery ? filteredContent : tweetContent ?? []).filter(content => content.status === category)
                                                            .slice(limit * 5, limit * 5 + 5)
                                                            .map((content, index) =>
                                                                <TweetContent key={index} content={content} />
                                                            )
                                                    }
                                                </div>
                                                <Pagination
                                                    currentPage={limit}
                                                    totalPages={Math.ceil((searchQuery ? filteredContent : tweetContent ?? []).filter(content => content.status === category).length / 5)}
                                                    onPageChange={(page: number) => setLimit(page)}
                                                />
                                            </div>
                                            <div className={`flex flex-col gap-5 w-[325px] max-xl:mt-[72px]
                                            max-xl:border max-xl:border-[#25252799] max-xl:bg-[#0C0C0E] max-xl:rounded-2xl max-xl:p-2 max-xl:overflow-y-auto
                                            max-xl:fixed max-xl:z-20 max-xl:top-0 max-xl:right-0 max-xl:h-[calc(100vh-80px)] max-xl:transition-all max-xl:duration-500 max-xl:ease-in-out
                                            ${isRightSidebarVisible ? "max-xl:opacity-100 max-xl:translate-x-0" : "max-xl:opacity-0 max-xl:translate-x-full"}
                                            `}>
                                                <div className="flex flex-col items-center px-3 py-3 border border-[#25252799] rounded-xl relative bg-[url('/image/login/texture.png')] bg-cover bg-center">
                                                    <div className="flex items-end gap-11 mx-auto">
                                                        <div className="flex flex-col gap-3">
                                                            <div className="text-[#FFFFFF99] text-[12px]">RANK / (Total)</div>
                                                            <div className="flex gap-[6px] items-end">
                                                                <div className="text-mainFont text-[40px] font-bold">
                                                                    {
                                                                        user?.board[user?.board?.length - 1]?.rank ?? 0
                                                                    }
                                                                </div>
                                                                {
                                                                    user?.board[user?.board?.length - 1]?.rank / twitterUserCount * 100 < 10 &&
                                                                    <div className="text-sm text-[#FFFFFF99] pb-3">(Top 10%)</div>
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="w-[94px] h-[50px]">
                                                            {/* <Sparklines
                                                        data={user?.board.length > 0 ? user?.board.map(user => user.rank) : [0, 0]}
                                                        width={94}
                                                        height={50}
                                                    >
                                                        <SparklinesLine color="#FFFFFF" />
                                                    </Sparklines> */}
                                                        </div>
                                                    </div>
                                                    <DotDivider />
                                                    <div className="flex gap-1 w-full">
                                                        <LightBox title="Current Score" value={user?.board[user?.board?.length - 1]?.score ?? 0} />
                                                        <LightBox title="Daily Pool" value={parseInt(process.env.DAILY_POOL ?? "0")} />
                                                    </div>
                                                    <div className="flex gap-1 mt-[6px] w-full">
                                                        <LightBox
                                                            title="Estimated Cut"
                                                            value={(() => {
                                                                const rank = user?.board[user?.board?.length - 1]?.rank;
                                                                const totalUsers = twitterUserCount;
                                                                const percentile = (rank / totalUsers) * 100;

                                                                // Calculate number of users in each tier
                                                                const top10Users = Math.floor(totalUsers * 0.1);
                                                                const next20Users = Math.floor(totalUsers * 0.2);

                                                                if (percentile <= 10) {
                                                                    return Math.floor(7000 / top10Users);
                                                                }
                                                                if (percentile <= 30) {
                                                                    return Math.floor(2000 / next20Users);
                                                                }
                                                                // Remaining users (70%)
                                                                const bottomUsers = totalUsers - top10Users - next20Users;
                                                                return Math.floor(1000 / bottomUsers);
                                                            })()}
                                                        />
                                                        <LightBox title="Total Workers" value={twitterUserCount} />
                                                    </div>
                                                    <DotDivider />
                                                    <div className="mt-4 flex flex-col items-start gap-5">
                                                        <div className="text-white text-[14px]">Time to Payout</div>
                                                        <div className="flex items-end gap-5">
                                                            <RemainTime />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center px-3 py-3 border border-[#25252799] rounded-xl relative bg-[url('/image/login/texture.png')] bg-cover bg-center">
                                                    <div className="text-white text-lg py-[6px]">Top 5 Workers</div>
                                                    <DotDivider />
                                                    <div className="flex flex-col gap-1 w-full">
                                                        {
                                                            topBoardUsers.map((user, index) => (
                                                                <TopWorker key={index} username={user.name} rank={user.rank} score={user.score} />
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className={`
                                            xl:hidden fixed top-1/2 transform -translate-y-1/2 z-20 pl-2 py-2 border-l border-t border-b rounded-l-full border-[#25252799] bg-[#0C0C0E]
                                            ${isRightSidebarVisible ? "right-[325px]" : "right-0"}
                                            transition-all duration-500 ease-in-out
                                            `}
                                                onClick={() => setIsRightSidebarVisible(!isRightSidebarVisible)}
                                            >
                                                <FaChevronLeft className={`text-white text-[24px] transition-all duration-500 ease-in-out ${isRightSidebarVisible ? "rotate-180" : ""}`} />
                                            </div>
                                            {/* <div
                                                className={`xl:hidden fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ${isRightSidebarVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                                    } z-20`}
                                                onClick={() => setIsRightSidebarVisible(false)}
                                            /> */}
                                        </div>
                                    )
                                }
                                {
                                    tab === 1 && (
                                        <div className="flex flex-col gap-5 w-full">
                                            <div className="flex flex-col gap-5">
                                                {
                                                    taskLists.map((taskList, index) => (
                                                        <TweetTask key={index} taskList={taskList} />
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        )}
                        <InfoModal
                            icon=""
                            title=""
                            isOpen={isModalOpen}
                            setIsOpen={(isOpen: boolean) => setIsModalOpen(isOpen)}
                            height="h-fit"
                            className="bg-[#0E0E10] text-mainFont w-fit px-8 py-6 rounded-2xl border border-[#FFFFFF1A] backdrop-blur-md"
                        >
                            <div className="flex flex-col gap-6 items-center">
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold mb-2">Add New Twitter Content</h3>
                                    <p className="text-[#808080] text-sm">Paste your Twitter post URL below to add it to your marketing campaign</p>
                                </div>
                                <input
                                    type="text"
                                    placeholder="https://x.com/elonmusk/status/1734810168053956719"
                                    className="px-4 py-3 rounded-xl max-md:text-[12px] max-md:w-full border border-[#FFFFFF1A] bg-[#1A1A1C] text-mainFont w-[400px] focus:outline-none focus:border-[#FFFFFF40] transition-colors"
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                />
                                <button
                                    className="relative text-black text-sm font-semibold bg-gradient-to-b from-[#FFFFFF] to-[#999999] px-8 py-3 rounded-xl 
                            hover:from-[#FFFFFF] hover:to-[#CCCCCC] transition-all duration-300
                            shadow-[0px_8px_16px_0px_rgba(0,0,0,0.3)]
                            backdrop-blur-[9.6px]
                            border border-transparent
                            active:translate-y-[1px] active:shadow-[0px_4px_8px_0px_rgba(0,0,0,0.3)] flex gap-2 items-center"
                                    onClick={addNewContent}
                                    disabled={isLoading}
                                >
                                    {isLoading && <Loading size={20} color="#4CAF50" />}
                                    Add Content
                                </button>
                            </div>
                        </InfoModal>
                    </>
                    :
                    <div className="flex flex-col items-center justify-center h-screen">
                        <CircularProgress />
                    </div>
            }
            <TwitterProfile twitterProfile={twitterProfile} />
        </>
    )
}

export default TwitterMarketing;
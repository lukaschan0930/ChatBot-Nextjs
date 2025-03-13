"use client";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { isSidebarVisibleAtom } from "@/app/lib/store";
import { useRouter } from "next/navigation";
import ShadowBtn from "@/app/components/ShadowBtn";
import DropDownMenu from "../headers/DropDownMenu";
import Image from "next/image";
import { ProfileIcon } from "@/app/assets/profile";
import { useAuth } from "@/app/context/AuthContext";
import { ITwitterProfile } from "@/app/lib/interface";
import CalendarIcon from "@/app/assets/calendarIcon";
import { Skeleton } from "@mui/material";

const ProfileSkeleton = () => (
    <>
        <div className="flex flex-col w-full items-center justify-center mt-5 py-[52px] mx-auto bg-[url('/image/text-bg.png')]">
            <Skeleton variant="circular" width={80} height={80} sx={{ bgcolor: 'grey.800' }} />
        </div>
        <div className="mt-7 px-8">
            <Skeleton variant="text" width={200} height={32} sx={{ bgcolor: 'grey.800' }} />
            <Skeleton variant="text" width={150} height={24} sx={{ bgcolor: 'grey.800' }} />
            <div className="mt-5 flex items-center gap-4">
                <Skeleton variant="text" width={100} height={24} sx={{ bgcolor: 'grey.800' }} />
                <Skeleton variant="text" width={100} height={24} sx={{ bgcolor: 'grey.800' }} />
            </div>
            <div className="mt-3">
                <Skeleton variant="text" width={180} height={24} sx={{ bgcolor: 'grey.800' }} />
            </div>
            <div className="mt-3">
                <Skeleton variant="text" width={250} height={24} sx={{ bgcolor: 'grey.800' }} />
            </div>
        </div>
    </>
);

const TwitterProfile = ({ twitterProfile }: { twitterProfile: ITwitterProfile | null }) => {
    const [isSidebarVisible, setIsSidebarVisible] = useAtom(isSidebarVisibleAtom);
    const router = useRouter();

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ${isSidebarVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    } z-20`}
                onClick={() => setIsSidebarVisible(false)}
            />

            {/* Drawer */}
            <div className={`sm:m-1 border border-[#25252799] bg-[#0C0C0E] flex flex-col items-start h-full sm:h-[calc(100vh-8px)] sm:rounded-2xl fixed top-0 left-0 transition-all duration-500 ease-in-out transform ${isSidebarVisible
                ? "w-[340px] max-sm:w-full px-0 opacity-100 translate-x-0"
                : "w-[340px] max-sm:w-full px-0 opacity-0 -translate-x-full"
                } z-20`}>
                {
                    isSidebarVisible && (
                        <>
                            <div className={`flex items-center px-5 pt-[10px] max-sm:hidden`}>
                                <div className={`py-[1px] mr-2`}>
                                    <Image
                                        src="/image/logo-chat.png"
                                        alt="logo"
                                        width={100}
                                        height={100}
                                        className="h-5 w-auto"
                                        onClick={() => {
                                            router.push("/");
                                        }}
                                    />
                                </div>
                                <DropDownMenu />
                                <ShadowBtn
                                    className="ml-8"
                                    mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white py-2 px-4 flex items-center justify-center gap-2"
                                    onClick={() => {
                                        setIsSidebarVisible(!isSidebarVisible);
                                    }}
                                >
                                    <ProfileIcon />
                                    <span className="text-sm">Profile</span>
                                </ShadowBtn>
                            </div>
                            {
                                !twitterProfile ? (
                                    <ProfileSkeleton />
                                ) : (
                                    <>
                                        <div className="flex flex-col w-full items-center justify-center mt-5 py-[52px] mx-auto bg-[url('/image/text-bg.png')]">
                                            {
                                                twitterProfile.avatar ? (
                                                    <Image
                                                        src={twitterProfile.avatar}
                                                        alt="avatar"
                                                        className="h-[80px] w-[80px] rounded-full"
                                                        width={80}
                                                        height={80}
                                                        onError={(e) => {
                                                            e.currentTarget.srcset = "/image/default-avatar.png";
                                                        }}
                                                    />
                                                ) : (
                                                    <Image src="/image/default-avatar.png" alt="avatar" className="!h-[80px] !w-auto max-w-[80px]" width={80} height={80} />
                                                )
                                            }
                                        </div>
                                        <div className="mt-7 px-8">
                                            <div className="text-mainFont text-2xl font-bold">{twitterProfile.name}</div>
                                            <div className="text-[#FFFFFF99] text-sm font-normal">@{twitterProfile.username}</div>
                                            <div className="mt-5 flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-white text-sm font-normal">{twitterProfile.followingCount}</div>
                                                    <div className="text-[#FFFFFF99] text-sm font-normal">Following</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-white text-sm font-normal">{twitterProfile.followersCount}</div>
                                                    <div className="text-[#FFFFFF99] text-sm font-normal">Followers</div>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex gap-2 items-center">
                                                <CalendarIcon />
                                                <div className="text-[#FFFFFF99] text-sm font-normal">
                                                    Joined {
                                                        new Date(twitterProfile.createdAt)
                                                            .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                                    }
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center gap-3">
                                                <div className="text-white text-sm font-normal">Bio</div>
                                                <div className="text-[#FFFFFF99] text-sm font-normal">{twitterProfile.description}</div>
                                            </div>
                                        </div>
                                    </>
                                )
                            }
                        </>
                    )
                }
            </div>
        </>
    )
}

export default TwitterProfile;
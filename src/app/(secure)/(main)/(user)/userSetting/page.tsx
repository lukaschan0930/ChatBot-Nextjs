'use client'

import { useState, useRef, useEffect, use } from "react";
import { MdCheck, MdOutlineContentCopy } from "react-icons/md";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useRouter } from "next/navigation";
import { toast } from "@/app/hooks/use-toast";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import ShadowBtn from "@/app/components/ShadowBtn";
import Camera from "@/app/assets/camera";

const UserSetting = () => {
    const { user, setUser } = useAuth();

    const [copyStatus, setCopyStatus] = useState<boolean>(false);
    const [avatar, setAvatar] = useState<string>(user?.avatar || "");
    const [name, setName] = useState<string>(user?.name || "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

    const handleCopyClick = () => {
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image() as HTMLImageElement;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Reduced maximum dimensions
                    const MAX_SIZE = 200; // Reduced from 500 to 200
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height = Math.round((height * MAX_SIZE) / width);
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width = Math.round((width * MAX_SIZE) / height);
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // More aggressive compression
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.3); // Reduced quality to 30%

                    // Remove the data URL prefix to save some bytes
                    const base64Data = compressedBase64.split(',')[1];
                    resolve(base64Data);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Add size check
                if (file.size > 5000000) { // 5MB
                    toast({
                        variant: "destructive",
                        title: "File too large",
                        description: "Please select an image under 5MB"
                    });
                    return;
                }

                const compressedBase64 = await compressImage(file);
                setAvatar('data:image/jpeg;base64,' + compressedBase64); // Add prefix back for display
            } catch (error) {
                console.error('Error compressing image:', error);
                toast({
                    variant: "destructive",
                    title: "Error processing image",
                });
            }
        }
    };

    const handleClickUpdate = async () => {
        try {
            await fetch(`/api/user/profile`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        name,
                        avatar,
                    })
                })
            setUser({ ...user, name, avatar });
            toast({
                variant: "default",
                title: "Update Success",
            })
        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Update Failed",
            })
        }
    }

    const handleClickCancel = () => {
        router.back();
    }

    useEffect(() => {
        setAvatar(user?.avatar || '');
        setName(user?.name || '')
    }, [user])

    return (
        <div className="flex flex-col items-center min-h-screen text-[#E2E2E2] px-4 w-screen md:pt-[180px] pt-[100px]">
            <h1 className="text-2xl font-medium text-left text-[#FFFFFF] max-sm:hidden">Profile</h1>
            <div
                className="mt-7 bg-[#FFFFFF05] border border-[#25252799] rounded-3xl md:w-[640px] w-full flex flex-col"
            >
                <div className="flex flex-col w-full items-center justify-center py-[52px] mx-auto bg-[url('/image/text-bg.png')]">
                    <Image
                        src="/image/logo-chat.png"
                        alt="Edith Logo"
                        className="w-auto h-16"
                        width={240}
                        height={240}
                    />
                </div>
                <div className="border-t border-[#25252799] p-6">
                    <div className="flex flex-col -mt-[64px]">
                        <div className="relative w-fit">
                            {
                                avatar ? (
                                    <Image src={avatar} alt="avatar" className="h-[80px] w-[80px] rounded-full" width={80} height={80} />
                                ) : (
                                    <Image src="/image/default-avatar.png" alt="avatar" className="!h-[80px] !w-auto max-w-[80px]" width={80} height={80} />
                                )
                            }
                            <div className="absolute right-0 bottom-0">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <ShadowBtn
                                    className="bg-btn-new-chat mt-6 rounded-full"
                                    mainClassName="bg-gradient-to-b from-[#DFDFDF] to-[#BFBFBF] rounded-full p-[6px]"
                                    onClick={handleAvatarClick}
                                >
                                    <Camera />
                                </ShadowBtn>
                            </div>
                        </div>
                        <div className="text-[16px] text-mainFont mt-4">{name}</div>
                        <div className="mt-9 flex gap-3 max-sm:flex-col">
                            <div className="flex items-start bg-[#FFFFFF05] border border-[#FFFFFF14] text-[14px] rounded-md max-md:w-full">
                                <div className="bg-[#292929] px-4 py-2 border-r border-[#FFFFFF14] text-[#808080] w-[120px] text-center">Username</div>
                                <input
                                    className="px-3 py-2 text-white bg-[#FFFFFF05] md:max-w-[140px] max-md:w-full max-md:flex-auto "
                                    placeholder={`${user?.name}`}
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="flex items-start bg-[#FFFFFF05] border border-[#FFFFFF14] text-[14px] rounded-md max-md:w-full">
                                <div className="bg-[#292929] px-4 py-2 border-r border-[#FFFFFF14] text-[#808080] text-nowrap w-[120px] text-center">Invite Code</div>
                                <div className="relative max-md:flex-auto">
                                    <input
                                        type="text"
                                        className="px-3 py-2 text-white bg-[#FFFFFF05] md:max-w-[140px] max-md:w-full"
                                        value={user?.inviteCode}
                                        disabled
                                    />
                                    <CopyToClipboard text={user?.inviteCode || ""} onCopy={handleCopyClick}>
                                        <button
                                            className="absolute right-[1px] -translate-y-1/2 bg-transparent top-1/2 focus:outline-none px-3 border-none group"
                                            onClick={handleCopyClick}
                                        >
                                            {copyStatus ? <MdCheck className="w-5 h-auto" /> : <MdOutlineContentCopy className="w-5 h-auto transition-all duration-300 ease-out group-hover:scale-110" />}
                                        </button>
                                    </CopyToClipboard>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 border-t border-[#25252799] p-3 w-full max-sm:justify-between">
                    <button
                        onClick={handleClickCancel}
                        className="sm:w-[78px] w-full h-[39px] flex items-center justify-center bg-transparent border border-[#FAFAFA]/80 focus:outline-none text-[14px] text-[#FAFAFA]/80 hover:scale-105 hover:border-[#FAFAFA]/80 transition-transform duration-300 ease-linear"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleClickUpdate}
                        className="sm:w-[78px] w-full h-[39px] flex items-center justify-center bg-[#FAFAFA]/80 border border-transparent focus:outline-none text-[14px] text-[#000000] hover:scale-105 hover:border-transparent transition-transform duration-300 ease-linear"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UserSetting;
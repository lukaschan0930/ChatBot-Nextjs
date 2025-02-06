'use client'

import { useState, useRef } from "react";
import { MdCheck, MdOutlineContentCopy } from "react-icons/md";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useRouter } from "next/navigation";
import { toast } from "@/app/hooks/use-toast";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";

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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000] text-[#E2E2E2]">

            <div className="bg-[#FFFFFF05] border border-[#FFFFFF]/20 rounded-lg px-[72px] py-10 max-w-[900px] text-[#E2E2E2] text-base flex flex-col gap-7 items-stretch">
                <h1 className="text-2xl font-medium text-left text-[#FFFFFF] ml-1">Profile</h1>
                <div className="flex items-center justify-between">
                    {
                        avatar
                            ? <Image src={avatar} alt="Profile" className="h-[90px] w-[90px] rounded-full object-cover" width={90} height={90} />
                            : <div className="h-[90px] w-[90px] rounded-full bg-gradient-to-br from-[#7D2DFF] to-[#41DDFF] flex items-center justify-center"></div>
                    }
                    <div className="flex-1 ml-7">
                        <p className="mb-3 text-2xl font-semibold text-left">{user?.name}</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"

                        />
                        <button
                            onClick={handleAvatarClick}
                            className="bg-[#FAFAFA]/10 border border-[#FAFAFA]/15 rounded-sm w-[98px] h-[28px] flex items-center justify-center text-[#FFFFFF] focus:outline-none text-nowrap hover:scale-105 hover:border-[#FAFAFA]/15 transition-transform duration-100 ease-linear"
                        >
                            Add Avatar
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <div className="flex flex-col items-start gap-5">
                        <p className="text-[18px]">User Name</p>
                        <input
                            className="bg-[#000000] border border-[#FFFFFF]/20 rounded-lg font-semibold placeholder:text-[#E2E2E2] w-full py-3 px-[18px]"
                            placeholder={`${user?.name}`}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col items-start gap-5">
                        <p className="text-[18px]">Invite Code</p>
                        <div className="relative w-full">
                            <input
                                type="text"
                                className="bg-[#000000] border border-[#FFFFFF]/20 rounded-lg font-semibold placeholder:text-[#E2E2E2] w-full py-3 px-[18px]"
                                value={user?.inviteCode}
                                disabled
                            />
                            <CopyToClipboard text={user?.inviteCode || ""} onCopy={handleCopyClick}>
                                <button
                                    className="absolute right-[1px] h-[calc(100%-2px)] -translate-y-1/2 bg-[#000000] top-1/2 focus:outline-none px-3 border-none group"
                                    onClick={handleCopyClick}
                                >
                                    {copyStatus ? <MdCheck className="w-5 h-auto" /> : <MdOutlineContentCopy className="w-5 h-auto transition-all duration-300 ease-out group-hover:scale-110" />}
                                </button>
                            </CopyToClipboard>
                        </div>
                    </div>
                </div>
                {/* <div className="flex flex-col items-start gap-5">
          <p className="text-[18px]">Solana Wallet Address</p>
          <div className="flex justify-between w-full gap-4">
            <input className="bg-[#000000] border border-[#FFFFFF]/20 rounded-lg font-semibold placeholder:text-[#E2E2E2] w-full py-3 px-[18px]" placeholder="" type="text" />
            <button
              className="bg-[#FAFAFA]/10 border border-[#FAFAFA]/15 rounded-sm h-full focus:outline-none px-5 hover:scale-105 hover:border-[#FAFAFA]/15 transition-transform duration-100 ease-linear"
              onClick={handleCopyClick}
            >
              Confirm
            </button>
          </div>
        </div> */}
                <div className="flex justify-end gap-5 mt-7">
                    <button
                        onClick={handleClickCancel}
                        className="w-[140px] h-12 flex items-center justify-center bg-[#000000] border border-[#FAFAFA]/80 focus:outline-none text-xl font-medium text-[#FAFAFA]/80 hover:scale-105 hover:border-[#FAFAFA]/80 transition-transform duration-300 ease-linear"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleClickUpdate}
                        className="w-[140px] h-12 flex items-center justify-center bg-[#FAFAFA]/80 border border-transparent focus:outline-none text-xl font-medium text-[#000000] hover:scale-105 hover:border-transparent transition-transform duration-300 ease-linear"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UserSetting;
import React, { useCallback, useState } from "react";
import { cn } from "@/app/lib/utils";
import Image from "next/image";

interface InfoModalProps {
    children: React.ReactNode;
    icon?: string;
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    height: string;
    className: string;
}

const InfoModal = ({ children, icon, title, isOpen, setIsOpen, height, className }: InfoModalProps) => {

    const [isExiting, setIsExiting] = useState(false);
    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsExiting(false);
        }, 500);
    };

    const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose()
        }
    }, [setIsOpen]);

    if (!isOpen && !isExiting) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-30 animate-fade-out z-10"
            onClick={handleBackdropClick}
        >
            <div
                className={
                    cn(`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col ${height} rounded-2xl w-[calc(100vw-32px)] p-4 gap-6 bg-white duration-300 text-[#0D1421]
                    ${isExiting ? 'animate-zoom-out' : 'animate-zoom-in'}`, className)
                }
            >
                <div className="flex">
                    <div className="text-[17px] leading-5 w-full text-center tracking-[-0.23px] font-extrabold ">
                        {title}
                    </div>
                    <div className="absolute top-4 right-4 transform " onClick={handleClose}>
                        <Image
                            src={icon ? icon : "/image/icon/close-dark.svg"}
                            alt="Close Button"
                            className="w-[15px] h-[15px]"
                            width={15}
                            height={15}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {children}
                </div>

            </div>
        </div>
    );
};

export default InfoModal;
"use client";
import ShadowBtn from "@/app/components/ShadowBtn";
import { WorkerTypes } from "@/app/lib/stack";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const Workers = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center">
            <div className="flex flex-col">
                <div className="px-4 text-[20px] text-white font-semibold">Workers</div>
                <div className="px-4 text-box-fontSub text-[16px] mt-3">Select the type of worker you want to be.</div>
                <div className="flex flex-col gap-4 p-4 border-[#1C1C1E] bg-[#0E0E10] rounded-[20px] border mt-6">
                    <div className="flex flex-col py-4 px-3 gap-5 bg-[#0B0B0D] border border-[#25252799] rounded-[8px]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3">
                            {WorkerTypes.map((worker) => (
                                <ShadowBtn
                                    key={worker.id}
                                    className={`w-full rounded-md`}
                                    mainClassName={`text-white flex flex-col items-center justify-center py-7 px-2 md:px-16 relative ${worker.disable ? "bg-[#141415]" : ""}`}
                                    onClick={() => {
                                        router.push(`/workers/${worker.id}`);
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Image src="/image/logo-chat.png" alt="edith-logo" className="h-[22px] w-auto" width={100} height={22} />
                                        <span className="text-[16px] text-nowrap">{worker.label}</span>
                                    </div>
                                </ShadowBtn>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Workers;
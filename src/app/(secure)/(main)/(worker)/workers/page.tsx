"use client";
import DataWorker from "@/app/assets/worker/dataWorker";
import ComputeWorker from "@/app/assets/worker/computeWorker";
// import ShadowBtn from "@/app/components/ShadowBtn";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ShadowBtn from "@/app/components/ShadowBtn";
import { Divider } from "@mui/material";

const WorkerTypes = [
    {
        id: "compute",
        label: "Compute",
        disable: false,
        icon: <ComputeWorker />
    },
    {
        id: "data",
        label: "Data",
        disable: true,
        icon: <DataWorker />
    }
    // {
    //   id: "marketing",
    //   label: "Marketing",
    //   disable: true,
    // },
    // {
    //   id: "sales",
    //   label: "Sales",
    //   disable: true,
    // },
    // {
    //   id: "customer",
    //   label: "Customer",
    //   disable: true,
    // }
]

const Workers = () => {
    const router = useRouter();
    const [id, setId] = useState<string>("compute");
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center">
            <div className="flex flex-col px-4">
                <div className="text-white text-[20px] font-bold">Worker</div>
                <div className="mt-3 text-[#525252] text-[16px]">
                    Select the worker type you want to become.
                </div>
                <div className="mt-6 bg-[#0E0E10] rounded-[20px] border border-[#1C1C1E] p-4">
                    <div className="bg-[#0B0B0D] border-[#25252799] border rounded-[8px] px-3 py-[14px] flex gap-3">
                        {
                            WorkerTypes.map((workerType) => (
                                <div key={workerType.id} className="flex gap-2 w-[282px] h-[182px] flex-col justify-center items-center">
                                    <ShadowBtn
                                        className={`w-full rounded-md ${workerType.disable && 'bg-transparent'}`}
                                        mainClassName={`bg-[#29292980] text-white flex flex-col items-center justify-center py-7 px-2 md:px-16 relative`}
                                        onClick={() => router.push(`/workers/${workerType.id}`)}
                                    >
                                        <div className={`w-[46px] h-[46px] flex flex-col items-center justify-center ${workerType.disable && 'opacity-30'}`}>
                                            {workerType.icon}
                                        </div>
                                        <div className={`flex gap-3 items-center ${workerType.disable && 'opacity-30'}`}>
                                            <Image src="/image/logo-chat.png" alt="check" width={20} height={20} />
                                            <Divider orientation="vertical" flexItem sx={{ backgroundColor: "#FFFFFF47" }} />
                                            <div className="text-white text-[16px] text-nowrap">
                                                {workerType.label} Worker
                                            </div>
                                        </div>
                                    </ShadowBtn>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Workers;
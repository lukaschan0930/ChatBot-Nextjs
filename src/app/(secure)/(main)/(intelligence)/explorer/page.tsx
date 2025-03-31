import Header from "@/app/components/headers";
import { Divider } from "@mui/material";
import Image from "next/image";

interface LightBoxProps {
    title: string;
    value: number;
}

const ExplorerHeader = () => {
    return (
        <div className="flex items-center gap-1">
            <div className="bg-[#292929] text-white px-5 py-2 rounded-sm cursor-pointer">eChat</div>
            <div className="text-white px-5 py-2 rounded-sm cursor-pointer">Workers</div>
            <div className="text-white px-5 py-2 rounded-sm cursor-pointer">Studio</div>
            <div className="text-white px-5 py-2 rounded-sm cursor-pointer">RWA</div>
        </div>
    )
}

const LightBox = ({ title, value }: LightBoxProps) => {
    return (
        <div className="flex flex-col gap-2 w-full px-4 py-3 bg-[#000000] rounded-[12px] border border-secondaryBorder relative">
            <div className="text-subButtonFont text-[12px] text-nowrap">{title}</div>
            <div className="text-mainFont text-[20px] text-nowrap">
                {typeof value === 'number'
                    ? value.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    })
                    : value
                }
            </div>
            <Image src="/image/light.svg" alt="light" width={85} height={65} className="absolute top-0 left-0" />
        </div>
    )
}

const ExplorerPage = () => {
    return (
        <div className="flex flex-col w-full max-w-[1028px] min-h-screen">
            <Header />
            <div className="mt-[72px] max-w-[1028px] mx-auto w-full flex flex-col">
                <ExplorerHeader />
                <Divider sx={{ my: '10px', height: '1px', backgroundColor: '#FFFFFF33' }} />
            </div>
            <div className="mt-8 flex justify-between gap-5 mx-auto w-full">
                <LightBox title="Users Count" value={100} />
                <LightBox title="Prompt Count" value={100} />
                <LightBox title="Conversation Count" value={100} />
                <LightBox title="Point Count" value={100} />
            </div>
        </div>
    )
}

export default ExplorerPage;
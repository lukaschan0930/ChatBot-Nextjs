import Image from "next/image";

interface LightBoxProps {
    title: string;
    value: number;
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

export default LightBox;
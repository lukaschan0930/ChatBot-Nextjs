import { useState } from 'react';
import { useAtom } from 'jotai';
import { researchLogAtom, researchStepAtom, isResearchAreaVisibleAtom } from '@/app/lib/store';
import Image from 'next/image';

const researchTabs = ["Activities", "Resources"];

const ResearchArea = () => {
    const [tabValue, setTabValue] = useState(0);
    const [researchLog,] = useAtom(researchLogAtom);
    const [researchStep,] = useAtom(researchStepAtom);
    const [isResearchAreaVisible,] = useAtom(isResearchAreaVisibleAtom);

    return (
        <div className={`${isResearchAreaVisible && 'xl:block'} hidden pr-[19px] pt-[108px] h-screen pb-4`}>
            <div className='xl:w-[370px] rounded-md border border-secondaryBorder bg-inputBg h-full pb-7 overflow-y-auto'>
                <div className='flex flex-col items-center py-3 border-b border-secondaryBorder'>
                    <div className='flex items-center p-2 border border-[#25252799] bg-[#0B0B0D] rounded-full'>
                        {
                            researchTabs.map((tab, index) => (
                                tabValue === index ?
                                    <div
                                        className={`flex 
                                        items-start justify-between h-full 
                                        gap-4 p-[2px] w-fit bg-inputBg group text-mainFont
                                        bg-btn-shadow rounded-full border-0 focus:outline-none text-sm cursor-pointer
                                        `}
                                        key={index}
                                        onClick={() => setTabValue(index)}
                                    >
                                        <span className="flex-1 bg-[#181818] border-0 px-3 py-2 rounded-full">{tab}</span>
                                    </div> :
                                    <div
                                        key={index}
                                        className={`px-4 py-1 border rounded-full cursor-pointer ${tabValue === index ? "bg-[#292929] border-[#2C2B30]" : "border-transparent"}`}
                                        onClick={() => setTabValue(index)}
                                    >
                                        <div className='text-mainFont text-sm'>
                                            {tab}
                                            (
                                                {researchLog.reduce((acc, step) => (
                                                    acc + step.sources.length
                                                ), 0)}
                                            )
                                        </div>
                                    </div>
                            ))
                        }
                    </div>
                </div>
                <div
                    role="tabpanel"
                    hidden={tabValue !== 0}
                    id={`tabpanel-activity`}
                    aria-labelledby={`tab-activity`}
                    className='py-3 px-6'
                >
                    <div className="flex flex-col">
                        {researchLog.map((step, index) => (
                            <div key={index} className="flex relative min-h-[80px] items-start py-2">
                                <div
                                    className={`absolute flex items-center justify-center w-[10px] h-[10px] rounded-full text-white text-sm mt-2
              ${index < researchStep ? 'bg-white' : index === researchStep ? 'bg-white shadow-lg animate-sparkle' : 'bg-subButtonFont'}`}
                                    style={index === researchStep ? { animation: 'sparkle 1s infinite' } : {}}
                                >
                                </div>
                                {
                                    index < researchLog.length - 1 &&
                                    <div className={`absolute h-[calc(100%-7px)] w-[2px] mt-[15px] left-[4px] ${index < researchStep ? 'bg-white' : 'bg-subButtonFont'}`} />
                                }
                                <div className="flex flex-col ml-6">
                                    <div>{step.title}</div>
                                    {
                                        index === researchStep ?
                                            <div className="ml-1 flex items-center mt-1">
                                                <Image
                                                    src="/image/chat_logo.svg"
                                                    alt="chat loading"
                                                    className={`w-8 h-auto ${step.researchSteps[step.researchSteps.length - 1].type === 1 ? 'rotate' : ''}`}
                                                    width={100}
                                                    height={100}
                                                />
                                                <span className="ml-2">{step.researchSteps[step.researchSteps.length - 1].researchStep}</span>
                                            </div>
                                            :
                                            index < researchStep &&
                                            <div className="ml-1 flex items-center mt-1">
                                                <Image
                                                    src="/image/chat_logo.svg"
                                                    alt="chat loading"
                                                    className="w-8 h-auto"
                                                    width={100}
                                                    height={100}
                                                />
                                                <span className="ml-2">Completed</span>
                                            </div>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div
                    role="tabpanel"
                    hidden={tabValue !== 1}
                    id={`tabpanel-sources`}
                    aria-labelledby={`tab-sources`}
                    className='py-3 px-6'
                >
                    <div className="flex flex-col gap-3">
                        {researchLog.map((step, index) => (
                            step.sources.map((source, index) => (
                                <div
                                    key={index} className='rounded-md bg-[#FFFFFF08] py-4 px-6 flex flex-col cursor-pointer'
                                    onClick={() => window.open(source.url, '_blank')}
                                >
                                    <div className='text-mainFont text-sm'>{source.title}</div>
                                    <div className='flex flex-col gap-4 text-subButtonFont text-sm ml-3'>
                                        <div>{`${source.url && `${source.url.substring(0, 20)}...`}`}</div>
                                    </div>
                                </div>
                            ))
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResearchArea;
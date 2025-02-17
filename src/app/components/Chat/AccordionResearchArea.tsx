import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { researchLogAtom, researchStepAtom } from '@/app/lib/store';
import Image from 'next/image';
import { FaChevronDown } from 'react-icons/fa';

const researchTabs = ["Activities", "Resources"];

const AccordionResearchArea = () => {
    const [tabValue, setTabValue] = useState(0);
    const [researchLog,] = useAtom(researchLogAtom);
    const [researchStep,] = useAtom(researchStepAtom);
    const [isOpen, setIsOpen] = useState(true);
    const currentStepRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (researchStep === researchLog.length - 1) {
            setIsOpen(false);
        } else {
            setIsOpen(true);
        }
    }, [researchStep, researchLog]);

    useEffect(() => {
        if (currentStepRef.current) {
            currentStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [researchStep]);

    return (
        <div className={`px-[19px] py-4 md:w-[calc(100%-32px)] w-full border-secondaryBorder bg-inputBg rounded-lg md:ml-8 mb-4 xl:hidden border`}>
            <div className='w-full flex justify-between items-center' onClick={() => setIsOpen(!isOpen)}>
                <div className='flex items-center gap-2'>
                    <div className='text-mainFont text-sm'>Pro Search</div>
                </div>
                <FaChevronDown
                    className={`!w-5 !h-5 ${isOpen ? "rotate-180" : ""
                        } transition-all duration-150`}
                />
            </div>
            <div className={`h-full overflow-y-auto transition-all duration-300 ${isOpen ? 'max-h-[calc(100vh-450px)] mt-4' : 'max-h-0 overflow-hidden'}`}>
                <div className='flex items-center'>
                    {
                        researchTabs.map((tab, index) => (
                            <div
                                key={index}
                                className={`px-4 py-1 border-b-2 cursor-pointer ${tabValue === index ? "border-mainFont" : "border-transparent"}`}
                                onClick={() => setTabValue(index)}
                            >
                                <div className={`${tabValue === index ? 'text-mainFont' : 'text-subButtonFont'}`}>{tab}</div>
                            </div>
                        ))
                    }
                </div>
                <div
                    role="tabpanel"
                    hidden={tabValue !== 0}
                    id={`tabpanel-activity`}
                    aria-labelledby={`tab-activity`}
                    className='py-3'
                >
                    <div className="flex flex-col">
                        {researchLog.map((step, index) => (
                            <div key={index} className="flex relative min-h-[80px] items-start py-2">
                                <div
                                    ref={index === researchStep ? currentStepRef : null}
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
                    hidden={tabValue !== 1}
                    id={`tabpanel-sources`}
                    aria-labelledby={`tab-sources`}
                    className='py-3'
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

export default AccordionResearchArea;
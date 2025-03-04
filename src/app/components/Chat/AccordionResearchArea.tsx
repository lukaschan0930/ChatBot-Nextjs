import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { researchLogAtom, researchStepAtom } from '@/app/lib/store';
import Image from 'next/image';
import { FaChevronDown } from 'react-icons/fa';
import CheckboxIcon from '@/app/assets/checkbox';

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
        <div className={`md:w-[calc(100%-32px)] w-full border-secondaryBorder bg-inputBg rounded-lg mb-4 xl:hidden border`}>
            <div className='w-full flex justify-between items-center px-3 py-2 bg-[#181818]' onClick={() => setIsOpen(!isOpen)}>
                <div className='flex items-center gap-2'>
                    <div className='text-mainFont text-sm'>
                        {
                            researchStep === researchLog.length ?
                                'Completed' :
                                'Pro Search'
                        }
                    </div>
                </div>
                <div className='flex items-center gap-2'>
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
                                        <span className="flex-1 bg-[#181818] border-0 px-3 py-2 rounded-full">
                                            {tab}
                                            {index === 1 && `(${researchLog.reduce((acc, step) => (
                                                acc + step.sources.length
                                            ), 0)})`}
                                        </span>
                                    </div> :
                                    <div
                                        key={index}
                                        className={`px-4 py-1 border rounded-full cursor-pointer ${tabValue === index ? "bg-[#292929] border-[#2C2B30]" : "border-transparent"}`}
                                        onClick={() => setTabValue(index)}
                                    >
                                        <div className='text-mainFont text-sm'>
                                            {tab}
                                            {index === 1 && `(${researchLog.reduce((acc, step) => (
                                                acc + step.sources.length
                                            ), 0)})`}
                                        </div>
                                    </div>
                            ))
                        }
                    </div>
                    <FaChevronDown
                        className={`!w-5 !h-5 ${isOpen ? "rotate-180" : ""
                            } transition-all duration-150`}
                    />
                </div>
            </div>
            <div className={`h-full overflow-y-auto transition-all duration-300 ${isOpen ? 'max-h-[calc(100vh-450px)]' : 'max-h-0 overflow-hidden'}`}>
                <div
                    role="tabpanel"
                    hidden={tabValue !== 0}
                    id={`tabpanel-activity`}
                    aria-labelledby={`tab-activity`}
                    className='py-3 px-3'
                >
                    <div className="flex flex-col">
                        {researchLog.map((step, index) => (
                            <div key={index} className="flex relative min-h-[80px] items-start py-2">
                                <div
                                    className={`absolute flex items-center justify-center -left-[6px] w-6 h-6 rounded-full text-white text-sm mt-1 border-2 bg-transparent
                                    ${index === researchStep ?
                                            'border-[#FFFFFF]' :
                                            'border-transparent'
                                        }`
                                    }
                                // style={index === researchStep ? { animation: 'sparkle 1s infinite' } : {}}
                                >
                                    <div
                                        className={`flex items-center justify-center w-5 h-5 rounded-full
                                            ${index < researchStep ?
                                                'bg-gradient-to-b from-[#DFDFDF] to-[#BFBFBF]' :
                                                index === researchStep ?
                                                    'bg-[#292929] shadow-lg' :
                                                    'bg-[#292929]'
                                            }
                                            `}
                                    >
                                        {
                                            index < researchStep ?
                                                <CheckboxIcon /> :
                                                index === researchStep &&
                                                <Image
                                                    src="/image/chat_logo.svg"
                                                    alt="chat loading"
                                                    className="w-3 h-auto"
                                                    width={12}
                                                    height={12}
                                                />
                                        }
                                    </div>
                                </div>
                                {
                                    index < researchLog.length - 1 &&
                                    <div className={`absolute h-[calc(100%-32px)] w-[2px] mt-8 left-[4px] ${index < researchStep ? 'bg-[#CDCDCD]' : 'bg-[#292929]'}`} />
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
                    className='py-3 px-3'
                >
                    <div className="flex flex-col gap-3">
                        {researchLog.map((step, index) => (
                            step.sources.map((source, index) => (
                                source.title &&
                                <div
                                    key={index} className='rounded-md bg-transparent border border-[#25252799] flex flex-col cursor-pointer'
                                    onClick={() => window.open(source.url, '_blank')}
                                >
                                    <div className='text-mainFont text-sm p-3'>{source.title}</div>
                                    <div className='flex flex-col gap-4 text-subButtonFont text-sm border-t border-[#25252799] p-3'>
                                        <div className="flex items-center gap-2">
                                            {source.url && (() => {
                                                try {
                                                    const url = new URL(source.url);
                                                    const domain = url.host.replace(/^www\./, '');
                                                    return (
                                                        <>
                                                            <img
                                                                src={`https://www.google.com/s2/favicons?domain=${domain}`}
                                                                alt=""
                                                                className="w-4 h-4 min-w-[16px]"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                            <span>{domain}</span>
                                                        </>
                                                    );
                                                } catch {
                                                    return source.url.substring(0, 20) + '...';
                                                }
                                            })()}
                                        </div>
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
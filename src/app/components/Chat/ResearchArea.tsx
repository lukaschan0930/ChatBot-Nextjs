import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Check from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VideoLabelIcon from '@mui/icons-material/VideoLabel';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useState } from 'react';
import { useAtom } from 'jotai';
import { researchLogAtom, researchStepAtom, chatTypeAtom } from '@/app/lib/store';
import StepContent from '@mui/material/StepContent';
import Image from 'next/image';

const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        left: 'calc(50% - 8px)', // Center the connector line
        top: 0,
        bottom: 0,
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: '#784af4',
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: '#784af4',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: '#eaeaf0',
        borderLeftWidth: 3,
        borderRadius: 1,
        minHeight: 24,
        ...theme.applyStyles('dark', {
            borderColor: theme.palette.grey[800],
        }),
    },
}));

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(
    ({ theme }) => ({
        color: '#eaeaf0',
        display: 'flex',
        height: 22,
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: '8px',
        '& .QontoStepIcon-completedIcon': {
            color: '#784af4',
            zIndex: 1,
            fontSize: 18,
        },
        '& .QontoStepIcon-circle': {
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
        },
        ...theme.applyStyles('dark', {
            color: theme.palette.grey[700],
        }),
        variants: [
            {
                props: ({ ownerState }) => ownerState.active,
                style: {
                    color: '#784af4',
                },
            },
        ],
    }),
);

function QontoStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;

    return (
        <QontoStepIconRoot ownerState={{ active }} className={className}>
            {completed ? (
                <Check className="QontoStepIcon-completedIcon" />
            ) : (
                <div className="QontoStepIcon-circle" />
            )}
        </QontoStepIconRoot>
    );
}

const researchTabs = ['Activities', 'Resources'];

const CustomStepContent = styled(StepContent)({
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
    borderLeftColor: '#eaeaf0', // You can customize the color as needed
});

const ResearchArea = () => {
    const [tabValue, setTabValue] = useState(0);
    const [researchLog,] = useAtom(researchLogAtom);
    const [researchStep,] = useAtom(researchStepAtom);
    const [chatType,] = useAtom(chatTypeAtom);

    return (
        <div className={`${chatType === 0 ? 'hidden' : 'hidden xl:block'} pr-[19px] pt-[108px] h-screen pb-4`}>
            <div className='xl:w-[370px] rounded-md border border-primaryBorder h-full py-7 px-6 overflow-y-auto'>
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

export default ResearchArea;
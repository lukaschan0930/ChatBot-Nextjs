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
import { researchLogAtom, researchStepAtom } from '@/app/lib/store';
import StepContent from '@mui/material/StepContent';

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

const steps = ['Select campaign settings', 'Create an ad group', 'Create an ad'];

const CustomStepContent = styled(StepContent)({
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
    borderLeftColor: '#eaeaf0', // You can customize the color as needed
});

const ResearchArea = () => {
    const [tabValue, setTabValue] = useState(0);
    const [researchLog,] = useAtom(researchLogAtom);
    const [researchStep,] = useAtom(researchStepAtom);

    return (
        <div className="absolute right-[50px] w-[300px] h-[600px] bg-white rounded-md px-4 overflow-y-auto">
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} aria-label="deep-research-tabs" className="w-full">
                <Tab label="Activity" className="w-1/2" />
                <Tab label="Sources" className="w-1/2" />
            </Tabs>
            <div
                role="tabpanel"
                hidden={tabValue !== 0}
                id={`tabpanel-activity`}
                aria-labelledby={`tab-activity`}
                className='py-3'
            >
                <Stepper activeStep={researchStep} connector={<QontoConnector />} orientation="vertical">
                    {researchLog.map((step, index) => (
                        <Step key={index}>
                            <StepLabel StepIconComponent={QontoStepIcon}>{step.title}</StepLabel>
                            <CustomStepContent>
                                {
                                    step.researchSteps.map((researchStep, index) => (
                                        <div key={index}>{researchStep}</div>
                                    ))
                                }
                            </CustomStepContent>
                        </Step>
                    ))}
                </Stepper>
            </div>
            <div
                role="tabpanel"
                hidden={tabValue !== 1}
                id={`tabpanel-sources`}
                aria-labelledby={`tab-sources`}
            >
                <div className="p-3">
                    <h2>Sources</h2>
                    <div className="p-3">
                        {researchLog.map((step, index) => (
                            <div key={index}>
                                <div>{
                                    step.sources.map((source, index) => (
                                        source.image ? <div key={index}>
                                            <img src={source.image} alt={source.url} width={100} height={100} />
                                        </div> : <div key={index}>
                                            <h3>{source.url}</h3>
                                        </div>
                                    ))
                                }</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResearchArea;
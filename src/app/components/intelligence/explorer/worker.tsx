import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import InfoIcon from '@/app/assets/info';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';
import Edith from '@/app/assets/providers/edith';
import Akash from '@/app/assets/providers/akash';
import GoogleCloud from '@/app/assets/providers/googleCloud';
import Ionet from '@/app/assets/providers/ionet';
import { useAuth } from '@/app/context/AuthContext';
import ShadowBtn from '../../ShadowBtn';
import { Divider } from '@mui/material';
import { Sparklines, SparklinesLine } from 'react-sparklines';

const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
    '&:active': {
        '& .MuiSwitch-thumb': {
            width: 15,
        },
        '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(9px)',
        },
    },
    '& .MuiSwitch-switchBase': {
        padding: 2,
        '&.Mui-checked': {
            transform: 'translateX(12px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: '#1890ff',
                ...theme.applyStyles('dark', {
                    backgroundColor: '#177ddc',
                }),
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
        width: 12,
        height: 12,
        borderRadius: 6,
        transition: theme.transitions.create(['width'], {
            duration: 200,
        }),
    },
    '& .MuiSwitch-track': {
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor: 'rgba(0,0,0,.25)',
        boxSizing: 'border-box',
        ...theme.applyStyles('dark', {
            backgroundColor: 'rgba(255,255,255,.35)',
        }),
    },
}));

interface ProviderCardProps {
    name: string;
    gpuCount: number;
    cpuCount: number;
    logo?: React.ReactNode;
}

interface StatCardProps {
    label: string;
    value: number;
}

const ProviderCard: FC<ProviderCardProps> = ({ name, gpuCount, cpuCount, logo }) => (
    <div className={`flex flex-col gap-4 w-full p-6 bg-[#000000] rounded-[12px] border border-secondaryBorder ${name !== 'EDITH' ? 'blur-sm' : ''}`}>
        <div className="flex items-center gap-3">
            {logo && (
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                    {logo}
                </div>
            )}
            <span className="text-white text-lg">{name}</span>
        </div>
        <div className="flex gap-8">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Image src="/image/icon/gpu.svg" alt="GPU" width={16} height={16} />
                    <span className="text-gray-400 text-sm">GPUs</span>
                </div>
                <span className="text-white text-2xl font-medium">{gpuCount}</span>
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Image src="/image/icon/cpu.svg" alt="CPU" width={16} height={16} />
                    <span className="text-gray-400 text-sm">CPUs</span>
                </div>
                <span className="text-white text-2xl font-medium">{cpuCount}</span>
            </div>
        </div>
    </div>
);

const StatCard: FC<StatCardProps> = ({ label, value }) => {
    let sparklineData: number[] = [];
    if (label === "Total Nodes") {
        sparklineData = [
            Number(value) * 0.1,          // 10% of total
            Number(value) * 0.2,          // 20% of total
            Number(value) * 0.3,          // 30% of total
            Number(value) * 0.4,          // 40% of total
            Number(value) * 0.6,          // 60% of total
            Number(value) * 0.75,         // 75% of total
            Number(value) * 0.9,          // 90% of total
            Number(value)                 // 100% of total (full value)
        ];
    } else if (label === "Live Nodes") {
        sparklineData = [
            Number(value) * 0.7,          // 10% of total
            Number(value) * 0.5,          // 20% of total
            Number(value) * 0.4,          // 30% of total
            Number(value) * 0.3,          // 40% of total
            Number(value) * 0.5,          // 60% of total
            Number(value) * 0.75,         // 75% of total
            Number(value) * 0.9,          // 90% of total
            Number(value)                 // 100% of total (full value)
        ];
    }

    return (
        <div className="flex flex-col gap-2 px-4 pt-5 h-[157px] w-[calc(50%-10px)] rounded-[12px] border border-secondaryBorder relative">
            <div className="text-subButtonFont text-[12px] text-nowrap flex items-center gap-2">
                {label}
                {
                    label === "Live Nodes" &&
                    <span className="relative flex w-[10px] h-[10px]">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFFFFF] opacity-75"></span>
                        <span className="relative inline-flex w-[10px] h-[10px] rounded-full bg-mainFont"></span>
                    </span>
                }
            </div>
            <div className="text-mainFont text-[32px] text-nowrap">{value.toLocaleString()}</div>
            <div className="absolute bottom-[18px] right-[8px] sm:right-[18px] w-[100px] h-[43px]">
                <Sparklines
                    data={sparklineData}
                    width={100}
                    height={43}
                >
                    <SparklinesLine style={{ stroke: '#FFFFFF', strokeWidth: 1 }} />
                </Sparklines>
            </div>
        </div>
    );
};

const styles = `
    @keyframes sparkle {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
    .animate-sparkle {
        animation: sparkle 2s ease-in-out infinite;
    }
`;

const ExplorerWorker: FC = () => {
    const { user, setUser } = useAuth();
    const TOTAL_NODES = 13739;
    const [stats, setStats] = useState({
        pps: 0,
        liveNodes: 0,
        totalNodes: TOTAL_NODES
    });
    const [isConnected, setIsConnected] = useState(true);
    const [lastPointGain, setLastPointGain] = useState(0);

    // Add the providers data
    const providers = [
        {
            name: 'EDITH',
            gpuCount: 294,
            cpuCount: 0,
            logo: <Edith />
        },
        {
            name: 'Akash',
            gpuCount: 238,
            cpuCount: 30,
            logo: <Akash />
        },
        {
            name: 'Google Cloud',
            gpuCount: 152,
            cpuCount: 0,
            logo: <GoogleCloud />
        },
        {
            name: 'Ionet',
            gpuCount: 112,
            cpuCount: 0,
            logo: <Ionet />
        }
    ];

    // Separate useEffect for real-time PPS updates
    useEffect(() => {
        let ppsIntervalId: NodeJS.Timeout;

        const updatePPS = () => {
            // Random PPS between 0.5 to 370
            const newPPS = Math.round(Math.random() * (370 - 0.5) + 0.5);

            setStats(prevStats => ({
                ...prevStats,
                pps: newPPS
            }));
        };

        // Update PPS every second
        ppsIntervalId = setInterval(updatePPS, 1000);
        updatePPS(); // Initial update

        return () => {
            if (ppsIntervalId) {
                clearInterval(ppsIntervalId);
            }
        };
    }, []);

    // Original useEffect for other updates (points, live nodes)
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const getRandomNumber = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const updateStats = () => {
            // Random point gain between 0.05 to 0.67
            const pointGain = getRandomNumber(0.05, 0.67);

            // Random live nodes between 13% to 34% of total nodes
            const liveNodesPercentage = getRandomNumber(0.13, 0.34);
            const liveNodesCount = Math.round(TOTAL_NODES * liveNodesPercentage);

            setStats(prevStats => ({
                ...prevStats,
                liveNodes: liveNodesCount
            }));

            fetch('/api/user/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    name: user?.name,
                    avatar: user?.avatar,
                    wallet: user?.wallet,
                    workerPoints: Math.round((Number((user?.workerPoints ?? 0) + Number(pointGain.toFixed(2)))))
                })
            });

            if (user && isConnected) {
                console.log('user', user.workerPoints);
                setUser({
                    ...user,
                    workerPoints: Math.round((Number((user?.workerPoints ?? 0) + Number(pointGain.toFixed(2)))))
                });
            }

            setLastPointGain(pointGain);

            // Schedule next update with random time between 5 to 30 minutes
            const nextUpdate = Math.round(getRandomNumber(5 * 60000, 30 * 60000));
            timeoutId = setTimeout(updateStats, nextUpdate);
        };

        updateStats();

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    const liveNodeConnect = (isConnected: boolean) => {
        if (isConnected) {
            setIsConnected(true);
            setStats(prevStats => ({
                ...prevStats,
                liveNodes: prevStats.liveNodes + 1
            }));
        } else {
            setIsConnected(false);
            setStats(prevStats => ({
                ...prevStats,
                liveNodes: prevStats.liveNodes - 1
            }));
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <h2 className="text-white text-2xl font-bold text-center">Welcome to the EDITH Supercomputer</h2>
            <div className="text-white flex flex-col md:flex-row gap-5 w-full justify-between md:items-end">
                <div className='flex flex-col gap-2 items-center border border-[#25252799] rounded-[12px] bg-[#0E0E10] w-full md:w-[calc(50%-10px)] pt-9 pb-8 relative'>
                    <Image src="/image/login/pixels.png" alt="logo" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[401px] h-auto" width={401} height={401} />
                    <Image src='/image/logo-chat.png' alt='edith-logo' width={60} height={60} />
                    <ShadowBtn
                        className="rounded-full w-[164px] mt-5"
                        mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white py-2 px-2 gap-0 rounded-full text-sm flex items-center justify-center gap-[6px]"
                    >
                        <span className='text-sm w-full transition-all duration-300'>{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                        <AntSwitch
                            inputProps={{ 'aria-label': 'Node Connection Status' }}
                            onChange={(e) => liveNodeConnect(e.target.checked)}
                            checked={isConnected}
                        />
                    </ShadowBtn>
                    <div className="flex items-center gap-6 mt-7">
                        {/* PPS Display */}
                        <div className="flex flex-col items-center w-1/3 md:w-28">
                            <span className="text-gray-400 text-[14px]">PPS</span>
                            <span className="text-[36px] font-bold">{stats.pps}</span>
                        </div>

                        <Divider orientation="vertical" flexItem sx={{ backgroundColor: '#FFFFFF1F' }} />

                        {/* Points Display */}
                        <div className="flex flex-col items-center w-1/3 md:w-28">
                            <div className="text-gray-400 text-[14px] flex items-center gap-1">
                                Points
                            </div>
                            <span className="text-[36px] font-bold">{user?.workerPoints ?? 0}</span>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col border border-[#25252799] rounded-[12px] bg-[#0E0E10] w-full md:w-[calc(50%-10px)] px-5 py-[21.5px] h-full gap-6'>
                    <div className='w-full bg-[#0B0B0D] border border-[#252527] rounded-full p-[6px] flex items-center justify-between'>
                        <ShadowBtn className='w-full rounded-full' mainClassName='rounded-full max-sm:text-[12px]'>
                            Browser Node
                        </ShadowBtn>
                        <div className='w-full text-center max-sm:text-[12px] text-mainFont opacity-50'>
                            Docker Node
                        </div>
                    </div>
                    <Divider sx={{ backgroundColor: '#FFFFFF1F' }} />
                    <div className='flex items-center justify-between gap-5 w-full'>
                        <StatCard label="Total Nodes" value={stats.totalNodes} />
                        <StatCard label="Live Nodes" value={stats.liveNodes} />
                    </div>
                </div>
            </div>

            {/* Provider Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {providers.map((provider) => (
                    <ProviderCard
                        key={provider.name}
                        name={provider.name}
                        gpuCount={provider.gpuCount}
                        cpuCount={provider.cpuCount}
                        logo={provider.logo}
                    />
                ))}
            </div>
            {/* <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <Image src='/image/blur/edith-blur.png' className='w-full' alt='edith' width={256} height={142} />
                <Image src='/image/blur/akash-blur.png' className='w-full' alt='akash' width={256} height={142} />
                <Image src='/image/blur/google-blur.png' className='w-full' alt='google-cloud' width={256} height={142} />
                <Image src='/image/blur/io-blur.png' className='w-full' alt='ionet' width={256} height={142} />
            </div> */}
        </div>
    );
};

export default ExplorerWorker;
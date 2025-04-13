'use client';

import Image from 'next/image';
import { FC, useEffect, useState, useRef } from 'react';
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
import { getRandomNumber } from '@/app/lib/stack';

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
    <div className={`flex flex-col gap-4 w-full p-6 bg-[#0E0E10] rounded-[12px] border border-[#252527] ${name !== 'EDITH' ? 'blur-sm' : ''}`}>
        <div className="flex items-center gap-3">
            {logo && (
                <div className="rounded-full h-7 bg-transparent flex items-center justify-center">
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
            Number(value) * 0.1,          // 10% of total
            Number(value) * 0.3,          // 20% of total
            Number(value) * 0.6,          // 30% of total
            Number(value) * 0.3,          // 40% of total
            Number(value) * 0.5,          // 60% of total
            Number(value) * 0.65,         // 75% of total
            Number(value) * 0.87,
            Number(value) * 0.76,          // 90% of total
            Number(value)                 // 100% of total (full value)
        ];
    }

    return (
        <div className="flex flex-col gap-2 px-4 pt-5 h-[157px] w-full md:w-[calc(50%-10px)] rounded-[12px] border border-secondaryBorder relative min-w-fit">
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
            <div className={`text-mainFont text-[32px] text-nowrap ${value === 0 && 'animate-pulse bg-gray-200 w-[100px] h-[43px]'}`}>{value > 0 && value.toLocaleString()}</div>
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
    const { user, setUser, isNodeConnected, setIsNodeConnected } = useAuth();
    const [totalNodes, setTotalNodes] = useState(0);
    const [isConnecting, setIsConnecting] = useState(false);
    const [stats, setStats] = useState({
        pps: 0,
        liveNodes: 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    // Add the providers data
    const providers = [
        {
            name: 'EDITH',
            gpuCount: 294,
            cpuCount: 32,
            logo: <Edith />
        },
        {
            name: '',
            gpuCount: 238,
            cpuCount: 30,
            logo: <Akash />
        },
        {
            name: '',
            gpuCount: 152,
            cpuCount: 0,
            logo: <GoogleCloud />
        },
        {
            name: '',
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

    useEffect(() => {
        const fetchTotalNodes = async () => {
            const response = await fetch('/api/admin/eChat');
            const data = await response.json();
            setTotalNodes(data.data.totalNode);
            const liveNodesPercentage = getRandomNumber(0.13, 0.34);
            const liveNodesCount = Math.round(data.data.totalNode * liveNodesPercentage);
            setStats(prevStats => ({
                ...prevStats,
                liveNodes: liveNodesCount
            }));
        };
        fetchTotalNodes();
    }, []);

    const liveNodeConnect = async (isConnected: boolean) => {
        if (isConnecting) return;
        setIsConnecting(true);
        try {
            setIsNodeConnected(isConnected);
            setStats(prevStats => ({
                ...prevStats,
                liveNodes: isConnected ? prevStats.liveNodes + 1 : prevStats.liveNodes - 1
            }));
        } catch (error) {
            console.error('Error updating node connection status:', error);
        } finally {
            setIsConnecting(false);
        }
    }

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const updateStats = async () => {
            const liveNodesPercentage = getRandomNumber(0.13, 0.34);
            const liveNodesCount = Math.round(totalNodes * liveNodesPercentage);

            if (totalNodes > 0) {
                setStats(prevStats => ({
                    ...prevStats,
                    liveNodes: liveNodesCount
                }));
            }

            // Schedule next update with random time between 5 to 30 minutes
            const nextUpdate = Math.round(getRandomNumber(5 * 60 * 1000, 30 * 60 * 1000));
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

    const addTotalNodes = async () => {
        if (!user || isLoading || user?.isNodeAdded || totalNodes == 0) return;
        setIsLoading(true);
        try {
            await fetch('/api/admin/eChat', {
                method: 'PUT',
                body: JSON.stringify({
                    totalNode: totalNodes + 1
                })
            });
            await fetch('/api/user/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    name: user?.name,
                    avatar: user?.avatar,
                    wallet: user?.wallet,
                    isNodeAdded: true
                })
            });
            setTotalNodes(prevTotalNodes => prevTotalNodes + 1);
            setUser(prevUser => {
                if (prevUser) {
                    return {
                        ...prevUser,
                        isNodeAdded: true
                    };
                }
                return prevUser;
            });
        } catch (error) {
            console.error('Error adding total nodes:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen h-fit w-full md:flex md:flex-col md:items-center md:justify-center mt-[120px] md:mt-[80px] lg:mt-0 px-2 sm:px-5">
            {
                user?.isNodeAdded ?
                    <div className="flex flex-col gap-8 mb-10">
                        <h2 className="text-white text-2xl font-bold text-center">Welcome to the EDITH SuperComputer</h2>
                        <div className="text-white flex flex-col lg:flex-row gap-5 w-full justify-between lg:items-end">
                            <div className='flex flex-col gap-2 items-center border border-[#25252799] rounded-[12px] bg-[#0E0E10] w-full lg:w-[calc(50%-10px)] pt-9 pb-8 relative'>
                                <Image src="/image/login/pixels.png" alt="logo" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[401px] h-auto" width={401} height={401} />
                                <Image src='/image/logo-chat.png' alt='edith-logo' width={60} height={60} />
                                <ShadowBtn
                                    className="rounded-full w-[164px] mt-5"
                                    mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white py-2 px-2 gap-0 rounded-full text-sm flex items-center justify-center gap-[6px]"
                                >
                                    <span className='text-sm w-full transition-all duration-300'>
                                        {
                                            isConnecting ?
                                                (isNodeConnected ? 'Disconnecting...' : 'Connecting...') :
                                                isNodeConnected ?
                                                    'Connected' : 'Disconnected'
                                        }
                                    </span>
                                    <AntSwitch
                                        inputProps={{ 'aria-label': 'Node Connection Status' }}
                                        onChange={(e) => liveNodeConnect(e.target.checked)}
                                        checked={isNodeConnected}
                                        disabled={isConnecting}
                                    />
                                </ShadowBtn>
                                <div className="flex items-center gap-6 mt-7">
                                    {/* PPS Display */}
                                    <div className="flex flex-col items-center min-w-1/3 md:w-28">
                                        <span className="text-gray-400 text-[14px]">PPS</span>
                                        <span className="text-[36px] font-bold">{stats.pps}</span>
                                    </div>

                                    <Divider orientation="vertical" flexItem sx={{ backgroundColor: '#FFFFFF1F' }} />

                                    {/* Points Display */}
                                    <div className="flex flex-col items-center min-w-1/3 md:w-28">
                                        <div className="text-gray-400 text-[14px] flex items-center gap-1">
                                            Points
                                        </div>
                                        <span className="text-[36px] font-bold">{user?.workerPoints ?? 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col border border-[#25252799] rounded-[12px] bg-[#0E0E10] w-full lg:w-[calc(50%-10px)] px-5 py-[21.5px] h-full gap-6'>
                                <div className='w-full bg-[#0B0B0D] border border-[#252527] rounded-full p-[6px] flex items-center justify-between'>
                                    <ShadowBtn className='w-full rounded-full' mainClassName='rounded-full max-sm:text-[12px]'>
                                        Browser Node
                                    </ShadowBtn>
                                    <div className='w-full text-center max-sm:text-[12px] text-mainFont opacity-50'>
                                        Docker Node
                                    </div>
                                </div>
                                <Divider sx={{ backgroundColor: '#FFFFFF1F' }} />
                                <div className='flex items-center justify-between gap-5 w-full max-sm:flex-col'>
                                    <StatCard label="Total Nodes" value={totalNodes} />
                                    <StatCard label="Live Nodes" value={stats.liveNodes} />
                                </div>
                            </div>
                        </div>

                        {/* Provider Statistics Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {providers.map((provider, index) => (
                                <ProviderCard
                                    key={index}
                                    name={provider.name}
                                    gpuCount={provider.gpuCount}
                                    cpuCount={provider.cpuCount}
                                    logo={provider.logo}
                                />
                            ))}
                        </div>
                    </div>
                    :
                    <div className="flex flex-col gap-3">
                        <div className="text-white text-[20px] font-bold">Add Your Node</div>
                        <div className="text-[#525252] text-[16px]">
                            Select the node type you want to add.
                        </div>
                        <div className='flex flex-col border border-[#25252799] rounded-[12px] bg-[#0E0E10] w-full md:min-w-[589px] px-2 sm:px-5 py-[21.5px] h-full gap-6'>
                            <div className='flex w-full items-center gap-2 sm:gap-4'>
                                <div className='w-full bg-[#0B0B0D] border border-[#252527] rounded-[8px] p-[6px] flex items-center justify-between'>
                                    <ShadowBtn className='w-full rounded-[8px]' mainClassName='rounded-[8px] max-sm:text-[12px] text-nowrap w-full text-white'>
                                        Browser Node
                                    </ShadowBtn>
                                    <div className='w-full text-center max-sm:text-[12px] text-mainFont opacity-50 text-nowrap px-2'>
                                        Docker Node
                                    </div>
                                </div>
                                <button
                                    className="sm:w-[78px] md:w-[150px] h-full flex items-center justify-center bg-[#FAFAFA]/80 border border-transparent focus:outline-none text-[14px] text-[#000000] hover:border-transparent transition-transform duration-300 ease-linear"
                                    onClick={addTotalNodes}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                            <Divider sx={{ backgroundColor: '#FFFFFF1F' }} />
                            <div className='flex items-center justify-between gap-5 w-full max-sm:flex-col'>
                                <StatCard label="Total Nodes" value={totalNodes} />
                                <StatCard label="Live Nodes" value={stats.liveNodes} />
                            </div>
                        </div>
                    </div>
            }
        </div>
    )
};

export default ExplorerWorker;
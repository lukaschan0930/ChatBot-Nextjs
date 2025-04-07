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

const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 58,
    height: 34,
    padding: 0,
    display: 'flex',
    '&:active': {
        '& .MuiSwitch-thumb': {
            width: 30,
        },
    },
    '& .MuiSwitch-switchBase': {
        padding: 2,
        '&.Mui-checked': {
            transform: 'translateX(24px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: '#0066FF',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        width: 30,
        height: 30,
        borderRadius: '50%',
        backgroundColor: '#fff',
        transition: theme.transitions.create(['width'], {
            duration: 200,
        }),
    },
    '& .MuiSwitch-track': {
        borderRadius: 12,
        opacity: 1,
        backgroundColor: '#E9E9EA',
        boxSizing: 'border-box',
        '&.Mui-checked': {
            backgroundColor: '#0066FF',
        },
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
    value: string | number;
}

const ProviderCard: FC<ProviderCardProps> = ({ name, gpuCount, cpuCount, logo }) => (
    <div className="flex flex-col gap-4 w-full p-6 bg-[#000000] rounded-[12px] border border-secondaryBorder blur-sm">
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

const StatCard: FC<StatCardProps> = ({ label, value }) => (
    <div className="flex flex-col gap-2 px-4 py-7 lg:min-w-[237px] w-full bg-[#000000] rounded-[12px] border border-secondaryBorder relative">
        <div className="text-subButtonFont text-[12px] text-nowrap">{label}</div>
        <div className="text-mainFont text-[32px] text-nowrap">{value}</div>
        <Image src="/image/light.svg" alt="light" width={85} height={65} className="absolute top-0 left-0" />
    </div>
);

const ExplorerWorker: FC = () => {
    const { user, setUser } = useAuth();
    const TOTAL_NODES = 13739;
    const [stats, setStats] = useState({
        pps: 0,
        liveNodes: '0',
        totalNodes: TOTAL_NODES.toLocaleString()
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

    // Keep the original useEffect
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const getRandomNumber = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const updateStats = () => {
            if (!user) {
                return;
            }
            // Random PPS between 0.5 to 370
            const newPPS = Math.round(getRandomNumber(0.5, 370));

            // Random point gain between 0.05 to 0.67
            const pointGain = getRandomNumber(0.05, 0.67);

            // Random live nodes between 13% to 34% of total nodes
            const liveNodesPercentage = getRandomNumber(0.13, 0.34);
            const liveNodesCount = Math.round(TOTAL_NODES * liveNodesPercentage);

            setStats(prevStats => ({
                ...prevStats,
                pps: newPPS,
                liveNodes: liveNodesCount.toLocaleString()
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

            setUser({
                ...user,
                workerPoints: Math.round((Number((user?.workerPoints ?? 0) + Number(pointGain.toFixed(2)))))
            });

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

    return (
        <div className="flex flex-col gap-8">
            <div className="text-white flex flex-col md:flex-row gap-9 w-full justify-between md:items-end">
                <div className='flex flex-col gap-2 items-center'>
                    <div className="flex items-center gap-6 max-md:w-full">
                        {/* PPS Display */}
                        <div className="flex flex-col items-center w-1/3 md:w-28">
                            <span className="text-3xl font-bold">{stats.pps}</span>
                            <span className="text-gray-400 text-sm">PPS</span>
                        </div>

                        {/* Connection Status */}
                        <div className="flex flex-col items-center w-1/3 md:w-28">
                            <AntSwitch
                                inputProps={{ 'aria-label': 'Node Connection Status' }}
                                onChange={(e) => setIsConnected(e.target.checked)}
                                checked={isConnected}
                            />
                        </div>

                        {/* Points Display */}
                        <div className="flex flex-col items-center w-1/3 md:w-28">
                            <span className="text-3xl font-bold">{user?.workerPoints ?? 0}</span>
                            <div className="text-gray-400 text-sm flex items-center gap-1">
                                Points <InfoIcon />
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 text-sm font-medium">
                        {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    </div>
                    <div className="text-xs text-gray-400">
                        Welcome to the EDITH supercomputer
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard label="Live Nodes" value={stats.liveNodes} />
                    <StatCard label="Total Nodes" value={stats.totalNodes} />
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
        </div>
    );
};

export default ExplorerWorker;
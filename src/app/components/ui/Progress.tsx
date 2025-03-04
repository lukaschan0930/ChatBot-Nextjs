// src/app/components/ProgressBar.tsx
import React, { useState, useEffect } from 'react';

interface ProgressProps {
    progress: number; // Progress as a percentage (0-100)
}

const Progress: React.FC<ProgressProps> = ({ progress }) => {
    const [displayedProgress, setDisplayedProgress] = useState(progress);

    useEffect(() => {
        const increment = progress > displayedProgress ? 1 : -1;
        const interval = setInterval(() => {
            setDisplayedProgress((prev) => {
                if (prev === progress) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + increment;
            });
        }, 20); // Adjust the interval time for speed of update

        return () => clearInterval(interval);
    }, [progress]);

    return (
        <div className="w-full bg-[#FFFFFF14] rounded-full h-2.5 relative">
            <div
                className="h-2.5 rounded-full transition-width duration-500 ease-in-out relative progress-bar-striped"
                style={{
                    width: `${progress}%`,
                }}
            >
                {/* <div
                    className="absolute inset-0 rounded-full -right-1"
                    style={{
                        background: 'linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(255, 255, 255))',
                        filter: 'blur(8px)',
                    }}
                ></div> */}
                {/* <div
                    className="absolute -right-1 -top-1 h-[18px] w-full max-w-[100px] rounded-full bg-gradient-to-r from-transparent to-white opacity-50 animate-pulse"
                    style={{
                        background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5))',
                    }}
                ></div> */}
            </div>
            <div className='absolute -top-5 right-1'>
                <p className='text-sm text-mainFont'>{displayedProgress}%</p>
            </div>
        </div>
    );
};

export default Progress;
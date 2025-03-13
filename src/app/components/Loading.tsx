import React from 'react';

interface LoadingProps {
  size?: number;
  color?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 20, 
  color = "#4CAF50" 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
    >
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="60"
        strokeDashoffset="60"
        strokeLinecap="round"
      >
        <animate
          attributeName="stroke-dashoffset"
          dur="1.5s"
          repeatCount="indefinite"
          values="60;-60"
        />
      </path>
    </svg>
  );
};

export default Loading;
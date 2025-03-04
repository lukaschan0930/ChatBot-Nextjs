const DoubleRightArrow = (
    {
        width = 13,
        height = 14,
        className = "",
        onClick = () => { }
    }: {
        width?: number;
        height?: number;
        className?: string;
        onClick?: () => void;
    }
) => {
    return (
        <svg width={width} height={height} viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} onClick={onClick}>
            <path d="M1 1L7 6.77778L1 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 1L12 6.77778L6 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default DoubleRightArrow;

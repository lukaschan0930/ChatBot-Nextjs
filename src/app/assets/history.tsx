const HistoryIcon = ({ width = "15", height = "16", className = "" }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M1 8.5C1 12.0899 3.91015 15 7.5 15C11.0899 15 14 12.0899 14 8.5C14 4.91015 11.0899 2 7.5 2C6.07315 2 4.75368 2.45975 3.68164 3.23919M7.5 5.61111V8.5L9.30556 10.3056M3.68164 3.23919V1M3.68164 3.23919L5.68164 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export default HistoryIcon;
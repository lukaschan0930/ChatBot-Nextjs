const Arrow = ({ width = "14", height = "14", className = "" }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M0.999999 13L1 0.999999M4.81818 6.99999L13 6.99999M4.81818 6.99999L7.36364 4.45455M4.81818 6.99999L7.36364 9.54545" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export default Arrow;
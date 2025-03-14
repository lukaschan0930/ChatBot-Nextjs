const DotDivider = () => {
    return (
        <div className="flex items-center w-full my-2 gap-2">
            <div className="h-[2px] flex-grow flex items-center justify-center gap-2">
                {Array(20).fill(0).map((_, index) => (
                    <div
                        key={index}
                        className="w-[6px] h-[2px] rounded-full bg-[#FFFFFF33]"
                    />
                ))}
            </div>
        </div>
    )
}

export default DotDivider;
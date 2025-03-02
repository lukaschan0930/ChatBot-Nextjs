// import { FiEdit3 } from "react-icons/fi";
const UserPrompt = ({ prompt }: { prompt: string }) => {

  return (
    <div className="pl-20 flex justify-end">
      <div className={`flex 
        items-start justify-between h-full 
        gap-4 p-[2px] w-fit bg-inputBg group text-mainFont
        bg-btn-shadow rounded-full border-0 focus:outline-none text-[14px]
        `}
      >
        <span className="flex-1 bg-[#181818] border-0 px-3 py-2 rounded-full">{prompt}</span>
        {/* <button className="p-0 text-transparent transition-colors duration-100 ease-linear bg-transparent border-none group-hover:text-mainFont">
        <FiEdit3 size={20} />
      </button> */}
      </div>
    </div>
  )
}

export default UserPrompt
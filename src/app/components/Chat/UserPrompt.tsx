import Image from "next/image";
import { isImage } from "@/app/lib/utils";

// import { FiEdit3 } from "react-icons/fi";
const UserPrompt = ({ prompt, fileUrls }: { prompt: string, fileUrls: string[] }) => {

  return (
    <div className="pl-20 w-full flex justify-end lg:max-w-[700px] md:px-4">
      <div className="flex flex-col items-end gap-2 mb-4">
        {
          fileUrls && fileUrls.length > 0 &&
          <div className="flex flex-col items-start gap-2 mb-4">
            {fileUrls.map((fileUrl, index) => (
              isImage(fileUrl) &&
              <Image src={`${process.env.AWS_CDN_URL}/${fileUrl}`} alt="file" width={100} height={100} className="w-[100px] h-auto rounded-sm border border-gray-500" />
            ))}
          </div>
        }
        <div className={`flex 
        items-start justify-between h-full 
        gap-4 p-[2px] w-fit bg-inputBg group text-mainFont
        bg-btn-shadow rounded-lg border-0 focus:outline-none text-[14px]
        `}
        >
          <span className="flex-1 bg-[#181818] border-0 px-3 py-2 rounded-lg">{prompt}</span>
          {/* <button className="p-0 text-transparent transition-colors duration-100 ease-linear bg-transparent border-none group-hover:text-mainFont">
        <FiEdit3 size={20} />
      </button> */}
        </div>
      </div>
    </div>
  )
}

export default UserPrompt
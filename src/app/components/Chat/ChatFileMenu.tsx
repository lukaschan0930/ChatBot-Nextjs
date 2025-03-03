import { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSub,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu";
import { ChatTypeItems } from "@/app/lib/stack";
import { FaFile, FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import { Divider } from "@mui/material";
import ShadowBtn from "../ShadowBtn";

interface FileWithUrl {
    file: File;
    url: string;
}

interface ChatFileMenuProps {
    files: FileWithUrl[];
    handleClickPlusIcon: () => void;
    handleRemoveFile: (index: number) => void;
    setFiles: React.Dispatch<React.SetStateAction<FileWithUrl[]>>;
    isFileMenuOpen: boolean;
    setIsFileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatFileMenu: React.FC<ChatFileMenuProps> = ({
    files,
    handleClickPlusIcon,
    handleRemoveFile,
    setFiles,
    isFileMenuOpen,
    setIsFileMenuOpen
}) => {

    const [isOpen, setIsOpen] = useState<boolean>(isFileMenuOpen);

    useEffect(() => {
        setIsOpen(isFileMenuOpen);
    }, [isFileMenuOpen]);


    return (
        <DropdownMenu onOpenChange={setIsFileMenuOpen}>
            <DropdownMenuTrigger className={`p-0 bg-transparent`}>
                <ShadowBtn
                    className="rounded-full"
                    mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google w-[38px] h-[38px] text-white py-2 px-2 gap-0 rounded-full flex flex-col items-center justify-center"
                >
                    <FaFile className="w-[15px] h-[15px]" />
                </ShadowBtn>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="bg-inputBg mt-[14px] border-secondaryBorder flex flex-col gap-2 text-mainFont w-[370px]"
                align="start"
            >
                <div className="w-full flex justify-between items-center px-2">
                    <div>Attached Files</div>
                    <div className="flex gap-3">
                        <button className="text-mainFont text-sm flex items-center gap-1 p-1 bg-transparent" onClick={handleClickPlusIcon}>
                            <FaPlus />
                            Add
                        </button>
                        <button className="text-mainFont text-sm flex items-center gap-1 p-1 bg-transparent" onClick={() => setFiles([])}>
                            <FaTrash />
                            Clear
                        </button>
                    </div>
                </div>
                <Divider sx={{
                    borderColor: "#25252799",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    width: "100%",
                }} />
                {files.map((file, index) => (
                    <div key={index}>
                        <div className="flex justify-between items-center px-2">
                            <div className="flex items-center gap-2">
                                <FaFile />
                                <div className="max-w-[150px] truncate">
                                    {file.file.name}
                                </div>
                            </div>
                            <FaTimes className="cursor-pointer rounded-full p-[1px] hover:border hover:border-red-500 hover:bg-red-500 hover:text-white transition-all duration-150" onClick={() => handleRemoveFile(index)} />
                        </div>
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ChatFileMenu;

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSub,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from "@/app/components/ui/dropdown-menu";
import { ChatTypeItems } from "@/app/lib/stack";
import { FaFile, FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import { Divider } from "@mui/material";
import ShadowBtn from "../ShadowBtn";
import { ProDisableIcon } from "@/app/assets/pro";
import Lightning from "@/app/assets/lightning";
import ChatSetupIcon from "@/app/assets/ChatSetupIcon";
import { useAtom } from "jotai";
import { chatModeAtom, chatTypeAtom, modelTypeAtom } from "@/app/lib/store";

interface IFile {
    file: File;
    url: string;
}

interface ChatSettingMenuProps {
    files: IFile[];
}

const ChatSettingMenu: React.FC<ChatSettingMenuProps> = ({ files }) => {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [chatMode, setChatMode] = useAtom(chatModeAtom);
    const [chatType, setChatType] = useAtom(chatTypeAtom);
    const [modelType, ] = useAtom(modelTypeAtom);

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className={`p-0 bg-transparent border-none focus:outline-none`}>
                <ShadowBtn
                    className={`rounded-full hover:bg-btn-shadow focus:bg-btn-shadow ${!isOpen && 'border-transparent bg-transparent'}`}
                    mainClassName={`hover:border-[#2C2B30] focus:border-[#2C2B30] hover:bg-[#292929] focus:bg-[#292929] shadow-btn-google w-[38px] h-[38px] text-white py-2 px-2 gap-0 rounded-full flex flex-col items-center justify-center ${!isOpen ? 'border-transparent bg-transparent' : 'border-[#2C2B30]'}`}
                >
                    <ChatSetupIcon />
                </ShadowBtn>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="bg-inputBg mt-[14px] border-secondaryBorder flex flex-col gap-2 text-mainFont w-[150px]"
                align="start"
            >
                <DropdownMenuSub>
                    <DropdownMenuCheckboxItem
                        className="text-mainFont hover:!text-mainFont cursor-pointer hover:!bg-[#2929293B] focus:!bg-[#2929293B] flex gap-2 items-center px-3 py-2 [&>span]:hidden text-md"
                        checked={chatType == 1}
                        onCheckedChange={() => setChatType(prevType => prevType == 1 ? 0 : 1)}
                        disabled={files.length > 0 || chatMode == 1 || modelType == "image" || modelType == "audio"}
                    >
                        <div className="w-[15px] h-[15px]">
                            <ProDisableIcon />
                        </div>
                        <p>Pro Search</p>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        className="text-mainFont hover:!text-mainFont cursor-pointer hover:!bg-[#2929293B] focus:!bg-[#2929293B] flex gap-2 items-center px-3 py-2 [&>span]:hidden text-md"
                        checked={chatMode == 1}
                        onCheckedChange={() => {
                            setChatMode(prevMode => prevMode == 1 ? 0 : 1)
                            setChatType(0)
                        }}
                    >
                        <div className="text-black w-[15px] h-[15px]">
                            <Lightning />
                        </div>
                        <p>Faster x30</p>
                    </DropdownMenuCheckboxItem>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ChatSettingMenu;

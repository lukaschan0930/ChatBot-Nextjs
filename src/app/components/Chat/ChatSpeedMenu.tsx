import { useState } from "react";
import Lightning from "@/app/assets/lightning";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuSub,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

import { useAtom } from "jotai";
import { chatModeAtom, chatTypeAtom } from "@/app/lib/store";

const ChatSpeed = [
    {
        label: "Normal Speed",
        value: 0
    },
    {
        label: "Faster x30",
        value: 1
    }
]

const ChatSpeedMenu = () => {
    const [chatMode, setChatMode] = useAtom(chatModeAtom);
    const [chatType, setChatType] = useAtom(chatTypeAtom);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // const handleItemClick = (itemId: string, subItemId?: string) => {
    //   setMenuItems((prevItems) =>
    //     prevItems.map((item) => ({
    //       ...item,
    //       checked: item.id === itemId,
    //       subItems: item.subItems.map((subItem) => ({
    //         ...subItem,
    //         checked: subItemId
    //           ? subItem.id === subItemId && item.id === itemId
    //           : false,
    //       })),
    //     }))
    //   );
    // };

    const handleItemClick = (itemId: number) => {
        setChatMode(itemId);
        setChatType(itemId == 1 ? 0 : chatType);
    };

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className={`bg-btn-shadow rounded-full p-[1px] border-0 focus:outline-none text-center sm:hidden`}>
                <p className={`bg-[#292929] border-0 w-[38px] h-[38px] py-2 rounded-full flex items-center justify-center ${chatMode == 1 ? "text-white" : "text-gray-500"}`}>
                    <Lightning />
                </p>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="bg-[#0E0E10] mt-[10px] border-[#1C1C1E]"
                align="start"
            >
                {ChatSpeed.map((item, index) => (
                    <DropdownMenuSub key={item.value}>
                        <DropdownMenuCheckboxItem
                            checked={chatMode === index}
                            onCheckedChange={() => {
                                handleItemClick(index);
                            }}
                            className="text-mainFont hover:!text-mainFont cursor-pointer hover:!bg-[#2929293B] flex items-center justify-between px-3 py-2 [&>span]:hidden text-md"
                        >
                            <p className="flex-1">{item.label}</p>
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuSub>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ChatSpeedMenu;

import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useAtom } from "jotai";
import { 
    chatModeAtom, 
    chatTypeAtom,
    fileAtom,
    modelTypeAtom
} from "@/app/lib/store";
import { ProDisableIcon, ProEnableIcon } from "@/app/assets/pro";
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { IFileWithUrl } from "@/app/lib/interface";

const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
    '&:active': {
        '& .MuiSwitch-thumb': {
            width: 15,
        },
        '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(9px)',
        },
    },
    '& .MuiSwitch-switchBase': {
        padding: 2,
        '&.Mui-checked': {
            transform: 'translateX(12px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: '#1890ff',
                ...theme.applyStyles('dark', {
                    backgroundColor: '#177ddc',
                }),
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
        width: 12,
        height: 12,
        borderRadius: 6,
        transition: theme.transitions.create(['width'], {
            duration: 200,
        }),
    },
    '& .MuiSwitch-track': {
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor: 'rgba(0,0,0,.25)',
        boxSizing: 'border-box',
        ...theme.applyStyles('dark', {
            backgroundColor: 'rgba(255,255,255,.35)',
        }),
    },
}));

const ChatProMenu = () => {
    const [chatMode, setChatMode] = useAtom(chatModeAtom);
    const [chatType, setChatType] = useAtom(chatTypeAtom);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [files] = useAtom<IFileWithUrl[]>(fileAtom);
    const [modelType] = useAtom(modelTypeAtom);

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

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className={`bg-btn-shadow rounded-full p-[1px] border-0 focus:outline-none text-center sm:hidden`}>
                <p className={`bg-[#292929] border-0 w-[38px] h-[38px] py-2 rounded-full flex items-center justify-center ${chatType == 1 ? "text-white" : "text-gray-500"}`}>
                    {chatType == 1 ? <ProEnableIcon /> : <ProDisableIcon />}
                </p>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="bg-[#161616] mt-[10px] border-[#1C1C1E] text-white flex items-center justify-between pl-3 pr-7 py-4 gap-[6px]"
                align="start"
            >
                Pro Search
                <AntSwitch
                    inputProps={{ 'aria-label': 'Pro Search' }}
                    onChange={(e) => setChatType(e.target.checked ? 1 : 0)}
                    disabled={files.length > 0 || chatMode == 1 || modelType == "image" || modelType == "audio"}
                    checked={chatType == 1}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ChatProMenu;

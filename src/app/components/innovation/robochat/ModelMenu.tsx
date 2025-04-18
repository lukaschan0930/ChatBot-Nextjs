import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuSub,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { RoboModels } from "@/app/lib/stack";
import { useAtom } from "jotai";
import { roboModelAtom } from "@/app/lib/store";

const RoboModelMenu = () => {
    const [roboModel, setRoboModel] = useAtom(roboModelAtom);
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
        setRoboModel(itemId);
    };

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className={`bg-btn-shadow rounded-lg p-[1px] border-0 focus:outline-none text-center`}>
                <p className="bg-[#292929] border-0 px-2 py-2 rounded-lg flex items-center justify-between gap-2 w-[190px]">
                    <p className="text-mainFont text-sm capitalize">{RoboModels[roboModel].label}</p>
                    <FaChevronDown
                        className={`!w-4 !h-4 ${isOpen ? "rotate-180" : ""
                            } transition-all duration-150`}
                    />
                </p>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="bg-[#0E0E10] mt-[10px] border-[#1C1C1E]"
                align="start"
            >
                {RoboModels.map((item, index) => (
                    <DropdownMenuSub key={item.value}>
                        <DropdownMenuCheckboxItem
                            checked={roboModel === index}
                            onCheckedChange={() => {
                                handleItemClick(index);
                            }}
                            className="text-mainFont hover:!text-mainFont cursor-pointer hover:!bg-[#2929293B] flex items-center justify-between px-3 py-2 [&>span]:hidden text-md"
                        >
                            <p className="flex-1">{item.label}</p>
                        </DropdownMenuCheckboxItem>
                        {/* <DropdownMenuSubTrigger>
              <DropdownMenuCheckboxItem
                checked={item.checked}
                onCheckedChange={() => handleItemClick(item.id)}
                onSelect={(e) => e.preventDefault()}
              >
                {item.label}
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {item.subItems.map((subItem) => (
                <DropdownMenuCheckboxItem
                  key={subItem.id}
                  checked={subItem.checked}
                  onCheckedChange={() => handleItemClick(item.id, subItem.id)}
                >
                  {subItem.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent> */}
                    </DropdownMenuSub>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default RoboModelMenu;

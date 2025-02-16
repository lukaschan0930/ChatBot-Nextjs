import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { ChatTypeItems } from "@/app/lib/stack";
import Image from "next/image";
import { useAtom } from "jotai";
import { chatTypeAtom } from "@/app/lib/store";

const ChatTypeMenu = () => {
  const [menuId, setMenuId] = useAtom(chatTypeAtom);
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
    setMenuId(itemId);
  };

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className={`flex justify-between items-center bg-inputBg pl-0 pr-3 border-secondaryBorder hover:border-tertiaryBorder rounded-lg h-10 text-mainFont text-xl focus:outline-none gap-3 ${ChatTypeItems[menuId].id === "normal" ? "w-[100px]" : "w-[140px]"}`}>
        <Image src={ChatTypeItems[menuId].image} alt="chat type" className="w-auto h-[38px] rounded-lg" width={100} height={32} />
        <FaChevronDown
          className={`!w-5 !h-5 ${
            isOpen ? "rotate-180" : ""
          } transition-all duration-150`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-inputBg mt-[14px] border-secondaryBorder"
        align="start"
      >
        {ChatTypeItems.map((item, index) => (
          <DropdownMenuSub key={item.id}>
            <DropdownMenuCheckboxItem
              checked={menuId === index}
              onCheckedChange={() => {
                handleItemClick(index);
              }}
              className="text-mainFont hover:text-hoverFont flex items-center justify-between px-3 py-2 [&>span]:hidden text-md"
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

export default ChatTypeMenu;

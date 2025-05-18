"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
// import { useRouter } from "next/navigation";
import Image from "next/image";
import ShadowBtn from "../ShadowBtn";
import { Divider } from "@mui/material";
// import InfoIcon from "@/app/assets/info";
// import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from "react";
// import { styled } from '@mui/material/styles';
import { routerModelAtom, routerModelsAtom, modelTypeAtom } from "@/app/lib/store";
import { useAtom } from "jotai";
import { ModelType } from "@/app/lib/stack";
import { useToast } from "@/app/hooks/use-toast";
import { IAI } from "@/app/lib/interface";
import { FaChevronDown } from "react-icons/fa";

// const MenuTooltip = styled(({ className, ...props }: TooltipProps) => (
//   <Tooltip {...props} classes={{ popper: className }} />
// ))(({ theme }) => ({
//   [`& .${tooltipClasses.tooltip}`]: {
//     backgroundColor: "#151517",
//     color: '#808080',
//     boxShadow: theme.shadows[1],
//     border: '1px solid #2C2B3080',
//     padding: '16px 12px',
//     fontSize: 13,
//     width: '282px',
//     borderRadius: '6px',
//   },
// }));

// const InfoComponent = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function InfoComponent(props, ref) {
//   return (
//     <div {...props} ref={ref}>
//       <InfoIcon />
//     </div>
//   );
// });

const DropDownModelMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [menuId, setMenuId] = useState<string>("");
  const [itemTitle, setItemTitle] = useState<string>("Atlas by EDITH");
  const [routerModel, setRouterModel] = useAtom(routerModelAtom);
  const [routerModels, setRouterModels] = useAtom(routerModelsAtom);
  const [modelType, setModelType] = useAtom(modelTypeAtom);
  const { toast } = useToast();

  const handleItemClick = (itemId: string) => {
    const item = routerModels.find((item) => item._id === itemId);
    if (item) {
      setItemTitle(item.name);
      setRouterModel(item._id);
      setMenuId(item.type);
      setModelType(item.type);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const fetchRouterModels = async () => {
      try {
        const res = await fetch("/api/innovation/router/aiModel");
        const data = await res.json();
        if (data.status) {
          setRouterModels(data.data);
          if (!routerModel) {
            setItemTitle(data.data[0].name);
            !routerModel && setRouterModel(data.data[0]._id);
          } else {
            setItemTitle(routerModels.find((item) => item._id === routerModel)?.name || "");
          }
        } else {
          toast({
            description: data.message,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          description: "Failed to fetch router models",
          variant: "destructive"
        });
      }
    }
    if (!menuId) {
      setMenuId(ModelType[0].id);
    }
    routerModels.length == 0 && fetchRouterModels();
    if (routerModel && routerModels.length > 0) {
      setItemTitle(routerModels.find((item) => item._id === routerModel)?.name || "");
      setMenuId(routerModels.find((item) => item._id === routerModel)?.type || "");
    }
  }, [ModelType, routerModel]);

  return (
    <>
      <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
        <DropdownMenuTrigger className="flex justify-between items-center gap-3 bg-transparent hover:border-transparent text-mainFont text-[16px] focus:outline-none w-fit p-0">
          <ShadowBtn
            className="rounded-md"
            mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white py-2 h-[38px] px-3 gap-0 rounded-md text-[12px] sm:text-sm flex items-center justify-center gap-[6px]"
          >
            <span className="flex-1 leading-none text-center">{itemTitle}</span>
            <FaChevronDown />
            {/* <Image src="/image/UpDown.png" alt="arrow-down" width={9} height={14} /> */}
          </ShadowBtn>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-box-bg border-box-border rounded-2xl flex flex-col"
          align="center"
        >
          {/* <div className="p-3">
            <div className="flex items-center justify-between gap-1 rounded-xl bg-[#0B0B0D] p-2 w-full border border-[#25252799]">
              {
                ModelType.map((menu) => (
                  <ShadowBtn
                    key={menu.id}
                    className={`w-full rounded-md ${menu.id !== menuId && "bg-transparent"}`}
                    mainClassName={`px-3 py-1 text-[12px] text-white whitespace-nowrap ${menu.id !== menuId && "bg-transparent"}`}
                    onClick={() => setMenuId(menu.id)}
                  >
                    {menu.label}
                  </ShadowBtn>
                ))
              }
            </div>
          </div>
          <Divider sx={{
            borderColor: "#25252799",
            borderWidth: "1px",
            borderStyle: "solid",
            width: "100%",
          }} /> */}
          <div className="p-2 flex flex-col gap-1">
            {
              routerModels && routerModels.length > 0 && routerModels.filter((item) => item.type === menuId).map((subItem: IAI) => (
                // <ShadowBtn
                //   key={subItem._id}
                //   className={`w-full rounded-md`}
                //   mainClassName={`text-white flex flex-col py-3 relative`}
                //   onClick={() => handleItemClick(subItem._id)}
                // >
                  <div className="flex gap-2 items-start cursor-pointer hover:bg-[#ffffff80] focus:bg-[#ffffff80] px-3 py-2 rounded-md" onClick={() => handleItemClick(subItem._id)}>
                    {/* <Image src="/image/logo-chat.png" alt="edith-logo" className="h-[22px] w-auto" width={100} height={22} /> */}
                    <span className="text-[12px] sm:text-[16px] text-nowrap text-white">{subItem.name}</span>
                  </div>
                // </ShadowBtn>
              ))
            }
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {
        isOpen &&
        <div
          className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 w-screen h-screen z-20 sm:hidden`}
        />
      }
    </>
  );
};

export default DropDownModelMenu;
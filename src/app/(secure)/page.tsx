'use client'

import { useRouter } from "next/navigation";
import { MenuItems } from "../lib/stack";
import ShadowBtn from "../components/ShadowBtn";
import Image from "next/image";
import InfoIcon from "../assets/info";
import { Divider } from "@mui/material";
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from "react";

const MenuTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#151517",
    color: '#808080',
    boxShadow: theme.shadows[1],
    border: '1px solid #2C2B3080',
    padding: '16px 12px',
    fontSize: 13,
    width: '282px',
    borderRadius: '6px',
  },
}));

const InfoComponent = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function InfoComponent(props, ref) {
  return (
    <div {...props} ref={ref}>
      <InfoIcon />
    </div>
  );
});

export default function Home() {

  const router = useRouter();

  const handleItemClick = (itemId: string, disable: boolean) => {
    if (!disable) {
      router.push(`/${itemId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative md:px-5">
      <Image
        src="/image/logo-edith.png"
        alt="logo"
        width={100}
        height={100}
        className="h-5 w-auto absolute top-6 left-6"
        onClick={() => {
          router.push("/");
        }}
      />
      <div className="flex flex-col max-md:mt-20">
        <div className="px-4 text-[20px] text-white font-semibold">Get Started</div>
        <div className="px-4 text-box-fontSub text-[16px] mt-3">Select an element to get started</div>
        <div className="flex flex-col gap-4 p-4 border-[#1C1C1E] bg-[#0E0E10] rounded-[20px] border mt-6">
          {
            MenuItems.map((item) => (
              <div key={item.id} className="flex flex-col py-4 px-3 gap-5 bg-[#0B0B0D] border border-[#25252799] rounded-[8px]">
                <div className="text-white text-[14px]">{item.label}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3">
                  {item.subItems.map((subItem) => (
                    <ShadowBtn
                      key={subItem.id}
                      className={`w-full rounded-md`}
                      mainClassName={`text-white flex flex-col items-center justify-center py-7 px-2 md:px-16 relative ${subItem.disable && "bg-[#141415]"}`}
                      onClick={() => handleItemClick(subItem.id, subItem.disable)}
                    >
                      <div className="flex items-center gap-3">
                        <Image src="/image/logo-edith-light.png" alt="edith-logo" className="h-[22px] w-auto" width={100} height={22} />
                        <Divider orientation="vertical" flexItem className="w-[1px] bg-[#FFFFFF47]" />
                        <span className="text-[16px] text-nowrap">{subItem.label}</span>
                      </div>
                      {
                        subItem.tooltip &&
                        <div className="absolute right-3 top-3 w-4 h-4 bg-black border-2 border-[#2C2B30] rounded-full flex items-center justify-center">
                          <MenuTooltip title={subItem.tooltip} placement="top" arrow>
                            <InfoComponent />
                          </MenuTooltip>
                        </div>
                      }
                    </ShadowBtn>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
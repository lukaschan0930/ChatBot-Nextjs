'use client'

import { useRouter } from "next/navigation";
import { MenuItems } from "../lib/stack";
import ShadowBtn from "../components/ShadowBtn";
import Image from "next/image";
import InfoIcon from "../assets/info";

export default function Home() {

  const router = useRouter();

  const handleItemClick = (itemId: string, disable: boolean) => {
    if (!disable) {
      router.push(`/${itemId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full relative">
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
      <div className="flex flex-col">
        <div className="px-4 text-[20px] text-white font-semibold">Get Started</div>
        <div className="px-4 text-box-fontSub text-[16px] mt-3">Select an element to get started</div>
        <div className="flex flex-col gap-4 p-4 border-[#1C1C1E] bg-[#0E0E10] rounded-[20px] border mt-6">
          {
            MenuItems.map((item) => (
              <div key={item.id} className="flex flex-col py-4 px-3 gap-5 bg-[#0B0B0D] border border-[#25252799] rounded-[8px]">
                <div className="text-white text-[14px]">{item.label}</div>
                <div className="flex gap-3">
                  {item.subItems.map((subItem) => (
                    <ShadowBtn
                      key={subItem.id}
                      className={`w-[282px] rounded-md`}
                      mainClassName={`text-white flex flex-col items-center justify-center py-7 relative ${subItem.disable && "bg-[#141415]"}`}
                      onClick={() => handleItemClick(subItem.id, subItem.disable)}
                    >
                      <div className="flex items-center gap-3">
                        <Image src="/image/EDITH_logo_png.png" alt="edith-logo" className="h-[22px] w-auto" width={100} height={100} />
                        <span className="text-[16px] text-nowrap">{subItem.label}</span>
                      </div>
                      <div className="absolute right-3 top-3 w-4 h-4 bg-black border-2 border-[#2C2B30] rounded-full flex items-center justify-center">
                        <InfoIcon />
                      </div>
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
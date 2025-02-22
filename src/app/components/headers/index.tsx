'use client'
import { usePathname, useRouter } from "next/navigation";
import DropDownMenu from "@/app/components/headers/DropDownMenu";
import MobileDropDownMenu from "@/app/components/headers/MobileDropDownMenu";
import { useEffect, useRef, useState } from "react";
import ProfileDropDownMenu from "@/app/components/headers/ProfileDropDownMenu";
import Image from "next/image";
import MobileAdminMenu from "./MobileAdminMenu";
import ShadowBtn from "../ShadowBtn";
import ChangeLog from "@/app/assets/changelog";
import DocsIcon from "@/app/assets/docs";
import SunIcon from "@/app/assets/sun";
import { useAtom } from "jotai";
import { isSidebarVisibleAtom, chatLogAtom, sessionIdAtom, isStartChatAtom } from "@/app/lib/store";
import Arrow from "@/app/assets/arrow";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const endPoint = pathname.split("/")[1] || "";

  const leftSidebarRef = useRef<HTMLDivElement | null>(null);
  const rightSidebarRef = useRef<HTMLDivElement | null>(null);

  const [isLeftSidebar, setIsLeftSidebar] = useState<boolean>(false);
  const [isRightSidebar, setIsRightSidebar] = useState<boolean>(false);
  const [isSidebarVisible, setIsSidebarVisible] = useAtom(isSidebarVisibleAtom);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        leftSidebarRef.current &&
        !leftSidebarRef.current.contains(event.target as Node) &&
        isLeftSidebar
      ) {
        setIsLeftSidebar(false);
      }

      if (
        rightSidebarRef.current &&
        !rightSidebarRef.current.contains(event.target as Node) &&
        isRightSidebar
      ) {
        setIsRightSidebar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLeftSidebar, isRightSidebar]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b-2 bg-headerBg text-mainFont border-primaryBorder">
        <div className="flex h-[72px] items-center pr-6 justify-between relative">
          <div className={`flex items-center pl-4 h-full w-[260px] ${endPoint === "admin" ? "border-none" : "border-[#29292B] border-r"}`}>
            <div className={`pr-2 py-[1px] border-[#29292B] mr-2 ${endPoint !== "admin" && "border-r-2"}`}>
              <Image
                src="/image/logo-edith.png"
                alt="logo"
                width={100}
                height={100}
                className="h-5 w-auto"
                onClick={() => {
                  router.push("/");
                }}
              />
            </div>
            {
              endPoint !== "admin" &&
                <>
                  <DropDownMenu />
                  <ShadowBtn
                    className="ml-4"
                    mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white py-[6px] px-[6px]"
                    onClick={() => {
                      setIsSidebarVisible(!isSidebarVisible);
                    }}
                  >
                    <Arrow
                      className={`${!isSidebarVisible ? "rotate-180" : ""
                        } transition-all duration-150`}
                    />
                  </ShadowBtn>
                </>  
            }
          </div>
          {
            endPoint !== "admin" ? (
              <>
                <div className="items-center hidden gap-10 lg:flex">
                  <div className="flex items-center gap-3">
                    <ShadowBtn
                      className="rounded-md"
                      mainClassName="rounded-md border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white py-[6px] px-[14px] flex items-center justify-center gap-2"
                      onClick={() => router.push("/changeLog")}
                    >
                      <ChangeLog />
                      <span className="text-[14px]">Changelog</span>
                    </ShadowBtn>
                    <ShadowBtn
                      className="rounded-md"
                      mainClassName="rounded-md border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white py-[6px] px-[14px] flex items-center justify-center gap-2"
                      onClick={() => window.open("https://docs.edithx.ai", "_blank")}
                    >
                      <DocsIcon />
                      <span className="text-[14px]">Docs</span>
                    </ShadowBtn>
                    {/* <ShadowBtn
                      className="rounded-full"
                      mainClassName="rounded-full border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white py-[7px] px-[7px] flex items-center justify-center gap-2"
                    >
                      <SunIcon />
                    </ShadowBtn>
                    <ProfileDropDownMenu /> */}
                  </div>
                </div>
                <div className="lg:hidden">
                  <MobileDropDownMenu />
                </div>
              </>
            ) : (
              <>
                <div className="text-white text-2xl font-bold flex items-center gap-2">
                  Admin
                  <div className="lg:hidden">
                    <MobileAdminMenu />
                  </div>
                </div>
              </>
            )
          }
        </div>
      </header>
    </>
  );
};

export default Header;
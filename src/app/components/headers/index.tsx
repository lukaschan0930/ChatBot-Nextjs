'use client'
import { usePathname, useRouter } from "next/navigation";
import DropDownMenu from "@/app/components/headers/DropDownMenu";
import MobileDropDownMenu from "@/app/components/headers/MobileDropDownMenu";
import { useEffect, useRef, useState } from "react";
import ProfileDropDownMenu from "@/app/components/headers/ProfileDropDownMenu";
import Image from "next/image";
import MobileAdminMenu from "./MobileAdminMenu";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const endPoint = pathname.split("/")[1] || "";

  const leftSidebarRef = useRef<HTMLDivElement | null>(null);
  const rightSidebarRef = useRef<HTMLDivElement | null>(null);

  const [isLeftSidebar, setIsLeftSidebar] = useState<boolean>(false);
  const [isRightSidebar, setIsRightSidebar] = useState<boolean>(false);

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
        <div className="flex h-[72px] items-center px-4 sm:px-10 justify-between relative">
          <div className="flex items-center gap-10">
            <button
              className="flex items-end p-0 bg-transparent border-none outline-none focus:outline-none text-buttonFont"
              onClick={() => router.push("/")}
            >
              <Image
                src="/image/EDITH_logo_png.png"
                alt="logo"
                className="h-10 w-auto"
                width={100}
                height={100}
              />
            </button>
            {
              endPoint !== "admin" && (
                <div className="hidden sm:flex">
                  <DropDownMenu />
                </div>
              )
            }
          </div>
          {
            endPoint !== "admin" ? (
              <>
                <div className="items-center hidden gap-10 lg:flex">
                  <div className="flex items-center gap-4">
                    <button
                      className="!rounded-sm flex items-center justify-center h-8 text-base transition-all duration-300 outline-none bg-buttonBg hover:bg-buttonHoverBg text-mainFont hover:text-hoverFont hover:border-transparent border-secondaryBorder focus:border-transparent hover:outline-none focus:outline-none"
                      onClick={() => router.push("/changeLog")}
                    >
                      Change Log
                    </button>
                    <button className="!rounded-sm flex items-center justify-center h-8 text-base transition-all duration-300 outline-none bg-buttonBg hover:bg-buttonHoverBg text-mainFont hover:text-hoverFont hover:border-transparent border-secondaryBorder focus:border-transparent hover:outline-none focus:outline-none">
                      Quests
                    </button>
                    <button className="!rounded-sm flex items-center justify-center h-8 text-base transition-all duration-300 outline-none bg-buttonBg hover:bg-buttonHoverBg text-mainFont hover:text-hoverFont hover:border-transparent border-secondaryBorder focus:border-transparent hover:outline-none focus:outline-none">
                      AI Agents
                    </button>
                    <button className="!rounded-sm flex items-center justify-center h-8 text-base transition-all duration-300 outline-none bg-buttonBg hover:bg-buttonHoverBg text-mainFont hover:text-hoverFont hover:border-transparent border-secondaryBorder focus:border-transparent hover:outline-none focus:outline-none">
                      Docs
                    </button>
                  </div>
                  <ProfileDropDownMenu />
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
      {/* Left Sidebar */}
      {/* <div ref={leftSidebarRef} className="fixed top-[74px] left-0 flex">
        <div
          className={`${
            isLeftSidebar
              ? "w-[260px] h-[calc(100vh-74px)]  bg-headerBg border-r  z-50 scale-100 opacity-100"
              : "scale-0 opacity-0 origin-left"
          }  transition-all duration-150 ease-out`}
        ></div>
        <button
          className={`${
            isLeftSidebar
              ? "h-full -translate-x-[calc(100%+1px)] rounded-bl-lg border-r-transparent"
              : "rounded-br-lg border-l-transparent"
          } bg-buttonBg p-1   border-t-transparent rounded-none hover: focus:outline-none z-[51] transition-all duration-150 ease-out`}
          onClick={() => {
            setIsLeftSidebar(!isLeftSidebar);
            setIsRightSidebar(false);
          }}
        >
          {isLeftSidebar ? (
            <RiMenuFoldLine className="w-5 h-5 text-mainFont" />
          ) : (
            <RiMenuUnfoldLine className="w-5 h-5 text-mainFont" />
          )}
        </button>
      </div> */}

      {/* Right Sidebar */}
      {/* <div ref={rightSidebarRef} className="fixed top-[74px] right-0 flex">
        <button
          className={`${
            isRightSidebar
              ? "h-full translate-x-[calc(100%+1px)] rounded-br-lg border-l-transparent"
              : "rounded-bl-lg border-r-transparent"
          } bg-buttonBg p-1   border-t-transparent rounded-none hover: focus:outline-none z-[51] transition-all duration-150 ease-out`}
          onClick={() => {
            setIsRightSidebar(!isRightSidebar);
            setIsLeftSidebar(false);
          }}
        >
          {isRightSidebar ? (
            <RiMenuUnfoldLine className="w-5 h-5 text-mainFont" />
          ) : (
            <RiMenuFoldLine className="w-5 h-5 text-mainFont" />
          )}
        </button>
        <div
          className={`${
            isRightSidebar
              ? "w-[260px] h-[calc(100vh-74px)]  bg-headerBg border-l  z-50 scale-100 opacity-100"
              : "scale-0 opacity-0 origin-right"
          }  transition-all duration-150 ease-out`}
        ></div>
      </div> */}
    </>
  );
};

export default Header;
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
import ProfileIcon from "@/app/assets/profile";
// import SunIcon from "@/app/assets/sun";
import { useAtom } from "jotai";
import {
  isSidebarVisibleAtom,
  chatLogAtom,
  sessionIdAtom,
  isStartChatAtom,
  fileAtom,
  roboActiveChatAtom,
  roboChatLogAtom,
  routerChatLogAtom
} from "@/app/lib/store";
import HistoryIcon from "@/app/assets/history";
import NewChatIcon from "@/app/assets/newChat";
import { IFileWithUrl } from "@/app/lib/interface";
import { generateSessionId } from "@/app/lib/utils";
import { useSession } from "next-auth/react";
import { useAuth } from "@/app/context/AuthContext";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const endPoint = pathname.split("/");
  const { user } = useAuth();

  const leftSidebarRef = useRef<HTMLDivElement | null>(null);
  const rightSidebarRef = useRef<HTMLDivElement | null>(null);

  const [isLeftSidebar, setIsLeftSidebar] = useState<boolean>(false);
  const [isRightSidebar, setIsRightSidebar] = useState<boolean>(false);
  const [isSidebarVisible, setIsSidebarVisible] = useAtom(isSidebarVisibleAtom);
  const [, setIsStartChat] = useAtom(isStartChatAtom);
  const [, setSessionId] = useAtom(sessionIdAtom);
  const [, setChatLog] = useAtom(chatLogAtom);
  const [, setFiles] = useAtom<IFileWithUrl[]>(fileAtom);
  const [, setRoboActiveChat] = useAtom(roboActiveChatAtom);
  const [, setRoboChatLog] = useAtom(roboChatLogAtom);
  const [, setRouterChatLog] = useAtom(routerChatLogAtom);
  const { data: session } = useSession();

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
      <header className="absolute top-0 left-0 right-0 z-10 text-mainFont">
        {
          endPoint[1] !== "router" &&
          <div className="w-full bg-[#FFFFFF0D] py-[6px] text-center text-sm text-[#FFFFFF99] sm:hidden">
            <span>
              TESTNET
            </span>
          </div>
        }
        <div className="flex h-[72px] items-center max-sm:px-3 max-sm:pt-[11px] pr-2 md:pr-6 justify-between relative">
          <div className={`items-center pl-4 h-full hidden sm:flex`}>
            <div className={`mr-2`}>
              <Image
                src="/image/logo-chat.png"
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
              endPoint[1] !== "admin" &&
              <>
                <DropDownMenu />
                {
                  (
                    endPoint[1] === "chatText" ||
                    endPoint[1] === "changeLog" ||
                    endPoint[1] === "userSetting" ||
                    endPoint[1] === "roboChat" ||
                    endPoint[1] === "router"
                  ) &&
                  <>
                    <ShadowBtn
                      className="ml-8"
                      mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white py-2 px-4 flex items-center justify-center gap-2"
                      onClick={() => {
                        setIsSidebarVisible(!isSidebarVisible);
                      }}
                    >
                      <HistoryIcon />
                      <span className="text-sm">History</span>
                    </ShadowBtn>
                    <ShadowBtn
                      className="ml-3"
                      mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white py-2 px-4 flex items-center justify-center gap-2"
                      onClick={() => {
                        setIsStartChat(false);
                        setSessionId(generateSessionId(
                          session?.user?.email as string,
                          Date.now().toString()
                        ));
                        setFiles([]);
                        setIsSidebarVisible(false);
                        setChatLog([]);
                        setRoboActiveChat(undefined);
                        setRoboChatLog([]);
                        setRouterChatLog([]);
                        router.push(`/${endPoint[1] == "roboChat" ? "roboChat" : endPoint[1] == "router" ? "router" : "chatText"}`);
                      }}
                    >
                      <NewChatIcon />
                      <span className="text-sm">New Chat</span>
                    </ShadowBtn>
                    {endPoint[1] !== "router" && <span className="text-sm text-[#FFFFFF99] ml-6">[ TESTNET ]</span>}
                  </>
                }
                {
                  endPoint[1] === "workers" && endPoint[2] == "marketing" && endPoint[3] === "twitter" &&
                  <>
                    <ShadowBtn
                      className="ml-8"
                      mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white py-2 px-4 flex items-center justify-center gap-2"
                      onClick={() => {
                        setIsSidebarVisible(true);
                      }}
                    >
                      <ProfileIcon />
                      <span className="text-sm">Profile</span>
                    </ShadowBtn>
                  </>
                }
              </>
            }
          </div>
          {
            endPoint[1] !== "admin" &&
            <div className="flex items-center gap-2 sm:hidden">
              {
                (endPoint[1] === "chatText" ||
                  endPoint[1] === "changeLog" ||
                  endPoint[1] === "userSetting" ||
                  endPoint[1] === "roboChat" ||
                  endPoint[1] === "router") &&
                <>
                  <ShadowBtn
                    mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white p-2 flex items-center justify-center gap-2"
                    onClick={() => {
                      setIsSidebarVisible(!isSidebarVisible);
                    }}
                  >
                    <HistoryIcon />
                  </ShadowBtn>
                  <ShadowBtn
                    mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white p-2 flex items-center justify-center gap-2"
                    onClick={() => {
                      setIsStartChat(false);
                      setSessionId(generateSessionId(
                        session?.user?.email as string,
                        Date.now().toString()
                      ));
                      setFiles([]);
                      setIsSidebarVisible(false);
                      setChatLog([]);
                      setRoboActiveChat(undefined);
                      setRoboChatLog([]);
                      setRouterChatLog([]);
                      router.push(`/${endPoint[1] == "roboChat" ? "roboChat" : endPoint[1] == "router" ? "router" : "chatText"}`);
                    }}
                  >
                    <NewChatIcon />
                  </ShadowBtn>
                </>
              }
              {
                (endPoint[1] === "workers" || endPoint[1] === "subscription") &&
                <>
                  <ShadowBtn
                    mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white p-2 flex items-center justify-center gap-2"
                  >
                    <ProfileIcon />
                  </ShadowBtn>
                </>
              }
            </div>
          }
          <div className="flex items-center gap-2 sm:hidden">
            <Image
              src="/image/logo-chat.png"
              alt="logo"
              width={100}
              height={100}
              className="h-5 w-auto"
              onClick={() => {
                router.push("/");
              }}
            />
            <DropDownMenu />
          </div>
          {
            endPoint[1] !== "admin" ? (
              <>
                <div className="items-center hidden gap-10 lg:flex">
                  <div className="flex items-center gap-3">
                    {
                      endPoint[1] !== "router" &&
                      <>
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
                      </>
                    }
                    {/* <ShadowBtn
                      className="rounded-full"
                      mainClassName="rounded-full border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white py-[7px] px-[7px] flex items-center justify-center gap-2"
                    >
                      <SunIcon />
                    </ShadowBtn> */}
                    <ProfileDropDownMenu endpoint={endPoint[1]} />
                  </div>
                </div>
                <div className="lg:hidden flex items-center gap-2">
                  <MobileDropDownMenu />
                </div>
              </>
            ) : (
              <>
                <div className="text-white text-2xl font-bold flex items-center gap-2">
                  Admin
                  <div className="md:hidden">
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
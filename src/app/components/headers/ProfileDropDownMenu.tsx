'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,

} from "@/app/components/ui/dropdown-menu";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";

const ProfileDropDownMenu = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleSetting = () => {
    router.push("/userSetting");
  }

  const handleLogout = () => {
    signOut();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-0 transition-all duration-200 ease-in border-none rounded-full hover:scale-105 focus:outline-none bg-transparent">
        {
          user?.avatar ? (
            <Image src={user?.avatar} alt="avatar" className="h-[46px] w-[46px] rounded-full" width={46} height={46} />
          ) : (
            <div className="h-[50px] w-[50px] rounded-full bg-gradient-to-br from-[#7D2DFF] to-[#41DDFF] flex items-center justify-center"></div>
          )
        }

      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-[#000000] mt-[14px] min-w-[300px] w-fit border-[#FFFFFF]/10 border p-5 rounded-lg text-[#E2E2E2] text-base font-semibold"
        align="end"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          {
            user?.avatar ? (
              <Image src={user?.avatar} alt="avatar" className="h-[60px] w-[60px] rounded-full" width={60} height={60} />
            ) : (
              <div className="h-[60px] w-[60px] rounded-full bg-gradient-to-br from-[#7D2DFF] to-[#41DDFF] flex items-center justify-center"></div>
            )
          }

          <div className="ml-2.5 flex-1">
            <p className="text-base font-semibold">{user?.name}</p>
            <p className="text-base font-normal text-[#FFFFFF]/80">{user?.email}</p>
          </div>

        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#FFFFFF]/10 my-4" />
        <DropdownMenuItem className="text-base" onClick={handleSetting}>
          <FiSettings className="!w-5 !h-5" />
          Setting
        </DropdownMenuItem>
        <DropdownMenuItem className="text-base" onClick={handleLogout}>
          <FiLogOut className="!w-5 !h-5" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropDownMenu;

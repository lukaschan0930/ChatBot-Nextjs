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
      <DropdownMenuTrigger className="p-0 transition-all duration-200 ease-in border-none rounded-full hover:scale-105 focus:outline-none bg-transparent !w-[35px] !h-[35px]">
        {
          user?.avatar ? (
            <Image src={user?.avatar} alt="avatar" className="h-[35px] w-[35px] rounded-full" width={35} height={35} />
          ) : (
            <Image src="/image/default-avatar.png" alt="avatar" className="!h-[35px] !w-auto max-w-[35px]" width={35} height={35} />
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
              <Image src="/image/default-avatar.png" alt="avatar" className="!h-[60px] !w-auto max-w-[60px]" width={60} height={60} />
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

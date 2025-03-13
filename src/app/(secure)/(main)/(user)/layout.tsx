'use client'
import ChatHistory from "@/app/components/Chat/ChatHistory";
import Header from "@/app/components/headers";

const UserSettingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen h-fit">
      <ChatHistory />
      <Header />
      {children}
    </div>
  )
}

export default UserSettingLayout;
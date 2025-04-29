'use client'
import ChatHistory from "@/app/components/Chat/ChatHistory";

const UserSettingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen h-fit">
      <ChatHistory />
      {children}
    </div>
  )
}

export default UserSettingLayout;
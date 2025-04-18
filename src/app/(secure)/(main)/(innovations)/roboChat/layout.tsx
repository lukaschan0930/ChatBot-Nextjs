'use client'
import RoboChatHistory from "@/app/components/innovation/robochat/RoboChatHistory";
import Header from "@/app/components/headers";

const RoboChatLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen h-fit">
      <Header />
      <RoboChatHistory />
      {children}
    </div>
  )
}

export default RoboChatLayout;
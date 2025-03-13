'use client'
import ChatHistory from "@/app/components/Chat/ChatHistory";
import Header from "@/app/components/headers";

const WorkerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen h-fit">
      <Header />
      {children}
    </div>
  )
}

export default WorkerLayout;
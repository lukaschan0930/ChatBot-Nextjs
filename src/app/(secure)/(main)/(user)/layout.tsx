'use client'
import Header from "@/app/components/headers";

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen h-fit">
      <Header />
      {children}
    </div>
  )
}

export default UserLayout;
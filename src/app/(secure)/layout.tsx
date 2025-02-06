'use client'
import Header from "@/app/components/headers";

const SecureLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen h-fit">
      <Header />
      {children}
    </div>
  )
}

export default SecureLayout;
 
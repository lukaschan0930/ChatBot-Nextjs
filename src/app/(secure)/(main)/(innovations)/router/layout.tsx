'use client'
import RouterHistory from "@/app/components/innovation/router/routerHistory";
import Header from "@/app/components/headers";

const RouterLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen h-fit">
      <RouterHistory />
      <Header />
      {children}
    </div>
  )
}

export default RouterLayout;
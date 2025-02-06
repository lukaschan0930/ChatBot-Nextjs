'use client'

import { useRouter, usePathname } from "next/navigation";
import { AdminMenuItems } from "@/app/lib/stack";
import { useAdmin } from "@/app/context/AdminContext";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { logined } = useAdmin();
    const router = useRouter();
    const pathname = usePathname();
    const endPoint = pathname.split("/")[2] || "";

    // Redirect if user is not logged in.
    useEffect(() => {
        if (!logined) {
            router.push("/adminLogin");
        }
    }, [logined]);

    // Optionally, you can render a loading indicator or null while redirecting.
    if (!logined) {
        return null;
    }

    return (
        <div className="w-screen mt-[72px]">
            <div className="flex gap-11 px-8 items-center mt-4 justify-start">
                {
                    AdminMenuItems.map((item) => (
                        <div
                            key={item.id}
                            className={`flex cursor-pointer items-center gap-2 hover:text-mainFont hover:border-b-2 hover:border-mainFont ${endPoint === item.id ? "text-mainFont border-b-2 border-mainFont" : "text-subButtonFont"}`}
                            onClick={() => router.push(`/admin/${item.id}`)}
                        >
                            <div className="text-2xl font-medium">{item.label}</div>
                        </div>
                    ))
                }
            </div>
            {children}
        </div>
    );
}
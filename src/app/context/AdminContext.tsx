'use client'
import { createContext, useContext, useState } from "react";
import { AdminContextType, User } from "@/app/lib/interface";

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [logined, setLogined] = useState<boolean>(false);

  return (
    <AdminContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        logined,
        setLogined,
      }}
    >
      {children}
    </AdminContext.Provider>

  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};


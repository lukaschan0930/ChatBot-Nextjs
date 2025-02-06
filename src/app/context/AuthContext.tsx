'use client'
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType, User } from "@/app/lib/interface";
import { signOut, useSession } from "next-auth/react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [verifyCode, setVerifyCode] = useState<string | null>("");
  const [user, setUser] = useState<User | null>(null);
  const { data: session } = useSession();

  const fetchUserData = async () => {
    try {
      const res = await fetch(`/api/user/profile`);
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        signOut();
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      signOut();
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchUserData();
    }
  }, [session]);


  return (
    <AuthContext.Provider
      value={{
        verifyCode,
        setVerifyCode,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

'use client'
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { AuthContextType, User } from "@/app/lib/interface";
import { signOut, useSession } from "next-auth/react";
import { getRandomNumber } from "../lib/stack";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [verifyCode, setVerifyCode] = useState<string | null>("");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: session } = useSession();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    if (session?.user && !user) {
      fetchUserData();
    }
  }, [session]);

  const updateWorkerPoints = async () => {
    if (!user?.isNodeConnected) return;

    // Random point gain between 0.05 to 0.67
    const pointGain = getRandomNumber(0.05, 0.67);

    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: user.name,
          avatar: user.avatar,
          wallet: user.wallet,
          workerPoints: Math.round((Number((user.workerPoints ?? 0) + Number(pointGain.toFixed(2)))) * 100) / 100
        })
      });

      setUser(prevUser => {
        if (prevUser) {
          return {
            ...prevUser,
            workerPoints: Math.round((Number((prevUser.workerPoints ?? 0) + Number(pointGain.toFixed(2)))) * 100) / 100
          };
        }
        return prevUser;
      });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  // Global worker points update effect
  useEffect(() => {
    const scheduleNextUpdate = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const minutes = getRandomNumber(1.7, 10);
      const nextUpdate = minutes * 60 * 1000;
      console.log("Next worker points update in:", minutes, "minutes");
      
      timerRef.current = setTimeout(async () => {
        await updateWorkerPoints();
        scheduleNextUpdate();
      }, nextUpdate);
    };

    if (user?.isNodeConnected && user) {
      scheduleNextUpdate();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        verifyCode,
        setVerifyCode,
        user,
        setUser,
        isLoading,
        setIsLoading,
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

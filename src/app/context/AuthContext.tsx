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
  const [isNodeConnected, setIsNodeConnected] = useState<boolean>(false);
  const nodeRewardHash = useRef<string | null>(null);
  const workerPoints = useRef<number>(0);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`/api/user/profile`);
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        nodeRewardHash.current = data.user.nodeRewardHash;
        workerPoints.current = data.user.workerPoints;
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
    if (!isNodeConnected || !user) return;

    // Random point gain between 0.05 to 0.67
    const pointGain = getRandomNumber(0.05, 0.67);

    try {
      const data = await fetch('/api/user/profile/workerPoint', {
        method: 'PUT',
        body: JSON.stringify({
          workerPoints: Math.round((Number((workerPoints.current ?? 0) + Number(pointGain.toFixed(2)))) * 100) / 100,
          nodeRewardHash: nodeRewardHash.current
        })
      });

      const res = await data.json();
      if (res.success) {
        workerPoints.current = res.user.workerPoints;
        nodeRewardHash.current = res.user.nodeRewardHash;
      } else {
        console.error('Error updating stats:', res.message);
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  // Global worker points update effect
  useEffect(() => {
    const scheduleNextUpdate = async () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const minutes = getRandomNumber(1.7, 10);
      console.log("minutes", minutes);
      const nextUpdate = minutes * 60 * 1000;

      timerRef.current = setTimeout(async () => {
        await updateWorkerPoints();
        scheduleNextUpdate();
      }, nextUpdate);
    };

    if (isNodeConnected && user) {
      scheduleNextUpdate();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [user, isNodeConnected]);

  return (
    <AuthContext.Provider
      value={{
        verifyCode,
        setVerifyCode,
        user,
        setUser,
        isLoading,
        setIsLoading,
        isNodeConnected,
        setIsNodeConnected,
        workerPoints: workerPoints.current,
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

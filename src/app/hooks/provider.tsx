'use client';
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Session } from "next-auth";

interface ProviderProps {
  children: ReactNode;
  session?: Session;
}

export function Provider({ children, session }: ProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
} 
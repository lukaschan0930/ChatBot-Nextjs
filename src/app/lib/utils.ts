import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { sha256 } from "js-sha256"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSessionId(email: string, timestamp: string) {
  return sha256(`${email}-${timestamp}`);
}
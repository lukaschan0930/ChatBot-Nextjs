import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { sha256 } from "js-sha256"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSessionId(email: string, timestamp: string) {
  return sha256(`${email}-${timestamp}`);
}

export const processChunkedString = (chunkedString: string): Promise<{ content: string, inputToken: number, outputToken: number, inputTime: number, outputTime: number }> => {
  return new Promise((resolve, reject) => {
    const jsonArrayString = `[${chunkedString.replace(/}\s*{/g, '},{')}]`;

    let content = "";
    let inputToken = 0;
    let outputToken = 0;
    let inputTime = 0;
    let outputTime = 0;

    try {
      const jsonArray = JSON.parse(jsonArrayString);
      jsonArray.forEach((data: any) => {
        inputToken += data.inputToken;
        outputToken += data.outputToken;
        inputTime += data.inputTime;
        outputTime += data.outputTime;
        content += data.content;
      });
      resolve({ content, inputToken, outputToken, inputTime, outputTime });
    } catch (error) {
      console.error("Error parsing JSON array string:", error);
      reject(error);
    }
  });
};

export const validateEmail = (email: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export const validatePassword = (password: string) => {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  return passwordPattern.test(password);
};

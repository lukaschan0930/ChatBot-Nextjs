'use client'
import { createContext, useContext, useState } from "react";
import { AdminContextType, User } from "@/app/lib/interface";
import { useRouter } from "next/navigation";

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [logined, setLogined] = useState<boolean>(false);

    const useFetch = () => {
        const router = useRouter();
        return {
            get: request('GET'),
            post: request('POST'),
            put: request('PUT'),
            delete: request('DELETE')
        };

        function request(method: string) {
            return (url: string, body?: any) => {
                const headers: { [key: string]: string | undefined } = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': body ? 'application/json' : undefined
                };

                const requestOptions: RequestInit = {
                    method,
                    headers: Object.fromEntries(Object.entries(headers).filter(([, value]) => value !== undefined)), // Filter out undefined headers
                    ...body && { body: JSON.stringify(body) } // Spread body if it exists
                };

                return fetch(url, requestOptions).then(handleResponse);
            }
        }

        // helper functions
        async function handleResponse(response: any) {
            const isJson = response.headers?.get('content-type')?.includes('application/json');
            const data = isJson ? await response.json() : null;

            // check for error response
            if (!response.ok) {
                if (response.status === 401) {
                    setToken(null);
                    setUser(null);
                    setLogined(false);
                    router.push('/adminLogin');
                    return;
                }
                // get error message from body or default to response status
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }
            return data;
        }
    }

    return (
        <AdminContext.Provider
            value={{
                user,
                setUser,
                token,
                setToken,
                logined,
                setLogined,
                useFetch
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


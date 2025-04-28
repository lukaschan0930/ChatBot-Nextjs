'use client'
import { createContext, useContext, useState, useCallback } from "react";
import { AdminContextType, User } from "@/app/lib/interface";
import { useRouter } from "next/navigation";

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [logined, setLogined] = useState<boolean>(false);

    const useFetch = useCallback(() => {
        const router = useRouter();
        const get = async (url: string) => {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 401) {
                setLogined(false);
                setToken(null);
                setUser(null);
                router.push('/admin');
            }
            return response.json();
        };

        const post = async (url: string, body: any) => {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (response.status === 401) {
                setLogined(false);
                setToken(null);
                setUser(null);
                router.push('/admin');
            }
            return response.json();
        };

        const put = async (url: string, body: any) => {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (response.status === 401) {
                setLogined(false);
                setToken(null);
                setUser(null);
                router.push('/admin');
            }
            return response.json();
        };

        const del = async (url: string) => {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 401) {
                setLogined(false);
                setToken(null);
                setUser(null);
                router.push('/admin');
            }
            return response.json();
        };

        return { get, post, put, delete: del };
    }, [token]);

    return (
        <AdminContext.Provider
            value={{
                user,
                setUser,
                token,
                setToken,
                logined,
                setLogined,
                useFetch,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}


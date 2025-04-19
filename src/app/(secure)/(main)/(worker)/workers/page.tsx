"use client";
import ExplorerWorker from "@/app/components/intelligence/explorer/worker";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const Workers = () => {
    const router = useRouter();
    const [id, setId] = useState<string>("compute");
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <ExplorerWorker />
    )
}

export default Workers;
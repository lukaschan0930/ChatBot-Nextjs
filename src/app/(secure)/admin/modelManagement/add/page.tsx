'use client'

import { useAdmin } from "@/app/context/AdminContext";
import { useEffect, useState } from "react";
import { IAI } from "@/app/lib/interface";
import { toast } from "@/app/hooks/use-toast";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";

export default function AddEditModel() {
    const [model, setModel] = useState<Partial<IAI>>({
        name: '',
        inputCost: 0,
        outputCost: 0,
        multiplier: 1
    });
    const { useFetch } = useAdmin();
    const fetch = useFetch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const modelId = searchParams.get('id');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (modelId) {
            fetch.get(`/api/admin/aiModel/${modelId}`).then((res) => {
                if (res.status) {
                    setModel(res.data);
                } else {
                    toast({
                        description: res.message,
                        variant: "destructive"
                    });
                }
            }).catch((err) => {
                toast({
                    description: "Failed to fetch model",
                    variant: "destructive"
                });
            });
        }
    }, [modelId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (modelId) {
                const response = await fetch.put(`/api/admin/aiModel/${modelId}`, model);
                if (response.status) {
                    toast({
                        description: "Model updated successfully",
                    });
                    router.push('/admin/modelManagement');
                } else {
                    toast({
                        description: response.message,
                        variant: "destructive"
                    });
                }
            } else {
                const response = await fetch.post('/api/admin/aiModel', model);
                if (response.status) {
                    toast({
                        description: "Model created successfully",
                    });
                    router.push('/admin/modelManagement');
                } else {
                    toast({
                        description: response.message,
                        variant: "destructive"
                    });
                }
            }
        } catch (error) {
            toast({
                description: "An error occurred",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] px-4 mt-10 lg:mt-4">
            <div className="border-2 border-secondaryBorder rounded-[8px] px-10 py-10 lg:py-[60px] max-w-[900px] w-fit bg-[#FFFFFF05] overflow-y-auto">
                <h1 className="text-2xl font-bold mb-6 text-mainFont">{modelId ? 'Edit' : 'Add'} AI Model</h1>
                <form onSubmit={handleSubmit} className="lg:w-[600px] md:w-[400px] space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-mainFont">Name</label>
                        <Input
                            type="text"
                            value={model.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModel({ ...model, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-mainFont">Input Cost</label>
                        <Input
                            type="number"
                            step="0.0001"
                            value={model.inputCost}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModel({ ...model, inputCost: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-mainFont">Output Cost</label>
                        <Input
                            type="number"
                            step="0.0001"
                            value={model.outputCost}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModel({ ...model, outputCost: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-mainFont">Multiplier</label>
                        <Input
                            type="number"
                            step="0.1"
                            value={model.multiplier}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModel({ ...model, multiplier: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : modelId ? 'Update' : 'Create'} Model</Button>
                        <Button variant="outline" onClick={() => router.push('/admin/modelManagement')} disabled={loading}>Cancel</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

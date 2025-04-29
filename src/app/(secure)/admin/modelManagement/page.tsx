'use client'

import { useAdmin } from "@/app/context/AdminContext";
import { useEffect, useState } from "react";
import { IAI } from "@/app/lib/interface";
import { toast } from "@/app/hooks/use-toast";
import { Button } from "@/app/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/app/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@mui/material";
import { FaSearch } from "react-icons/fa";

export default function ModelManagement() {
    const [models, setModels] = useState<IAI[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { useFetch } = useAdmin();
    const fetch = useFetch();
    const router = useRouter();

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = () => {
        fetch.get('/api/admin/aiModel').then((res) => {
            if (res.status) {
                setModels(res.data);
            } else {
                toast({
                    description: res.message,
                    variant: "destructive"
                });
            }
        }).catch((err) => {
            toast({
                description: "Failed to fetch models",
                variant: "destructive"
            });
        });
    };

    const handleEdit = (model: IAI) => {
        router.push(`/admin/modelManagement/add?id=${model._id}`);
    };

    const handleDelete = async (model: IAI) => {
        if (window.confirm('Are you sure you want to delete this model?')) {
            try {
                const response = await fetch.delete(`/api/admin/aiModel/${model._id}`);
                if (response.status) {
                    toast({
                        description: "Model deleted successfully",
                    });
                    fetchModels();
                } else {
                    toast({
                        description: response.message,
                        variant: "destructive"
                    });
                }
            } catch (error) {
                toast({
                    description: "Failed to delete model",
                    variant: "destructive"
                });
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative w-full sm:w-[280px]">
                    <Input
                        type="text"
                        placeholder="Search"
                        className="px-2 py-2 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-subButtonFont" />
                </div>
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/admin/modelManagement/add')}>Add New Model</Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[150px]">Name</TableHead>
                            <TableHead className="min-w-[120px]">Input Cost</TableHead>
                            <TableHead className="min-w-[120px]">Output Cost</TableHead>
                            <TableHead className="min-w-[100px]">Multiplier</TableHead>
                            <TableHead className="min-w-[100px]">Provider</TableHead>
                            <TableHead className="min-w-[100px]">Model</TableHead>
                            <TableHead className="min-w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {models.filter((model) => model.name.toLowerCase().includes(searchQuery.toLowerCase())).map((model) => (
                            <TableRow key={model._id}>
                                <TableCell className="font-medium text-mainFont">{model.name}</TableCell>
                                <TableCell className="text-mainFont">${model.inputCost.toFixed(4)}</TableCell>
                                <TableCell className="text-mainFont">${model.outputCost.toFixed(4)}</TableCell>
                                <TableCell className="text-mainFont">{model.multiplier}x</TableCell>
                                <TableCell className="text-mainFont">{model.provider}</TableCell>
                                <TableCell className="text-mainFont">{model.model}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleEdit(model)}
                                            className="border-secondaryBorder hover:bg-[#FFFFFF10] bg-[#FFFFFF05] w-8 h-8 p-0"
                                        >
                                            <Pencil className="h-4 w-4 text-subButtonFont" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDelete(model)}
                                            className="border-secondaryBorder hover:bg-[#FFFFFF10] bg-[#FFFFFF05] w-8 h-8 p-0"
                                        >
                                            <Trash2 className="h-4 w-4 text-subButtonFont" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
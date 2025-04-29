import { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa6";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuSub,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useAtom } from "jotai";
import { routerModelAtom } from "@/app/lib/store";
import { IAI } from "@/app/lib/interface";
import { useToast } from "@/app/hooks/use-toast";

const RouterModelMenu = () => {
    const [routerModel, setRouterModel] = useAtom(routerModelAtom);
    const [model, setModel] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [routerModels, setRouterModels] = useState<IAI[]>([]);
    const { toast } = useToast();

    const handleItemClick = (itemId: string) => {
        setModel(routerModels.find((item) => item._id === itemId)?.name || "");
        setRouterModel(itemId);
    };

    const fetchRouterModels = async () => {
        try {
            const res = await fetch("/api/innovation/router/aiModel");
            const data = await res.json();
            if (data.status) {
                setRouterModels(data.data);
                setModel(data.data[0].name);
                setRouterModel(data.data[0]._id);
            } else {
                toast({
                    description: data.message,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                description: "Failed to fetch router models",
                variant: "destructive"
            });
        }
    }

    useEffect(() => {
        fetchRouterModels();
    }, []);

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className={`bg-btn-shadow rounded-lg p-[1px] border-0 focus:outline-none text-center`}>
                <p className="bg-[#292929] border-0 px-2 py-2 rounded-lg flex items-center justify-between gap-2 w-[190px]">
                    <p className="text-mainFont text-sm capitalize">{model}</p>
                    <FaChevronDown
                        className={`!w-4 !h-4 ${isOpen ? "rotate-180" : ""
                            } transition-all duration-150`}
                    />
                </p>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="bg-[#0E0E10] mt-[10px] border-[#1C1C1E]"
                align="start"
            >
                {routerModels.map((item, index) => (
                    <DropdownMenuSub key={item._id}>
                        <DropdownMenuCheckboxItem
                            checked={routerModel === item._id}
                            onCheckedChange={() => {
                                handleItemClick(item._id);
                            }}
                            className="text-mainFont hover:!text-mainFont cursor-pointer hover:!bg-[#2929293B] flex items-center justify-between px-3 py-2 [&>span]:hidden text-md"
                        >
                            <p className="flex-1">{item.name}</p>
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuSub>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default RouterModelMenu;
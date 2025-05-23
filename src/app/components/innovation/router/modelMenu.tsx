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
import { routerModelAtom, routerModelsAtom } from "@/app/lib/store";
import { IAI } from "@/app/lib/interface";
import { useToast } from "@/app/hooks/use-toast";

const RouterModelMenu = () => {
    const [model, setModel] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [routerModel, setRouterModel] = useAtom(routerModelAtom);
    const [routerModels, setRouterModels] = useAtom(routerModelsAtom);
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
                console.log("routermodel", routerModel);
                if (!routerModel) {
                    setModel(data.data[0].name);
                    !routerModel && setRouterModel(data.data[0]._id);
                } else {
                    setModel(routerModels.find((item) => item._id === routerModel)?.name || "");
                }
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
        routerModels.length == 0 && fetchRouterModels();
        !model && routerModels.length > 0 && setModel(routerModels[0].name)
    }, []);

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className={`bg-btn-shadow rounded-lg p-[1px] border-0 focus:outline-none text-center`}>
                <p className="bg-[#292929] border-0 px-2 py-2 rounded-lg flex items-center justify-between gap-2 w-[190px]">
                    <p className="text-mainFont text-sm capitalize">{routerModels.find((item) => item._id === routerModel)?.name}</p>
                    <FaChevronDown
                        className={`!w-4 !h-4 ${isOpen ? "rotate-180" : ""
                            } transition-all duration-150`}
                    />
                </p>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="bg-[#0E0E10] mt-[10px] border-[#1C1C1E] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

const AnalysisMenu = (
    { inputToken, outputToken, inputTime, outputTime }: 
    { inputToken: number, outputToken: number, inputTime: number, outputTime: number }
) => {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const totalToken = inputToken + outputToken;
    const totalTime = inputTime + outputTime;

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className="flex justify-between max-w-[250px] w-full items-center bg-inputBg px-3 border-secondaryBorder hover:border-tertiaryBorder rounded-lg h-10 text-mainFont text-xl focus:outline-none">
                <span className="flex-1 leading-none text-[16px] text-left">{totalTime > 0 ? `${Number((totalToken / totalTime).toFixed(2))} Tokens/sec` : '- Tokens/sec'}</span>
                <FaChevronDown
                    className={`${isOpen ? "rotate-180" : ""
                        } transition-all duration-150`}
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="bg-inputBg max-w-[250px] w-full border-secondaryBorder"
                align="start"
            >
                <table className="w-full text-center border-collapse text-mainFont text-sm">
                    <thead>
                        <tr>
                            <th></th>
                            <th style={{ borderBottom: '1px solid #333', padding: '10px' }}>Input</th>
                            <th style={{ borderBottom: '1px solid #333', padding: '10px' }}>Output</th>
                            <th style={{ borderBottom: '1px solid #333', padding: '10px' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Tokens</td>
                            <td style={{ padding: '10px' }}>{inputToken}</td>
                            <td style={{ padding: '10px' }}>{outputToken}</td>
                            <td style={{ padding: '10px' }}>{totalToken}</td>
                        </tr>
                        <tr>
                            <td>Time (s)</td>
                            <td style={{ padding: '10px' }}>{inputTime}</td>
                            <td style={{ padding: '10px' }}>{outputTime}</td>
                            <td style={{ padding: '10px' }}>{totalTime}</td>
                        </tr>

                        <tr>
                            <td>Speed (t/s)</td>
                            <td style={{ padding: '10px' }}>{inputTime > 0 ? Number((inputToken / inputTime).toFixed(2)) : '-'}</td>
                            <td style={{ padding: '10px' }}>{outputTime > 0 ? Number((outputToken / outputTime).toFixed(2)) : '-'}</td>
                            <td style={{ padding: '10px' }}>{totalTime > 0 ? Number((totalToken / totalTime).toFixed(2)) : '-'}</td>

                        </tr>
                    </tbody>
                </table>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default AnalysisMenu;

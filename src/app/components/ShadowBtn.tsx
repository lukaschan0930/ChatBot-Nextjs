import { cn } from "@/app/lib/utils";

interface FormBtnProps {
    value?: string,
    className?: string,
    disabled?: boolean,
    onClick?: () => void,
    children?: React.ReactNode,
    mainClassName?: string,
}

const ShadowBtn = ( props : FormBtnProps ) => {
    return (
        <div 
            onClick={props.disabled ? undefined : props.onClick}
            className={
                cn("bg-btn-shadow rounded-md p-[1px] border-0 focus:outline-none text-center",
                    props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                    props.className)
            } 
        >
            <div className={
                cn("bg-[#292929] border-0 px-2 py-2 rounded-md",
                    props.mainClassName)
            }>
                {
                    props.children
                }
            </div>
        </div>
    )
}

export default ShadowBtn;
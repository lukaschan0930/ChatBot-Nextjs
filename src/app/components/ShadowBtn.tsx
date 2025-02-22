import { cn } from "@/app/lib/utils";

interface FormBtnProps {
    name?: string,
    value?: string,
    className?: string,
    disabled?: boolean,
    onClick?: () => void,
    children?: React.ReactNode,
    mainClassName?: string,
}

const ShadowBtn = ( props : FormBtnProps ) => {
    return (
        <button 
            onClick={props.onClick}
            className={
                cn("bg-btn-shadow rounded-md p-[1px] border-0 focus:outline-none",
                    props.className)
            } 
            name={props.name} 
            disabled={props.disabled}
        >
            <div className={
                cn("bg-[#292929] border-0 px-2 py-2 rounded-md",
                    props.mainClassName)
            }>
                {
                    props.children
                }
            </div>
        </button>
    )
}

export default ShadowBtn;
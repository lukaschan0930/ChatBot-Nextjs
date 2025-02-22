import { cn } from "@/app/lib/utils";

interface FormBtnProps {
    name?: string,
    value?: string,
    className?: string,
    disabled?: boolean,
    onClick?: () => void,
    icon?: React.ReactNode,
    loading?: boolean,
    loadingText?: string,
    loadingIcon?: React.ReactNode,
    loadingClassName?: string,
}

const FormBtn = ( props : FormBtnProps ) => {
    return (
        <button 
            onClick={props.onClick} 
            className={
                cn("flex items-center justify-center gap-2 w-full border-[0.5px] border-[#FFFFFF21] hover:border-[#FFFFFF21] transition-all duration-300", 
                    props.className, 
                    props.loading && props.loadingClassName)
            } 
            name={props.name} 
            disabled={props.disabled || props.loading}
        >
            {props.loading && props.loadingIcon ? props.loadingIcon : props.icon}
            <span>{props.loading && props.loadingText ? props.loadingText : props.value}</span>
        </button>
    )
}

export default FormBtn;
import { cn } from "@/app/lib/utils";

interface FormInputProps {
    placeholder: string;
    type?: string;
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon?: React.ReactNode;
    className?: string;
}

const FormInput = (
    {
        placeholder,
        type,
        name,
        value,
        onChange,
        icon,
        className
    }: FormInputProps
) => {
  return (
    <div className={cn("relative w-full border-box-border border rounded-lg", className)}>
        <input 
            type={type}
            placeholder={placeholder}
            name={name}
            value={value}
            onChange={onChange} 
            className="w-full px-10 py-3 placeholder:text-box-placeholder rounded-md bg-box-bg text-white text-sm"
            autoComplete="off"
        />
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
    </div>
  )
}

export default FormInput;

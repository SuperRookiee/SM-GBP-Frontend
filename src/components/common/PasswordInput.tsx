import {useState, type ComponentProps} from "react";
import {Eye, EyeOff} from "lucide-react";
import {cn} from "@/utils/utils.ts";
import {Input} from "@/components/ui/input.tsx";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type"> & {
    containerClassName?: string;
    toggleButtonClassName?: string;
    showLabel?: string;
    hideLabel?: string;
    defaultVisible?: boolean;
};

const PasswordInput = ({
    className,
    containerClassName,
    toggleButtonClassName,
    showLabel = "Show password",
    hideLabel = "Hide password",
    defaultVisible = false,
    ...props
}: PasswordInputProps) => {
    const [visible, setVisible] = useState(defaultVisible);

    return (
        <div className={cn("relative", containerClassName)}>
            <Input
                type={visible ? "text" : "password"}
                className={cn("pr-10", className)}
                {...props}
            />
            <button
                type="button"
                className={cn("absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", toggleButtonClassName)}
                onClick={() => setVisible((prev) => !prev)}
                aria-label={visible ? hideLabel : showLabel}
            >
                {visible ? <Eye className="size-4"/> : <EyeOff className="size-4"/>}
            </button>
        </div>
    );
};

export {PasswordInput};

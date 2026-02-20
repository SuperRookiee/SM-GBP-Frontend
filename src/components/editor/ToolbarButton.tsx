import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ToolbarButtonProps {
    isActive?: boolean;
    onClick: () => void;
    icon?: ReactNode;
    label: string;
    disabled?: boolean;
}

const ToolbarButton = ({ isActive = false, onClick, icon, label, disabled = false }: ToolbarButtonProps) => {
    return (
        <Button
            type="button"
            size="sm"
            disabled={disabled}
            variant={isActive ? "default" : "outline"}
            className="min-w-10"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
        >
            {icon}
            <span>{label}</span>
        </Button>
    );
};

export default ToolbarButton;

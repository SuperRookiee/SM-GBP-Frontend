import {cn} from "@/utils/utils.ts";
import {Button} from "@/components/ui/button.tsx";

export interface LexicalToolbarButtonProps {
    isActive?: boolean;
    onClick: () => void;
    label: string;
}

const LexicalToolbarButton = ({ isActive = false, onClick, label }: LexicalToolbarButtonProps) => {
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("min-w-10", isActive && "bg-primary text-primary-foreground")}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
        >
            {label}
        </Button>
    );
};

export default LexicalToolbarButton;
